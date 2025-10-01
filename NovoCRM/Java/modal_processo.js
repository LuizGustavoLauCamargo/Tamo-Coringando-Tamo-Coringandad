// ARQUIVO: modal_processo.js (CORRIGIDO)

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
            abrirPromptModal('Por favor, insira o motivo do retrocesso (Obrigatório):', (motivo) => {
                if (motivo && motivo.trim().length > 5) {
                    processarRetrocesso(motivo, data, filtros);
                } else {
                    abrirAlertaModal('O motivo do retrocesso deve ter pelo menos 6 caracteres.');
                }
            });
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
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2); // Divide por 100 para adicionar 2 casas decimais
        value = value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Formato R$ 0.000,00
    }
    event.target.value = value;
}

function preencherPrioridades(selectElement) {
    const prioridades = ['urgente', 'alta', 'media', 'baixa'];
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
    div.className = 'flex gap-2 items-center';
    div.innerHTML = `
        <input type="text" placeholder="Nome do Campo (ex: Versão)" value="${extra.nome}" class="campo-extra-nome block w-1/3 rounded-md border-gray-300 shadow-sm p-2 text-sm">
        <input type="text" placeholder="Valor" value="${extra.valor}" class="campo-extra-valor block w-2/3 rounded-md border-gray-300 shadow-sm p-2 text-sm">
        <button type="button" class="remove-extra-btn text-red-500 hover:text-red-700 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
        </button>
    `;

    // Adiciona listener de remoção
    div.querySelector('.remove-extra-btn')?.addEventListener('click', () => div.remove());

    extrasContainer.appendChild(div);
}

function toggleProximaEquipeContainer(data) {
    const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
    if (!proximaEquipeContainer || !modalStatusInput || !modalProximaEquipeInput) return;

    // Se o status for "Concluído", mostra a seleção da próxima equipe
    if (modalStatusInput.value === 'concluido') {
        proximaEquipeContainer.style.display = 'flex';
        // Preenche as opções de equipes
        modalProximaEquipeInput.innerHTML = '<option value="">(Nenhuma)</option>';
        data.equipes.forEach(equipe => {
            const option = document.createElement('option');
            option.value = equipe.id;
            option.textContent = equipe.nome;
            modalProximaEquipeInput.appendChild(option);
        });
    } else {
        proximaEquipeContainer.style.display = 'none';
        modalProximaEquipeInput.value = ''; // Limpa o valor se for escondido
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
        // Se status for 'concluido' E a próxima equipe for '(Nenhuma)', é inválido.
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

    // Salva o elemento focado para restaurar depois
    elementoFocadoAnteriormente = document.activeElement;

    // 1. Limpar e configurar o modal
    document.getElementById('modalProcessoTitle').textContent = processoId ? 'Editar Processo' : 'Novo Processo';
    document.getElementById('modalProcessoForm').reset();
    extrasContainer.innerHTML = '';
    
    // Esconde/Mostra botões
    if (deleteProcessBtn) deleteProcessBtn.style.display = processoId ? 'inline-block' : 'none';
    if (retrocederBtn) retrocederBtn.style.display = processoId ? 'inline-block' : 'none';
    
    // Esconde o motivo de retrocesso por padrão
    if (motivoRetrocessoContainer) motivoRetrocessoContainer.classList.add('hidden');
    
    // 2. Preencher dados (se for edição)
    const processo = data.processos.find(p => p.id === processoId);
    let equipeAtualId = '';

    if (processo) {
        equipeAtualId = processo.equipeId;
        modalTituloInput.value = processo.titulo || '';
        modalResponsavelInput.value = processo.responsavel || '';
        
        // Formata o valor para exibição (R$ 0.000,00) - Corrigido para float/R$
        // A formatação original (toFixed(2)...) está correta AQUI se o valor for float.
        modalValorInput.value = (processo.valor !== undefined) ? (processo.valor).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') : '';
        
        modalStatusInput.value = processo.status || 'pendente';
        modalPrioridadeInput.value = processo.prioridade || 'media';
        document.getElementById('modalEquipeHidden').value = processo.equipeId; // Guarda a equipe atual
        
        // Extras
        (processo.extras || []).forEach(adicionarCampoExtra);
        
        // Retrocesso
        if (processo.retrocedido && processo.retrocessoMotivo && motivoRetrocessoContainer) {
            motivoRetrocessoContainer.classList.remove('hidden');
            motivoRetrocessoElement.textContent = processo.retrocessoMotivo;
        }
    } else {
        // Processo novo: pega a equipe do filtro ativo, se houver
        equipeAtualId = filtros.filtroEquipeAtivo === 'todos' ? data.equipes[0]?.id || '' : filtros.filtroEquipeAtivo;
        document.getElementById('modalEquipeHidden').value = equipeAtualId;
        // Adiciona um campo extra vazio se for novo
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
        // Restaura o foco para o elemento anterior (por exemplo, o botão Novo Processo)
        if (elementoFocadoAnteriormente && elementoFocadoAnteriormente.focus) {
            elementoFocadoAnteriormente.focus();
        }
    }
}

export function salvarProcesso(data, filtros) {
    if (!validarCampos()) {
        abrirAlertaModal('Obrigatório: Preencha o Título do Processo e, se o Status for "Concluído", selecione a Próxima Equipe.');
        return;
    }

    const isNew = processoSelecionadoId === null;
    let processo = isNew ? { id: 'p' + (Date.now()), historicoEquipes: [] } : data.processos.find(p => p.id === processoSelecionadoId);

    if (!processo) {
        abrirAlertaModal('Erro ao encontrar o processo para salvar.');
        return;
    }

    // Converte o valor monetário de volta para float (em Reais)
    const valorMonetario = modalValorInput.value.replace(/\./g, '').replace(',', '.');
    const valorFloat = parseFloat(valorMonetario) || 0;
    const equipeAtualId = document.getElementById('modalEquipeHidden').value;

    // 1. Coleta de dados
    processo.titulo = modalTituloInput.value.trim();
    processo.responsavel = modalResponsavelInput.value.trim();
    // Salva o valor como float arredondado para duas casas decimais
    processo.valor = Math.round(valorFloat * 100) / 100; 
    processo.status = modalStatusInput.value;
    processo.prioridade = modalPrioridadeInput.value;
    processo.extras = Array.from(extrasContainer.children).map(div => ({
        nome: div.querySelector('.campo-extra-nome')?.value.trim() || '',
        valor: div.querySelector('.campo-extra-valor')?.value.trim() || ''
    })).filter(extra => extra.nome && extra.valor);

    // 2. Lógica de transição/equipe
    const proximaEquipe = modalProximaEquipeInput.value;

    if (processo.status === 'concluido' && proximaEquipe) {
        // Se concluído e tem próxima equipe: move o processo
        processo.equipeId = proximaEquipe;
        processo.status = 'pendente'; // Reseta para pendente na nova equipe
        processo.proximaEquipeId = ''; // Limpa a próxima equipe
        
        if (!processo.historicoEquipes.includes(proximaEquipe)) {
            processo.historicoEquipes.push(proximaEquipe);
        }

        processo.retrocedido = false;
        processo.retrocessoMotivo = '';
        
        abrirAlertaModal(`Processo concluído e enviado para a equipe: ${data.obterNomeEquipe(proximaEquipe)}!`);
    } else {
        // Se não houver mudança de equipe, garante que a equipeId seja a atual
        processo.equipeId = equipeAtualId;
        processo.proximaEquipeId = proximaEquipe; 
        if (!processo.historicoEquipes.includes(equipeAtualId)) {
            processo.historicoEquipes.push(equipeAtualId);
        }
        if (processo.status !== 'pendente') {
            processo.retrocedido = false;
            processo.retrocessoMotivo = '';
        }
    }
    
    // 3. Salvar no array global
    if (isNew) {
        data.processos.push(processo);
    } 

    // 4. Fechar modal e renderizar
    fecharModalProcesso();
    
    // ✅ CORREÇÃO APLICADA: Chama filtrarProcessos com 5 argumentos (o afterRenderCallback é o 5º)
    filtros.filtrarProcessos(
        data.processos, 
        data.equipes, 
        filtros.buscaAtiva, 
        filtros.filtroEquipeAtivo,
        filtros.afterRenderCallback // Argumento crucial para re-anexar listeners!
    );
}

export function processarRetrocesso(motivo, data, filtros) {
    if (!processoSelecionadoId) return;

    let processo = data.processos.find(p => p.id === processoSelecionadoId);
    if (!processo) return;

    // Encontra a equipe anterior no histórico
    const equipeAtual = processo.equipeId;
    const historicoIndex = processo.historicoEquipes.indexOf(equipeAtual);
    const equipeAnteriorId = historicoIndex > 0 ? processo.historicoEquipes[historicoIndex - 1] : null;

    if (!equipeAnteriorId) {
        abrirAlertaModal('Não é possível retroceder, pois este é o primeiro passo do processo.');
        return;
    }

    // 1. Altera os dados
    processo.equipeId = equipeAnteriorId;
    processo.status = 'pendente'; 
    processo.retrocedido = true;
    processo.retrocessoMotivo = motivo;
    processo.proximaEquipeId = ''; 

    // 2. Remove o histórico da equipe atual
    processo.historicoEquipes.splice(historicoIndex, 1);

    // 3. Fechar modal e renderizar
    fecharModalProcesso();
    
    // ✅ CORREÇÃO APLICADA: Chama filtrarProcessos com 5 argumentos
    filtros.filtrarProcessos(
        data.processos, 
        data.equipes, 
        filtros.buscaAtiva, 
        filtros.filtroEquipeAtivo,
        filtros.afterRenderCallback // Argumento crucial!
    );
    
    abrirAlertaModal(`Processo retrocedido para a equipe: ${data.obterNomeEquipe(equipeAnteriorId)}.`);
}

export function deletarProcesso(data, filtros) {
    if (!processoSelecionadoId) return;
    
    const index = data.processos.findIndex(p => p.id === processoSelecionadoId);

    if (index !== -1) {
        const titulo = data.processos[index].titulo;
        data.processos.splice(index, 1);
        fecharModalProcesso();
        
        // ✅ CORREÇÃO APLICADA: Chama filtrarProcessos com 5 argumentos
        filtros.filtrarProcessos(
            data.processos, 
            data.equipes, 
            filtros.buscaAtiva, 
            filtros.filtroEquipeAtivo,
            filtros.afterRenderCallback // Argumento crucial!
        );
        
        abrirAlertaModal(`Processo "${titulo}" excluído com sucesso!`);
    } else {
        abrirAlertaModal('Erro ao excluir processo.');
    }
}


export default modalProcesso