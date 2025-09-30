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
    if (cancelConfirmationBtn) cancelConfirmationBtn.addEventListener('click', fecharConfirmacaoModal);
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            if (onConfirmCallback) {
                onConfirmCallback();
            }
            fecharConfirmacaoModal(); 
        });
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
    
    promptInput.style.display = 'block';
    promptInput.value = '';
    
    exibirModalConfirmacao(mensagem, () => {
        const motivo = promptInput.value;
        callback(motivo);
    });

    promptInput.focus();
}

export function fecharConfirmacaoModal() {
    if (confirmationModal) {
        confirmationModal.style.display = 'none';
    }
    onConfirmCallback = null;
    
    if (promptInput) {
        promptInput.style.display = 'none';
    }
}