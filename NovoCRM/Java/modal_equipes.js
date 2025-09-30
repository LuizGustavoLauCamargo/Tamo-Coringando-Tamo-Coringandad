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
    
    novaEquipeNomeInput = document.getElementById('novaEquipeNome');
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

function renderizarListaEquipes(data, filtros) {
    if (!listaEquipesContainer) return;
    listaEquipesContainer.innerHTML = '';
    
    data.equipes.forEach(equipe => {
        const div = document.createElement('div');
        div.className = 'equipe-card-mini flex justify-between items-center p-3 rounded-lg bg-white shadow-sm';
        // Aplica a cor de borda diretamente
        div.style.borderLeftColor = equipe.cor;
        div.style.borderLeftStyle = 'solid';
        div.style.borderLeftWidth = '6px'; // Aumenta a espessura da borda para destaque
        
        const content = document.createElement('span');
        content.className = 'font-medium text-gray-800';
        content.textContent = `${equipe.nome} (${equipe.id})`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.className = 'bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-red-600 transition duration-150';
        deleteBtn.setAttribute('data-equipe-id', equipe.id);
        
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const equipeIdToDelete = e.target.getAttribute('data-equipe-id');
            
            exibirModalConfirmacao(`Tem certeza que deseja EXCLUIR a equipe '${equipe.nome}'? Todos os processos desta equipe serão PERDIDOS!`, () => {
                // Callback de confirmação
                // Passamos data.processos diretamente para atualizar a referência global no módulo data
                const result = data.deleteEquipe(equipeIdToDelete, data.processos);
                
                if (result.success) {
                    abrirAlertaModal(result.message);
                    renderizarListaEquipes(data, filtros); 
                    filtros.inicializarFiltroEquipes(data.processos, data.equipes, filtros.filtrarProcessos); // Re-cria os botões de filtro
                    // Garante que o filtro volte para 'todos' se a equipe ativa for deletada
                    filtros.filtrarProcessos(data.processos, data.equipes, filtros.buscaAtiva, 'todos'); 
                } else {
                    abrirAlertaModal(result.message);
                }
            });
        });
        
        div.appendChild(content);
        div.appendChild(deleteBtn);
        listaEquipesContainer.appendChild(div);
    });
}