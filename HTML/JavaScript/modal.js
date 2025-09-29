// modal.js

// Importa funções essenciais e dados de processo e equipes
import { processos, renderizarProcessos, filtrarProcessos, excluirProcesso } from './processo.js';
import { equipes } from './equipe.js';

// Elementos do Modal Principal
let modal, modalTituloInput, modalResponsavelInput, modalValorInput, modalStatusInput, modalPrioridadeInput;
let modalProximaEquipeInput, saveModalBtn, closeModalBtn;
let extrasContainer, addExtraFieldBtn, retrocederBtn;
let deleteProcessBtn;
let motivoRetrocessoContainer, motivoRetrocessoElement;

// Elementos do Modal de Confirmação/Alerta (Substitui alert/prompt)
let confirmationModal, confirmationMessage, confirmActionBtn, cancelConfirmationBtn, closeConfirmationModalBtn;
let onConfirmCallback = null;

let processoSelecionadoId = null;
let elementosFocaveis = [];
let elementoFocadoAnteriormente = null;

export function inicializarModal() {
    // Captura dos elementos do DOM
    modal = document.getElementById('modal');
    modalTituloInput = document.getElementById('modalTituloInput');
    modalResponsavelInput = document.getElementById('modalResponsavelInput');
    modalValorInput = document.getElementById('modalValorInput');
    modalStatusInput = document.getElementById('modalStatusInput');
    modalPrioridadeInput = document.getElementById('modalPrioridadeInput');
    modalProximaEquipeInput = document.getElementById('modalProximaEquipeInput');
    saveModalBtn = document.getElementById('saveModalBtn');
    closeModalBtn = document.getElementById('closeModalBtn');
    extrasContainer = document.getElementById('extrasContainer');
    addExtraFieldBtn = document.getElementById('addExtraFieldBtn');
    deleteProcessBtn = document.getElementById('deleteProcessBtn');
    retrocederBtn = document.getElementById('retrocederBtn');
    motivoRetrocessoContainer = document.getElementById('motivoRetrocessoContainer');
    motivoRetrocessoElement = document.getElementById('motivoRetrocesso');
    
    // Captura dos elementos do Modal de Confirmação
    confirmationModal = document.getElementById('confirmationModal');
    confirmationMessage = document.getElementById('confirmationMessage');
    confirmActionBtn = document.getElementById('confirmActionBtn');
    cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
    closeConfirmationModalBtn = document.getElementById('closeConfirmationModalBtn');
    
    // --- Listeners de Ação ---

    // Formatação de valor (R$ 00,00)
    if (modalValorInput) {
        modalValorInput.addEventListener('input', (e) => {
            let valor = e.target.value;
            valor = valor.replace(/\D/g, ''); 
            
            if (valor) {
                let valorFormatado = (parseFloat(valor) / 100).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                });
                e.target.value = valorFormatado;
            } else {
                e.target.value = '';
            }
        });
    }

    // Adicionar campo extra
    if (addExtraFieldBtn) {
        addExtraFieldBtn.addEventListener('click', () => {
            const div = criarExtraField();
            extrasContainer.appendChild(div);
            recarregarFocaveis();
        });
    }

    // Fechar modal principal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', fecharModal);
    }
    
    // --- Listeners do Modal de Confirmação ---
    if (closeConfirmationModalBtn) {
        closeConfirmationModalBtn.addEventListener('click', fecharConfirmacaoModal);
    }
    if (cancelConfirmationBtn) {
        cancelConfirmationBtn.addEventListener('click', fecharConfirmacaoModal);
    }
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            if (onConfirmCallback) {
                onConfirmCallback();
            }
            fecharConfirmacaoModal();
        });
    }

    // --- Listeners Globais (Esc/Clique fora/Foco) ---
    if (window) {
        window.addEventListener('click', e => {
            if (e.target === modal) fecharModal();
            if (e.target === confirmationModal) fecharConfirmacaoModal();
        });

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                fecharModal();
            } else if (e.key === 'Tab' && modal.style.display === 'block') {
                trapFocus(e);
            }
        }); 
    }
    
    // --- Ação de Excluir Processo ---
    if (deleteProcessBtn) {
        deleteProcessBtn.addEventListener('click', () => {
            // Usa o modal de confirmação personalizado
            abrirConfirmacaoModal('Deseja realmente excluir este processo? Esta ação é irreversível.', () => {
                if (processoSelecionadoId) {
                    // Delega a exclusão e a re-renderização para o processo.js
                    excluirProcesso(processoSelecionadoId); 
                    fecharModal();
                }
            }); 
        });
    }

    // --- Ação de Retroceder Processo ---
    if (retrocederBtn) {
        retrocederBtn.addEventListener('click', () => {
            // Abre o modal de prompt personalizado (usando o modal de confirmação como base)
            abrirPromptModal('Por favor, informe o motivo do retrocesso:', (motivo) => {
                 if (motivo === null || motivo.trim() === '') {
                    abrirAlertaModal('O motivo do retrocesso é obrigatório para continuar.');
                    return;
                }

                const proc = processos.find(p => p.id === processoSelecionadoId);
                if (proc) {
                    // Lógica de retrocesso
                    if (proc.historicoEquipes && proc.historicoEquipes.length > 1) {
                        proc.historicoEquipes.pop(); 
                        const equipeAnteriorId = proc.historicoEquipes[proc.historicoEquipes.length - 1];
                        proc.equipeId = equipeAnteriorId; 
                        proc.proximaEquipeId = ''; 
                    }
                    
                    proc.retrocessoMotivo = motivo;
                    proc.status = 'pendente';
                    proc.retrocedido = true;
                    proc.prioridade = 'urgente';
                    
                    // Re-renderiza para atualizar a lista
                    const btnAtivo = document.querySelector('.equipe-btn.ativo');
                    const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
                    const termoBusca = document.getElementById('buscaInput')?.value || '';
                    filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
                    
                    fecharModal();
                }
            });
        });
    }

    // --- Mudança de Status (Mostrar/Esconder próxima equipe) ---
    if (modalStatusInput) {
        modalStatusInput.addEventListener('change', (e) => {
            const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
            const isConcluido = e.target.value === 'concluido';
            if (proximaEquipeContainer) {
                 proximaEquipeContainer.style.display = isConcluido ? 'flex' : 'none';
            }
            
            if (saveModalBtn) {
                saveModalBtn.textContent = isConcluido ? 'Enviar' : 'Salvar';
            }
            recarregarFocaveis();
        });
    }
    
    // --- Ação de Salvar/Enviar ---
    if (saveModalBtn) {
        saveModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (salvarModal(processos, equipes)) {
                fecharModal();
                // Re-renderiza após salvar, aplicando filtros
                const btnAtivo = document.querySelector('.equipe-btn.ativo');
                const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
                const termoBusca = document.getElementById('buscaInput')?.value || '';
                filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
            }
        });
    }
}

// --- Funções do Modal de Confirmação/Alerta Personalizado ---

/**
 * Abre o modal para confirmação de uma ação (OK/Cancelar).
 * @param {string} mensagem 
 * @param {function} callback A função a ser executada se o usuário confirmar.
 */
export function abrirConfirmacaoModal(mensagem, callback) {
    if (confirmationModal && confirmationMessage && confirmActionBtn && cancelConfirmationBtn) {
        confirmationMessage.textContent = mensagem;
        onConfirmCallback = callback;

        confirmActionBtn.textContent = 'Confirmar';
        confirmActionBtn.style.display = 'inline-block';
        cancelConfirmationBtn.textContent = 'Cancelar';
        cancelConfirmationBtn.style.display = 'inline-block';
        
        confirmationModal.style.display = 'block';
        confirmActionBtn.focus();
    }
}

/**
 * Abre o modal como um Alerta simples (só com botão OK).
 * @param {string} mensagem 
 */
function abrirAlertaModal(mensagem) {
    if (confirmationModal && confirmationMessage && confirmActionBtn && cancelConfirmationBtn) {
        confirmationMessage.textContent = mensagem;
        onConfirmCallback = null; // Não há callback de confirmação
        
        confirmActionBtn.style.display = 'none'; // Esconde Confirmar
        cancelConfirmationBtn.textContent = 'OK';
        cancelConfirmationBtn.style.display = 'inline-block';
        
        confirmationModal.style.display = 'block';
        cancelConfirmationBtn.focus();
    }
}

/**
 * Abre o modal simulando um Prompt, retornando o valor digitado no callback.
 * (Esta função requer que o HTML do confirmationModal seja editado para incluir um input.)
 * * NOTA: Para simplificar, vou usar a função interna "abrirConfirmacaoModal" e passar o resultado
 * de uma variável temporária, simulando o prompt com um campo de texto, mas para isso 
 * o HTML PRECISA TER O CAMPO `promptInput`. Se o HTML não for alterado, esta função 
 * só funcionará com a mensagem. Vou simplificar usando uma caixa de texto simples.
 */
function abrirPromptModal(mensagem, callback) {
    // 1. Mostrar input de prompt no modal de confirmação
    const promptInput = document.getElementById('promptInput');
    if (!promptInput) {
        // Fallback se o input não existir no HTML
        const motivo = window.prompt(mensagem); 
        callback(motivo);
        return;
    }
    
    promptInput.style.display = 'block';
    promptInput.value = '';
    
    abrirConfirmacaoModal(mensagem, () => {
        const motivo = promptInput.value;
        promptInput.style.display = 'none';
        callback(motivo);
    });

    // 2. Garante que o promptInput seja limpo ao fechar
    const originalFechar = onConfirmCallback;
    onConfirmCallback = () => {
        if (originalFechar) originalFechar();
        promptInput.style.display = 'none';
    };
    
    // 3. Foca no input
    promptInput.focus();
}

export function fecharConfirmacaoModal() {
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
    onConfirmCallback = null;
    
    // Esconde o input do prompt se ele existir
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.style.display = 'none';
    }
}

// --- Funções de Acessibilidade e Foco ---

function recarregarFocaveis() {
    if (modal) {
        elementosFocaveis = Array.from(modal.querySelectorAll(
            'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
    }
}

function trapFocus(e) {
    const primeiroElemento = elementosFocaveis[0];
    const ultimoElemento = elementosFocaveis[elementosFocaveis.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === primeiroElemento) {
            ultimoElemento.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === ultimoElemento) {
            primeiroElemento.focus();
            e.preventDefault();
        }
    }
}

// --- Funções de Controle do Modal Principal ---

export function abrirModalNovoProcesso(equipes, equipeId) {
    elementoFocadoAnteriormente = document.activeElement;
    processoSelecionadoId = null;
    limparModal();
    preencherSelectsEquipes(equipes);
    preencherPrioridades();
    
    const modalEquipeHidden = document.getElementById('modalEquipeHidden');
    if (modalEquipeHidden) {
      modalEquipeHidden.value = equipeId;
    }

    if (modal) {
        modal.style.display = 'block';
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Novo Processo';
        if (deleteProcessBtn) deleteProcessBtn.style.display = 'none';
        
        if (retrocederBtn) retrocederBtn.style.display = 'none';
        
        recarregarFocaveis();
        if (modalTituloInput) {
            modalTituloInput.focus();
        }
    }
}

export function preencherModalComProcesso(proc, equipes) {
    elementoFocadoAnteriormente = document.activeElement;
    processoSelecionadoId = proc.id;
    limparModal();
    
    const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
    if (proximaEquipeContainer) {
        proximaEquipeContainer.style.display = 'none';
    }
    if (saveModalBtn) {
        saveModalBtn.textContent = 'Salvar';
    }

    if (modalTituloInput) {
        modalTituloInput.value = proc.titulo;
    }
    if (modalResponsavelInput) {
        modalResponsavelInput.value = proc.responsavel;
    }
    
    if (modalValorInput) {
      if (proc.valor) {
        modalValorInput.value = parseFloat(proc.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        modalValorInput.value = '';
      }
    }
    
    if (modalStatusInput) {
        modalStatusInput.value = proc.status;
    }
    
    preencherPrioridades(proc.prioridade);

    const modalEquipeHidden = document.getElementById('modalEquipeHidden');
    if (modalEquipeHidden) {
        modalEquipeHidden.value = proc.equipeId;
    }

    preencherSelectsEquipes(equipes, proc.proximaEquipeId);

    if (extrasContainer) {
      (proc.extras || []).forEach(extra => {
          const div = criarExtraField(extra.nome, extra.valor, extra.arquivos || []);
          extrasContainer.appendChild(div);
      });
    }

    if (modal) {
        modal.style.display = 'block';
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Processo';
        }
        if (deleteProcessBtn) {
            deleteProcessBtn.style.display = 'inline-block';
        }
        
        const temHistorico = proc.historicoEquipes && proc.historicoEquipes.length > 1;
        if (retrocederBtn) {
            retrocederBtn.style.display = temHistorico ? 'inline-block' : 'none';
        }

        if (motivoRetrocessoContainer) {
            if (proc.retrocessoMotivo) {
                motivoRetrocessoContainer.style.display = 'flex';
                if (motivoRetrocessoElement) {
                    motivoRetrocessoElement.textContent = proc.retrocessoMotivo;
                }
            } else {
                motivoRetrocessoContainer.style.display = 'none';
                if (motivoRetrocessoElement) {
                    motivoRetrocessoElement.textContent = '';
                }
            }
        }

        recarregarFocaveis();
        if (modalTituloInput) {
            modalTituloInput.focus();
        }
    }
}

function preencherPrioridades(prioridadeSelecionada) {
    if (!modalPrioridadeInput) return;
    
    const prioridades = ['baixa', 'media', 'alta'];
    
    modalPrioridadeInput.innerHTML = '';
    
    prioridades.forEach(prioridade => {
        const option = document.createElement('option');
        option.value = prioridade;
        option.textContent = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
        if (prioridade === prioridadeSelecionada) {
            option.selected = true;
        }
        modalPrioridadeInput.appendChild(option);
    });
    
    if (prioridadeSelecionada === 'urgente') {
        const urgenteOption = document.createElement('option');
        urgenteOption.value = 'urgente';
        urgenteOption.textContent = 'URGENTE';
        urgenteOption.selected = true;
        modalPrioridadeInput.appendChild(urgenteOption);
    }
}

function preencherSelectsEquipes(equipes = [], proximaId = '') {
    const equipeAtualIdInput = document.getElementById('modalEquipeHidden');
    const equipeAtualId = equipeAtualIdInput ? equipeAtualIdInput.value : '';
    
    if (modalProximaEquipeInput) {
      modalProximaEquipeInput.innerHTML = '<option value="">Sem próxima equipe</option>';
      equipes.forEach(eq => {
          if (String(eq.id) !== String(equipeAtualId)) {
              const o2 = document.createElement('option');
              o2.value = eq.id;
              o2.textContent = eq.nome;
              if (String(eq.id) === String(proximaId)) o2.selected = true;
              modalProximaEquipeInput.appendChild(o2);
          }
      });
    }
}

export async function salvarModal(processos, equipes) {
    if (!validarModal()) return false;

    let proc;
    let novoProcesso = false;
    const equipeAtualIdInput = document.getElementById('modalEquipeHidden');
    const equipeAtualId = equipeAtualIdInput ? equipeAtualIdInput.value : '';

    if (processoSelecionadoId) {
        proc = processos.find(p => p.id === processoSelecionadoId);
    } else {
        proc = { 
            id: '_' + Math.random().toString(36).substr(2, 9), 
            extras: [], 
            historicoEquipes: [], 
            equipeId: equipeAtualId
        };
        processos.push(proc);
        novoProcesso = true;
    }

    delete proc.retrocessoMotivo;
    
    const novoStatus = modalStatusInput ? modalStatusInput.value : '';
    const novaEquipeId = modalProximaEquipeInput ? modalProximaEquipeInput.value : '';
    
    if (novoStatus === 'concluido' && novaEquipeId && proc.equipeId !== novaEquipeId) {
        // Enviar para próxima equipe
        if (!proc.historicoEquipes.includes(proc.equipeId)) {
             proc.historicoEquipes.push(proc.equipeId);
        }
       
        proc.equipeId = novaEquipeId;
        
        proc.status = 'pendente'; // Reseta o status para pendente na nova equipe
        proc.proximaEquipeId = novaEquipeId;
    } else {
        // Salvar na equipe atual
        proc.status = novoStatus;
        proc.proximaEquipeId = novaEquipeId;
        
        if (novoProcesso && equipeAtualId && !proc.historicoEquipes.includes(equipeAtualId)) {
            proc.historicoEquipes.push(equipeAtualId);
        }
    }
    
    // Atualiza dados básicos
    proc.titulo = modalTituloInput ? modalTituloInput.value.trim() : '';
    proc.responsavel = modalResponsavelInput ? modalResponsavelInput.value.trim() : '';
    
    let valorNumerico = modalValorInput ? modalValorInput.value.replace(/\./g, '').replace(',', '.') : '0';
    proc.valor = valorNumerico;
    
    proc.prioridade = modalPrioridadeInput ? modalPrioridadeInput.value : '';
    
    // Atualiza extras
    proc.extras = [];
    if (extrasContainer) {
      extrasContainer.querySelectorAll('.extra-field').forEach(div => {
          const nome = div.querySelector('.extra-nome').value;
          const valor = div.querySelector('.extra-valor').value;
          const arquivos = div._arquivos || [];
          
          if (nome.trim() || valor.trim() || arquivos.length > 0) {
              proc.extras.push({
                  nome: nome,
                  valor: valor,
                  arquivos: arquivos
              });
          }
      });
    }

    return true;
}

function validarModal() {
    let isValid = true;
    const camposObrigatorios = [modalTituloInput];
    camposObrigatorios.forEach(input => {
        if (!input) return;
        if (!input.value.trim()) {
            input.classList.add('input-erro');
            isValid = false;
        } else {
            input.classList.remove('input-erro');
        }
    });

    if (modalStatusInput && modalProximaEquipeInput) {
      if (modalStatusInput.value === 'concluido' && !modalProximaEquipeInput.value) {
          modalProximaEquipeInput.classList.add('input-erro');
          // Usa o alerta personalizado
          abrirAlertaModal('Por favor, selecione a próxima equipe para enviar o processo.');
          return false;
      } else {
          modalProximaEquipeInput.classList.remove('input-erro');
      }
    }
    

    if (!isValid) {
        // Usa o alerta personalizado
        abrirAlertaModal('Por favor, preencha todos os campos obrigatórios.');
    }
    return isValid;
}

export function fecharModal() {
    if (modal) {
        modal.style.display = 'none';
    }
    processoSelecionadoId = null;
    limparModal();
    if (elementoFocadoAnteriormente) {
        elementoFocadoAnteriormente.focus();
    }
}

function limparModal() {
    if (modalTituloInput) {
        modalTituloInput.value = '';
        modalTituloInput.classList.remove('input-erro');
    }
    if (modalResponsavelInput) {
        modalResponsavelInput.value = '';
    }
    if (modalValorInput) {
        modalValorInput.value = '';
    }
    if (modalStatusInput) {
        modalStatusInput.value = 'pendente';
    }
    if (modalPrioridadeInput) {
        modalPrioridadeInput.value = 'media';
    }
    if (modalProximaEquipeInput) {
        modalProximaEquipeInput.innerHTML = '';
        modalProximaEquipeInput.classList.remove('input-erro');
    }
    if (extrasContainer) {
        extrasContainer.innerHTML = '';
    }
    const modalEquipeHidden = document.getElementById('modalEquipeHidden');
    if (modalEquipeHidden) {
      modalEquipeHidden.value = '';
    }
    if (saveModalBtn) {
        saveModalBtn.textContent = 'Salvar';
    }
    
    if (motivoRetrocessoContainer) {
        motivoRetrocessoContainer.style.display = 'none';
        if (motivoRetrocessoElement) {
            motivoRetrocessoElement.textContent = '';
        }
    }
    const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
    if (proximaEquipeContainer) {
         proximaEquipeContainer.style.display = 'none';
    }
}

function criarExtraField(nome = '', valor = '', arquivos = []) {
    const div = document.createElement('div');
    div.classList.add('extra-field');

    const nomeInput = document.createElement('input');
    nomeInput.placeholder = 'Nome do Extra';
    nomeInput.value = nome;
    nomeInput.classList.add('extra-nome');

    const valorInput = document.createElement('input');
    valorInput.placeholder = 'Valor';
    valorInput.value = valor;
    valorInput.classList.add('extra-valor');

    const arquivoInput = document.createElement('input');
    arquivoInput.type = 'file';
    arquivoInput.multiple = true;
    arquivoInput.className = 'extra-arquivo';
    arquivoInput.title = 'Anexar arquivos';
    div._arquivos = arquivos;

    const listaArquivos = document.createElement('ul');
    listaArquivos.className = 'arquivos-extra-list';

    function atualizarLista() {
        listaArquivos.innerHTML = '';
        div._arquivos.forEach(f => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            // Nota: URLs de Blob só funcionam na sessão atual
            a.href = URL.createObjectURL(f); 
            a.download = f.name;
            a.textContent = f.name;
            li.appendChild(a);
            listaArquivos.appendChild(li);
        });
    }
    atualizarLista();

    arquivoInput.addEventListener('change', e => {
        const novos = Array.from(e.target.files);
        div._arquivos.push(...novos);
        atualizarLista();
        // Limpa o input file para permitir o upload do mesmo arquivo novamente
        arquivoInput.value = null; 
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.className = 'btn-remover-extra';
    removeBtn.addEventListener('click', () => {
        div.remove();
        recarregarFocaveis();
    });

    div.appendChild(nomeInput);
    div.appendChild(valorInput);
    div.appendChild(arquivoInput);
    div.appendChild(listaArquivos);
    div.appendChild(removeBtn);

    return div;
}
