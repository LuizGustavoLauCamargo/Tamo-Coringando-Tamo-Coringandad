// equipe.js
import { processos, filtrarProcessos } from './processo.js';
import { salvarDados, carregarDados } from './storage.js';
// Importação necessária da UI personalizada (modal.js)
// Assumindo que o modal.js exporta a função de exibição de modal de confirmação/alerta.
import { exibirModalConfirmacao, fecharConfirmacaoModal, abrirAlertaModal } from './modal.js';

export let equipes = [];

export function inicializarEquipes() {
    equipes = carregarDados('equipes') || [
        { id: 'dev', nome: 'Desenvolvimento' },
        { id: 'design', nome: 'Design' },
        { id: 'marketing', nome: 'Marketing' }
    ];
    if (carregarDados('equipes') === null) {
        salvarDados('equipes', equipes);
    }
}

export function getEquipeById(id) {
    return equipes.find(equipe => equipe.id === id);
}

export function adicionarEquipe(nome) {
    const novaEquipe = { id: '_' + Math.random().toString(36).substr(2, 9), nome };
    equipes.push(novaEquipe);
    salvarDados('equipes', equipes);
    // Após adicionar, re-renderizar a lista de filtros.
    renderizarFiltroEquipes(equipes, '');
    return novaEquipe;
}

/**
 * Funções de exclusão da equipe, usando modal personalizado.
 * @param {string} equipeId O ID da equipe a ser excluída.
 * @returns {boolean}
 */
export function excluirEquipe(equipeId) {
    const temProcessos = processos.some(p => p.equipeId === equipeId);
    
    if (temProcessos) {
        // 1. Usa o modal de alerta personalizado em vez de alert()
        abrirAlertaModal('Não é possível excluir uma equipe que possui processos ativos.');
        return false;
    }

    // 2. Usa o modal de confirmação personalizado em vez de confirm()
    exibirModalConfirmacao('Deseja realmente excluir esta equipe?', () => {
        // Lógica de exclusão se o usuário confirmar
        const index = equipes.findIndex(e => e.id === equipeId);
        
        if (index !== -1) {
            equipes.splice(index, 1);
            salvarDados('equipes', equipes);

            // Re-renderiza o filtro de equipes (removendo o botão)
            renderizarFiltroEquipes(equipes, '');
            
            // Re-renderiza os processos, limpando o filtro anterior
            filtrarProcessos(processos, equipes, '', 'todos'); 
        }
    });
    
    return true;
}

/**
 * Renderiza os botões de filtro e o botão de exclusão.
 * @param {Array<object>} equipes Lista de equipes.
 * @param {string} filtroEquipeId ID da equipe atualmente filtrada.
 */
export function renderizarFiltroEquipes(equipes, filtroEquipeId = '') {
    const container = document.getElementById('filtroEquipes');
    if (!container) return;
    container.innerHTML = '';

    // Garante que o ID de filtro seja 'todos' para a opção inicial
    const todasEquipes = [{ id: 'todos', nome: 'Todos' }, ...equipes];

    todasEquipes.forEach((eq) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('flex', 'items-center', 'gap-1', 'mr-2'); // Tailwind classes

        const btn = document.createElement('button');
        btn.textContent = eq.nome;
        btn.classList.add('equipe-btn', 'px-3', 'py-1', 'rounded-lg', 'transition', 'duration-200', 'shadow-md');
        btn.dataset.id = eq.id;
        btn.setAttribute('data-equipe-id', eq.id); // Mantendo o atributo usado no processo.js
        
        // Estilo e estado ativo
        const isActive = (eq.id === filtroEquipeId) || (!filtroEquipeId && eq.id === 'todos');
        if (isActive) {
            btn.classList.add('ativo', 'bg-blue-600', 'text-white');
        } else {
            btn.classList.add('bg-white', 'text-gray-700', 'hover:bg-blue-100');
        }
        
        // Listener do botão de filtro (precisa ser definido no processo.js ou aqui)
        // Nota: O listener principal deve ser adicionado no processo.js no container pai, 
        // mas vamos adicionar um listener aqui para a nova equipe renderizada, por garantia.
        // O `processo.js` atual usa um listener no container pai, o que é mais eficiente, 
        // então não precisamos adicionar o 'click' aqui, apenas o de exclusão.


        if (eq.id !== 'todos') {
            const btnExcluir = document.createElement('button');
            btnExcluir.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            `;
            btnExcluir.classList.add('btn-excluir-equipe', 'p-1', 'rounded-full', 'bg-red-100', 'hover:bg-red-200', 'transition');
            btnExcluir.title = `Excluir ${eq.nome}`;
            
            // Listener de Exclusão (Chama a função corrigida)
            btnExcluir.addEventListener('click', (e) => {
                e.stopPropagation(); 
                // Chama a função principal que agora usa o modal
                excluirEquipe(eq.id);
            });
            wrapper.appendChild(btnExcluir);
        }

        wrapper.prepend(btn);
        container.appendChild(wrapper);
    });
}
