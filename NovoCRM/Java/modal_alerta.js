// ARQUIVO: modal_alerta.js (CORRIGIDO PARA PROMPT)

// --------------------------------------------------------------------------------
// MÓDULO: modal_alerta.js
// Lógica de controle dos modais de alerta/confirmação (Substitui alert/prompt)
// --------------------------------------------------------------------------------

// Elementos do Modal de Confirmação/Alerta
let confirmationModal, confirmationMessage, confirmActionBtn, cancelConfirmationBtn, closeConfirmationModalBtn, promptInput;
let onConfirmCallback = null;

export function inicializarModalAlerta() {
    confirmationModal = document.getElementById('confirmationModal');
    confirmationMessage = document.getElementById('confirmationMessage');
    confirmActionBtn = document.getElementById('confirmActionBtn');
    cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
    closeConfirmationModalBtn = document.getElementById('closeConfirmationModalBtn');
    promptInput = document.getElementById('promptInput');
    
    if (closeConfirmationModalBtn) closeConfirmationModalBtn.addEventListener('click', fecharConfirmacaoModal);
    
    // 🎯 MUDANÇA CRÍTICA: Ajustar o listener do Cancelar para retornar NULL no modo PROMPT
    if (cancelConfirmationBtn) {
        cancelConfirmationBtn.addEventListener('click', () => {
            const isPromptMode = promptInput && promptInput.style.display !== 'none';
            if (isPromptMode && onConfirmCallback) {
                // Se estiver no modo prompt e cancelar, retorna null
                onConfirmCallback(null); 
            }
            fecharConfirmacaoModal();
        });
    }
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            if (onConfirmCallback) {
                
                // 🎯 MUDANÇA CRÍTICA: Lógica que diferencia Confirm/Prompt
                if (promptInput && promptInput.style.display !== 'none') {
                    // MODO PROMPT: Passa o valor do input como argumento para o callback
                    const motivo = promptInput.value;
                    onConfirmCallback(motivo);
                } else {
                    // MODO CONFIRM: Chama o callback sem argumentos
                    onConfirmCallback();
                }
            }
            fecharConfirmacaoModal(); 
        });
    }
}

export function fecharConfirmacaoModal() {
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
    onConfirmCallback = null;
    
    if (promptInput) {
        // Garante que o input é sempre escondido ao fechar
        promptInput.style.display = 'none';
        promptInput.value = '';
    }
 
}


export function exibirModalConfirmacao(mensagem, callback) {
    if (confirmationModal && confirmationMessage && confirmActionBtn && cancelConfirmationBtn) {
        confirmationMessage.textContent = mensagem;
        onConfirmCallback = callback; 

        if (promptInput) promptInput.style.display = 'none';

        confirmActionBtn.textContent = 'Confirmar';
        confirmActionBtn.style.display = 'inline-block';
        cancelConfirmationBtn.textContent = 'Cancelar';
        cancelConfirmationBtn.style.display = 'inline-block';
        
        confirmationModal.style.display = 'flex';
        confirmActionBtn.focus();
    }
}

export function abrirAlertaModal(mensagem) { 
    if (confirmationModal && confirmationMessage && confirmActionBtn && cancelConfirmationBtn) {
        confirmationMessage.textContent = mensagem;
        onConfirmCallback = null; 
        
        if (promptInput) promptInput.style.display = 'none';

        confirmActionBtn.style.display = 'none'; 
        cancelConfirmationBtn.textContent = 'OK';
        cancelConfirmationBtn.style.display = 'inline-block';
        
        confirmationModal.style.display = 'flex';
        cancelConfirmationBtn.focus();
    }
}

export function abrirPromptModal(mensagem, callback) {
    if (!promptInput) {
        // Fallback se o elemento não existir
        const motivo = window.prompt(mensagem); 
        callback(motivo);
        return;
    }
    
    // 1. Configuração do PROMPT
    confirmationMessage.textContent = mensagem;
    promptInput.style.display = 'block'; // Mostra o input de texto
    promptInput.value = '';
    
    // 2. Configuração dos Botões
    confirmActionBtn.textContent = 'Confirmar';
    confirmActionBtn.style.display = 'inline-block';
    cancelConfirmationBtn.textContent = 'Cancelar';
    cancelConfirmationBtn.style.display = 'inline-block';
    
    // 3. Define o Callback que irá receber o valor do input
    onConfirmCallback = callback;

    // 4. Abre e foca
    confirmationModal.style.display = 'flex';
    promptInput.focus();
}