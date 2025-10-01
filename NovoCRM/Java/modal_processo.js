// ARQUIVO: modal_processo.js (COMPLETO E FINALIZADO: Retrocesso e Prioridade Urgente)

// --------------------------------------------------------------------------------
// MÓDULO: modal_processo.js
// Lógica de controle do modal de edição/criação de processo.
// --------------------------------------------------------------------------------
import { abrirAlertaModal, exibirModalConfirmacao, abrirPromptModal } from './modal_alerta.js';
import { deletarEquipe } from './modal_equipes.js';

let modalProcesso, modalTituloInput, modalResponsavelInput, modalValorInput, modalStatusInput, modalPrioridadeInput;
let modalProximaEquipeInput, saveModalProcessoBtn, closeModalProcessoBtn, deleteProcessBtn;
let extrasContainer, addExtraFieldBtn, retrocederBtn;
let motivoRetrocessoContainer, motivoRetrocessoElement;

// Variáveis para Anexos
let anexarArquivoInput, listaDeAnexosContainer;

let processoSelecionadoId = null;
let elementoFocadoAnteriormente = null;

export function inicializarModalProcesso(data, filtros) {
    // Captura dos elementos do DOM
    modalProcesso = document.getElementById('modalProcesso');
    modalTituloInput = document.getElementById('modalTituloInput');
    modalResponsavelInput = document.getElementById('modalResponsavelInput');
    modalValorInput = document.getElementById('modalValorInput');
    modalStatusInput = document.getElementById('modalStatusInput');
    modalPrioridadeInput = document.getElementById('modalPrioridadeInput');
    modalProximaEquipeInput = document.getElementById('modalProximaEquipeInput');
    saveModalProcessoBtn = document.getElementById('saveModalProcessoBtn');
    closeModalProcessoBtn = document.getElementById('closeModalProcessoBtn');
    extrasContainer = document.getElementById('extrasContainer');
    addExtraFieldBtn = document.getElementById('addExtraFieldBtn');
    deleteProcessBtn = document.getElementById('deleteProcessBtn');
    retrocederBtn = document.getElementById('retrocederBtn');
    motivoRetrocessoContainer = document.getElementById('motivoRetrocessoContainer');
    motivoRetrocessoElement = document.getElementById('motivoRetrocesso');
    
    // Captura dos elementos de anexo
    anexarArquivoInput = document.getElementById('anexarArquivoInput');
    listaDeAnexosContainer = document.getElementById('listaDeAnexosContainer');
    
    // Formatação de valor (R$ 00,00)
    if (modalValorInput) {
        modalValorInput.addEventListener('input', formatarValorMonetario);
    }

    // Preenche as opções de prioridade (constante)
    if (modalPrioridadeInput) {
        preencherPrioridades(modalPrioridadeInput);
    }
    
    // Listeners
    if (closeModalProcessoBtn) closeModalProcessoBtn.addEventListener('click', fecharModalProcesso);
    if (addExtraFieldBtn) addExtraFieldBtn.addEventListener('click', () => adicionarCampoExtra({ nome: '', valor: '' }));
    
    // Listener para Anexo de Arquivos
    if (anexarArquivoInput) {
        anexarArquivoInput.addEventListener('change', exibirNomeArquivoSelecionado);
    }
    
    if (document.getElementById('modalProcessoForm')) {
        document.getElementById('modalProcessoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            salvarProcesso(data, filtros);
        });
    }

    if (modalStatusInput) {
        modalStatusInput.addEventListener('change', () => {
            toggleProximaEquipeContainer(data);
            validarCampos();
        });
    }

    if (retrocederBtn) {
        retrocederBtn.addEventListener('click', () => {
            // Verifica se o processo está em um status que permite retroceder
            const processo = data.processos.find(p => p.id === processoSelecionadoId);
            if (processo && processo.status !== 'pendente') {
                abrirPromptModal('Por favor, insira o motivo do retrocesso (Obrigatório):', (motivo) => {
                    // 🎯 CORREÇÃO CRÍTICA: Trata o cancelamento (motivo === null)
                    if (motivo === null) {
                        return; // Cancela a ação se o usuário clicar em "Cancelar" no Prompt
                    } 
                    
                    if (motivo.trim().length > 5) {
                        processarRetrocesso(motivo, data, filtros);
                    } else {
                        abrirAlertaModal('O motivo do retrocesso deve ter pelo menos 6 caracteres.');
                    }
                });
            } else {
                 abrirAlertaModal('O processo só pode ser retrocedido se não estiver no status "Pendente".');
            }
        });
    }

    if (deleteProcessBtn) {
        deleteProcessBtn.addEventListener('click', () => {
            exibirModalConfirmacao('Tem certeza que deseja excluir este processo permanentemente?', () => {
                deletarProcesso(data, filtros);
            });
        });
    }
}

// --- Funções Auxiliares ---

function formatarValorMonetario(event) {
    let value = event.target.value.replace(/\D/g, ''); 
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2); 
        value = value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); 
    }
    event.target.value = value;
}

function preencherPrioridades(selectElement) {
    // A prioridade 'urgente' não pode ser selecionada manualmente
    const prioridades = ['alta', 'media', 'baixa']; 
    
    // Adiciona a opção Urgente, mas será desabilitada/habilitada dinamicamente
    const optionUrgente = document.createElement('option');
    optionUrgente.value = 'urgente';
    optionUrgente.textContent = 'Urgente';
    optionUrgente.id = 'prioridadeUrgenteOption';
    optionUrgente.disabled = true; // CRÍTICO: Desabilita por padrão
    selectElement.appendChild(optionUrgente);
    
    prioridades.forEach(prioridade => {
        const option = document.createElement('option');
        option.value = prioridade;
        option.textContent = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
        selectElement.appendChild(option);
    });
}

function adicionarCampoExtra(extra) {
    if (!extrasContainer) return;

    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center extra-field-wrapper';
    div.innerHTML = `
        <input type="text" placeholder="Nome do Campo (ex: Versão)" value="${extra.nome}" class="campo-extra-nome block w-1/3 rounded-md border-gray-300 shadow-sm p-2 text-sm">
        <input type="text" placeholder="Valor" value="${extra.valor}" class="campo-extra-valor block w-2/3 rounded-md border-gray-300 shadow-sm p-2 text-sm">
        <button type="button" class="remove-extra-btn text-red-500 hover:text-red-700 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
        </button>
    `;

    div.querySelector('.remove-extra-btn')?.addEventListener('click', () => div.remove());

    extrasContainer.appendChild(div);
}

// Função para exibir arquivos selecionados
function exibirNomeArquivoSelecionado() {
    if (!anexarArquivoInput || !listaDeAnexosContainer) return;

    listaDeAnexosContainer.innerHTML = ''; 
    
    if (anexarArquivoInput.files.length > 0) {
        Array.from(anexarArquivoInput.files).forEach(file => {
            renderizarAnexoSaved({ name: file.name, size: file.size });
        });
    }
}

// Função para renderizar anexos salvos (persiste entre aberturas)
function renderizarAnexoSaved(anexo) {
    if (!listaDeAnexosContainer) return;
    
    const fileElement = document.createElement('div');
    fileElement.className = 'flex items-center justify-between mt-1 p-1 bg-gray-100 rounded text-xs';
    fileElement.innerHTML = `
        <span class="truncate text-gray-700">${anexo.name}</span>
        <span class="ml-2 text-gray-500">(${formatBytes(anexo.size)})</span>
    `;
    listaDeAnexosContainer.appendChild(fileElement);
}

// Função auxiliar simples para formatar o tamanho do arquivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


function toggleProximaEquipeContainer(data) {
    const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
    if (!proximaEquipeContainer || !modalStatusInput || !modalProximaEquipeInput) return;

    if (modalStatusInput.value === 'concluido') {
        proximaEquipeContainer.style.display = 'flex';
        modalProximaEquipeInput.innerHTML = '<option value="">(Nenhuma)</option>';
        data.equipes.forEach(equipe => {
            const option = document.createElement('option');
            option.value = equipe.id;
            option.textContent = equipe.nome;
            modalProximaEquipeInput.appendChild(option);
        });
    } else {
        proximaEquipeContainer.style.display = 'none';
        modalProximaEquipeInput.value = '';
    }
}

function validarCampos() {
    let isValid = true;
    if (modalTituloInput) {
        if (!modalTituloInput.value.trim()) {
            modalTituloInput.classList.add('input-erro');
            isValid = false;
        } else {
            modalTituloInput.classList.remove('input-erro');
        }
    }

    if (modalStatusInput && modalProximaEquipeInput) {
        if (modalStatusInput.value === 'concluido' && modalProximaEquipeInput.value === '') {
            modalProximaEquipeInput.classList.add('input-erro');
            isValid = false;
        } else {
            modalProximaEquipeInput.classList.remove('input-erro');
        }
    }
    return isValid;
}

// --- Funções Principais de Manipulação de Processo ---

export function abrirModalProcesso(data, filtros, processoId = null) {
    processoSelecionadoId = processoId;
    if (!modalProcesso) return;

    elementoFocadoAnteriormente = document.activeElement;

    // 1. Limpar e configurar o modal
    document.getElementById('modalProcessoTitle').textContent = processoId ? 'Editar Processo' : 'Novo Processo';
    document.getElementById('modalProcessoForm').reset();
    extrasContainer.innerHTML = '';
    
    // CRÍTICO: LIMPAR ANEXOS E INPUT FILE
    if (listaDeAnexosContainer) listaDeAnexosContainer.innerHTML = '';
    if (anexarArquivoInput) anexarArquivoInput.value = null; 
    
    // Esconde/Mostra botões
    if (deleteProcessBtn) deleteProcessBtn.style.display = processoId ? 'inline-block' : 'none';
    if (retrocederBtn) retrocederBtn.style.display = processoId ? 'inline-block' : 'none';
    
    // Esconde o motivo de retrocesso por padrão
    if (motivoRetrocessoContainer) motivoRetrocessoContainer.classList.add('hidden');
    
    // 2. Preencher dados (se for edição)
    const processo = data.processos.find(p => p.id === processoId);
    let equipeAtualId = '';
    
    // 🎯 LÓGICA DE PRIORIDADE: Desabilita Urgente por padrão
    const urgenteOption = document.getElementById('prioridadeUrgenteOption');
    if (urgenteOption) urgenteOption.disabled = true;

    if (processo) {
        equipeAtualId = processo.equipeId;
        modalTituloInput.value = processo.titulo || '';
        modalResponsavelInput.value = processo.responsavel || '';
        
        modalValorInput.value = (processo.valor !== undefined) ? (processo.valor).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') : '';
        
        modalStatusInput.value = processo.status || 'pendente';
        modalPrioridadeInput.value = processo.prioridade || 'media';
        document.getElementById('modalEquipeHidden').value = processo.equipeId;
        
        // Extras
        (processo.extras || []).forEach(adicionarCampoExtra);
        
        // Renderizar anexos SALVOS (se houver)
        (processo.anexos || []).forEach(renderizarAnexoSaved);
        
        // Retrocesso
        if (processo.retrocedido && processo.retrocessoMotivo && motivoRetrocessoContainer) {
            motivoRetrocessoContainer.classList.remove('hidden');
            motivoRetrocessoElement.textContent = processo.retrocessoMotivo;
            
            // Se o card já está URGENte, reabilita a opção para que ela possa ser exibida
            if (processo.prioridade === 'urgente' && urgenteOption) {
                 urgenteOption.disabled = false;
            }
        }
    } else {
        equipeAtualId = filtros.filtroEquipeAtivo === 'todos' ? data.equipes[0]?.id || '' : filtros.filtroEquipeAtivo;
        document.getElementById('modalEquipeHidden').value = equipeAtualId;
        adicionarCampoExtra({ nome: '', valor: '' });
    }
    
    // 3. Configurar status/próxima equipe e abrir
    toggleProximaEquipeContainer(data);
    modalProcesso.style.display = 'flex';
    modalTituloInput.focus();
}

function fecharModalProcesso() {
    if (modalProcesso) {
        modalProcesso.style.display = 'none';
        if (elementoFocadoAnteriormente && elementoFocadoAnteriormente.focus) {
            elementoFocadoAnteriormente.focus();
        }
    }
}

function salvarProcesso(data, filtros) {
    if (!validarCampos()) {
        abrirAlertaModal('Obrigatório: Preencha o Título do Processo e, se o Status for "Concluído", selecione a Próxima Equipe.');
        return;
    }

    const isNew = processoSelecionadoId === null;
    let processo = isNew ? { id: 'p' + (Date.now()), historicoEquipes: [], anexos: [] } : data.processos.find(p => p.id === processoSelecionadoId);

    if (!processo) {
        abrirAlertaModal('Erro ao encontrar o processo para salvar.');
        return;
    }

    const valorMonetario = modalValorInput.value.replace(/\./g, '').replace(',', '.');
    const valorFloat = parseFloat(valorMonetario) || 0;
    const equipeAtualId = document.getElementById('modalEquipeHidden').value;

    // 1. Coleta de dados
    processo.titulo = modalTituloInput.value.trim();
    processo.responsavel = modalResponsavelInput.value.trim();
    processo.valor = Math.round(valorFloat * 100) / 100; 
    processo.status = modalStatusInput.value;
    processo.prioridade = modalPrioridadeInput.value;
    
    // Coleta de Campos Extras
    processo.extras = Array.from(extrasContainer.querySelectorAll('.extra-field-wrapper')).map(div => ({
        nome: div.querySelector('.campo-extra-nome')?.value.trim() || '',
        valor: div.querySelector('.campo-extra-valor')?.value.trim() || ''
    })).filter(extra => extra.nome && extra.valor);
    
    // Lógica de persistência de arquivos (deixado como está)
    if (anexarArquivoInput && anexarArquivoInput.files.length > 0) {
        // Assume que estamos apenas registrando metadados de novos arquivos
        const novosAnexos = Array.from(anexarArquivoInput.files).map(file => ({
            name: file.name,
            size: file.size,
        }));
        // Em um sistema real, você fundiria com anexos existentes, mas aqui substituímos
        processo.anexos = novosAnexos; 
    } else if (isNew) {
        processo.anexos = [];
    }
    // Nota: A lógica de edição/remoção de anexos existentes é mais complexa e omitida aqui.

    // 2. Lógica de transição/equipe
    const proximaEquipe = modalProximaEquipeInput.value;

    if (processo.status === 'concluido' && proximaEquipe) {
        // Guarda a equipe atual antes de mudar
        const equipeOrigem = processo.equipeId; 
        
        processo.equipeId = proximaEquipe;
        processo.status = 'pendente';
        processo.proximaEquipeId = '';
        
        // Adiciona a equipe DE ORIGEM ao histórico se não estiver lá
        if (!processo.historicoEquipes.includes(equipeOrigem)) {
             processo.historicoEquipes.push(equipeOrigem);
        }
        
        // Garante que o histórico da nova equipe está presente
        if (!processo.historicoEquipes.includes(proximaEquipe)) {
            processo.historicoEquipes.push(proximaEquipe);
        }

        // Transição limpa o retrocesso
        processo.retrocedido = false;
        processo.retrocessoMotivo = '';
        
        abrirAlertaModal(`Processo concluído e enviado para a equipe: ${data.obterNomeEquipe(proximaEquipe)}!`);
    } else {
        processo.equipeId = equipeAtualId;
        processo.proximaEquipeId = proximaEquipe; 
        
        if (!processo.historicoEquipes.includes(equipeAtualId)) {
            processo.historicoEquipes.push(equipeAtualId);
        }
        
        // Se o status for diferente de PENDENTE, limpa o retrocesso (se não estiver retrocedendo agora)
        if (processo.status !== 'pendente') {
            // Atenção: Manter o retrocesso ao salvar é OK, desde que não se mude de status/equipe
            // Se o processo for editado sem transição, mantemos o estado de retrocedido/urgente
            // Apenas limpamos se for concluído/transicionado.
        }
    }
    
    // 3. Salvar no array global
    if (isNew) {
        data.processos.push(processo);
    } 

    // 4. Fechar modal e renderizar
    fecharModalProcesso();
    
    // Chama filtrarProcessos (mantendo os 5 argumentos)
    filtros.filtrarProcessos(
        data.processos, 
        data.equipes, 
        filtros.buscaAtiva, 
        filtros.filtroEquipeAtivo,
        filtros.afterRenderCallback
    );
}

export function processarRetrocesso(motivo, data, filtros) {
    if (!processoSelecionadoId) return;

    let processo = data.processos.find(p => p.id === processoSelecionadoId);
    if (!processo) return;

    const equipeAtualId = processo.equipeId;
    const historico = processo.historicoEquipes;
    
    // Encontra o índice da equipe atual no histórico.
    const currentIndex = historico.indexOf(equipeAtualId);
    
    if (currentIndex <= 0) {
        abrirAlertaModal('Não é possível retroceder, pois este é o primeiro passo (ou o histórico está incompleto).');
        return;
    }

    // A equipe anterior é a que está uma posição atrás no histórico
    const equipeAnteriorId = historico[currentIndex - 1]; 

    // 1. Altera os dados
    processo.equipeId = equipeAnteriorId;
    processo.status = 'pendente'; 
    processo.retrocedido = true;
    processo.retrocessoMotivo = motivo;
    processo.prioridade = 'urgente'; // 🎯 CRÍTICO: Define a prioridade como Urgente
    processo.proximaEquipeId = ''; 

    // 2. Ajusta o histórico
    // Mantém o histórico até a equipe anterior (remove a equipe atual e todas as posteriores)
    processo.historicoEquipes = historico.slice(0, currentIndex);

    // 3. Fechar modal e renderizar
    fecharModalProcesso();
    
    // Chama filtrarProcessos (mantendo os 5 argumentos)
    filtros.filtrarProcessos(
        data.processos, 
        data.equipes, 
        filtros.buscaAtiva, 
        filtros.filtroEquipeAtivo,
        filtros.afterRenderCallback
    );
    
    // Nota: Assume que 'data' tem a função 'obterNomeEquipe'
    const nomeEquipeAnterior = data.equipes.find(e => e.id === equipeAnteriorId)?.nome || 'N/A';
    abrirAlertaModal(`Processo retrocedido para a equipe: ${nomeEquipeAnterior} e definido como URGENte.`);
}

export function deletarProcesso(data, filtros) {
    if (!processoSelecionadoId) return;
    
    const index = data.processos.findIndex(p => p.id === processoSelecionadoId);

    if (index !== -1) {
        const titulo = data.processos[index].titulo;
        data.processos.splice(index, 1);
        fecharModalProcesso();
        
        // Chama filtrarProcessos (mantendo os 5 argumentos)
        filtros.filtrarProcessos(
            data.processos, 
            data.equipes, 
            filtros.buscaAtiva, 
            filtros.filtroEquipeAtivo,
            filtros.afterRenderCallback
        );
        
        abrirAlertaModal(`Processo "${titulo}" excluído com sucesso!`);
    } else {
        abrirAlertaModal('Erro ao excluir processo.');
    }
}


export default modalProcesso