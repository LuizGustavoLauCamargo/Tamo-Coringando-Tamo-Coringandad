// --------------------------------------------------------------------------------
// MÓDULO: modal_equipe.js
// Lógica de controle do modal de gestão de equipes
// --------------------------------------------------------------------------------

import { abrirAlertaModal, exibirModalConfirmacao } from './modal_alerta.js';

let modalEquipe, closeModalEquipeBtn, addEquipeForm, listaEquipesContainer;
let novaEquipeNomeInput, novaEquipeIdInput, novaEquipeCorInput;

export function inicializarModalEquipe(data, filtros) {
    modalEquipe = document.getElementById('modalEquipe');
    closeModalEquipeBtn = document.getElementById('closeModalEquipeBtn');
    addEquipeForm = document.getElementById('addEquipeForm');
    listaEquipesContainer = document.getElementById('listaEquipesContainer');
    
    novaEquipeNomeInput = document.getElementById('novaEquipeNavome');
    novaEquipeIdInput = document.getElementById('novaEquipeId');
    novaEquipeCorInput = document.getElementById('novaEquipeCor');
    
    if (closeModalEquipeBtn) closeModalEquipeBtn.addEventListener('click', fecharModalEquipe);
    
    if (addEquipeForm) {
        addEquipeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            adicionarNovaEquipe(data, filtros);
        });
    }
}

export function abrirModalGerenciarEquipes(data, filtros) {
    renderizarListaEquipes(data, filtros);
    if (modalEquipe) {
        modalEquipe.style.display = 'flex';
        if (novaEquipeNomeInput) novaEquipeNomeInput.focus();
    }
}

function fecharModalEquipe() {
    if (modalEquipe) {
        modalEquipe.style.display = 'none';
    }
}

function adicionarNovaEquipe(data, filtros) {
    const nome = novaEquipeNomeInput.value.trim();
    const id = novaEquipeIdInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); // Garante ID limpo
    const cor = novaEquipeCorInput.value;
    
    // Validações
    let isValid = true;
    if (!nome) {
        novaEquipeNomeInput.classList.add('input-erro');
        isValid = false;
    } else {
        novaEquipeNomeInput.classList.remove('input-erro');
    }
    
    if (!id || id.length < 2) {
        novaEquipeIdInput.classList.add('input-erro');
        isValid = false;
    } else {
        novaEquipeIdInput.classList.remove('input-erro');
    }
    
    if (!isValid) {
        abrirAlertaModal('Preencha o Nome e um ID Curto válido (mínimo 2 caracteres, apenas letras/números).');
        return;
    }
    
    const result = data.addEquipe(nome, id, cor);
    
    if (result.success) {
        abrirAlertaModal(`Equipe '${nome}' adicionada com sucesso!`);
        novaEquipeNomeInput.value = '';
        novaEquipeIdInput.value = '';
        renderizarListaEquipes(data, filtros); 
        filtros.inicializarFiltroEquipes(data.processos, data.equipes, filtros.filtrarProcessos); // Re-cria os botões de filtro
    } else {
        abrirAlertaModal(result.message);
    }
}
