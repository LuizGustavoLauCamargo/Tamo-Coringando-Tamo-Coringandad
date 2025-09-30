// ARQUIVO: modal_equipes.js (COMPLETO E FUNCIONAL)

// --------------------------------------------------------------------------------
// MÓDULO: modal_equipes.js
// Lógica de controle do modal de gerenciamento de equipes.
// --------------------------------------------------------------------------------

import { exibirModalConfirmacao, abrirAlertaModal } from './modal_alerta.js';

// NOTA: 'modalEquipesOverlay' deve ser o ID do overlay do modal no seu HTML!
let modalEquipesOverlay, equipesListContainer, novaEquipeInput, novaEquipeCorInput, addEquipeBtn, closeModalEquipesBtn;
let dataRefs = {};
let uiRefs = {}; 

export function inicializarModalEquipe(data, UI) {
    dataRefs = data;
    uiRefs = UI;
    
    // Captura dos elementos do DOM
    modalEquipesOverlay = document.getElementById('modalEquipesOverlay'); // ID do overlay principal (CORRIGIDO)
    equipesListContainer = document.getElementById('listaEquipesContainer'); // ID da UL/DIV de listagem
    novaEquipeInput = document.getElementById('novaEquipeNome');
    novaEquipeCorInput = document.getElementById('novaEquipeCor');
    addEquipeBtn = document.getElementById('addEquipeForm').querySelector('button[type="submit"]');
    closeModalEquipesBtn = document.getElementById('closeModalEquipeBtn'); // ID do botão fechar no header do modal
    
    // Listeners
    if (closeModalEquipesBtn) closeModalEquipesBtn.addEventListener('click', fecharModalEquipes);
    
    // Listener de submissão do formulário (usando o form para permitir Enter)
    if (document.getElementById('addEquipeForm')) {
        document.getElementById('addEquipeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            salvarNovaEquipe(dataRefs, uiRefs);
        });
    }
    
    // Listener para o clique no botão de excluir equipe (usa delegação)
    if (equipesListContainer) {
        equipesListContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-equipe-btn');
            if (deleteBtn) {
                const equipeId = deleteBtn.getAttribute('data-equipe-id');
                const processoCount = deleteBtn.getAttribute('data-processo-count'); 
                exibirModalConfirmacao(`Tem certeza que deseja excluir a equipe e seus ${processoCount} processos?`, 
                    () => deletarEquipe(equipeId, dataRefs, uiRefs)
                );
            }
        });
    }
}

export function abrirModalGerenciarEquipes(data, UIReferences) {
    dataRefs = data;
    uiRefs = UIReferences; 

    // 1. Garante que o modal seja exibido
    if (modalEquipesOverlay) {
        modalEquipesOverlay.style.display = 'flex'; // Abre o pop-up (CORRIGIDO)
    } else {
         console.error("Erro ao abrir modal: 'modalEquipesOverlay' não encontrado. Verifique o ID no HTML.");
    }

    // 2. Preenche a lista de equipes
    renderizarListaEquipes(dataRefs.equipes, dataRefs.processos); // (CORRIGIDO: ReferenceError resolvido)
    
    // 3. Limpa inputs de nova equipe
    if (novaEquipeInput) novaEquipeInput.value = '';
    if (novaEquipeCorInput) novaEquipeCorInput.value = '#3b82f6'; // Cor padrão Tailwind Blue-600
}

function fecharModalEquipes() {
    if (modalEquipesOverlay) {
        modalEquipesOverlay.style.display = 'none';
    }
}

// --- Funções de Manipulação de Dados ---

function salvarNovaEquipe(data, filtros) {
    const nome = novaEquipeInput?.value.trim();
    const cor = novaEquipeCorInput?.value;
    // O campo 'ID Curto' (novaEquipeId) está no HTML, mas não é usado neste código JS.
    // Para simplificar, estamos usando Date.now() como ID.
    
    if (!nome || nome.length < 2) {
        abrirAlertaModal('O nome da equipe deve ter pelo menos 2 caracteres.');
        return;
    }
    if (data.equipes.some(e => e.nome.toLowerCase() === nome.toLowerCase())) {
        abrirAlertaModal('Já existe uma equipe com este nome.');
        return;
    }

    const novaEquipe = {
        id: 'e' + Date.now(),
        nome: nome,
        cor: cor
    };

    data.equipes.push(novaEquipe);

    // 1. Re-renderiza a lista no modal
    renderizarListaEquipes(data.equipes, data.processos);

    // 2. Re-renderiza a UI principal (filtros e cards)
    const afterRenderCallback = filtros.afterRenderCallback; 

    filtros.inicializarFiltroEquipes(data.processos, data.equipes, filtros.filtrarProcessos, afterRenderCallback);
    filtros.filtrarProcessos(data.processos, data.equipes, filtros.buscaAtiva, filtros.filtroEquipeAtivo, afterRenderCallback);

    abrirAlertaModal(`Equipe "${nome}" criada com sucesso!`);
    novaEquipeInput.value = '';
}

function deletarEquipe(equipeId, data, filtros) {
    const equipeIndex = data.equipes.findIndex(e => e.id === equipeId);
    if (equipeIndex === -1) return;

    const equipeNome = data.equipes[equipeIndex].nome;

    // 1. Remove os processos vinculados
    data.processos = data.processos.filter(p => p.equipeId !== equipeId);

    // 2. Remove a equipe
    data.equipes.splice(equipeIndex, 1);

    // 3. Re-renderiza a lista no modal
    renderizarListaEquipes(data.equipes, data.processos);

    // 4. Re-renderiza a UI principal (filtros e cards)
    const afterRenderCallback = filtros.afterRenderCallback; 
    
    // Se a equipe deletada era a ativa, volta para 'todos'
    if (filtros.filtroEquipeAtivo === equipeId) {
        filtros.filtroEquipeAtivo = 'todos';
    }

    filtros.inicializarFiltroEquipes(data.processos, data.equipes, filtros.filtrarProcessos, afterRenderCallback);
    filtros.filtrarProcessos(data.processos, data.equipes, filtros.buscaAtiva, filtros.filtroEquipeAtivo, afterRenderCallback);
    
    abrirAlertaModal(`Equipe "${equipeNome}" excluída. ${data.processos.length} processos restantes.`);
}


// --- Funções de Renderização ---

function renderizarListaEquipes(equipesArray, processosArray) {
    if (!equipesListContainer) return;
    equipesListContainer.innerHTML = '';

    equipesArray.forEach(equipe => {
        const processoCount = processosArray.filter(p => p.equipeId === equipe.id).length;
        
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 border-b';
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-4 h-4 rounded-full" style="background-color: ${equipe.cor};"></span>
                <span class="font-semibold text-gray-800">${equipe.nome}</span>
                <span class="text-sm text-gray-500">(${processoCount} processos)</span>
            </div>
            <button type="button" class="delete-equipe-btn text-red-500 hover:text-red-700 p-1 rounded-full transition duration-150"
                    data-equipe-id="${equipe.id}" 
                    data-processo-count="${processoCount}"
                    title="Excluir equipe e seus processos">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        equipesListContainer.appendChild(li);
    });
}   