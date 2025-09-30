import { renderizarProcessos, processos, filtrarProcessos } from './processo.js';
import { inicializarEquipes, renderizarFiltroEquipes, equipes, adicionarEquipe } from './equipe.js';
import { inicializarModal, abrirModalNovoProcesso } from './modal.js';
// import { criarCardProcesso } from './card.js'; // Não é necessário importar aqui, pois é usado dentro de renderizarProcessos
import { carregarDados } from './storage.js';

// Função placeholder para inicializar processos (apenas para organização)
// A lógica real de renderização está dentro do DOMContentLoaded.
function inicializarProcessos() {
    // Geralmente, aqui você carregaria os dados iniciais do localStorage ou de uma API.
    // Ex: const dadosCarregados = carregarDados(); 
    // Seus dados já estão no array 'processos' (importado de processo.js)
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização da Lógica Principal
    inicializarEquipes();
    inicializarProcessos(); // Chama a função placeholder acima
    inicializarModal();     // Inicializa todos os listeners e elementos do modal

    // Renderiza a lista inicial de processos e os botões de filtro
    renderizarFiltroEquipes(equipes);   
    renderizarProcessos(processos, equipes);

    // --- Listeners de Ações Principais ---

    // 1. Adiciona evento ao botão "Adicionar Processo"
    const addProcessBtn = document.getElementById('addProcessBtn');
    if (addProcessBtn) {
        addProcessBtn.addEventListener('click', () => {
            // Se houver uma equipe ativa no filtro, use-a como padrão
            const btnAtivo = document.querySelector('.equipe-btn.ativo');
            const equipePadrao = (btnAtivo?.dataset.id !== 'todos') ? btnAtivo?.dataset.id : equipes[0]?.id;
            abrirModalNovoProcesso(equipes, equipePadrao);
        });
        
    }

    // 2. Adiciona evento ao botão "Adicionar Equipe"
    const addEquipeBtn = document.getElementById('addEquipeBtn');
    if (addEquipeBtn) {
        addEquipeBtn.addEventListener('click', () => {
            const nome = prompt('Digite o nome da nova equipe:');
            if (nome) {
                adicionarEquipe(nome);
                renderizarFiltroEquipes(equipes);
                renderizarProcessos(processos, equipes);
            }
        });
    }

    // 3. Gerencia o clique nos botões de filtro de equipe
    const filtroEquipesContainer = document.getElementById('filtroEquipes');
    if (filtroEquipesContainer) {
        filtroEquipesContainer.addEventListener('click', (e) => {
            // Note que eu mudei a busca de '.btn-filtro' para '.equipe-btn' para ser consistente com o HTML
            const btn = e.target.closest('.equipe-btn'); 
            if (!btn) return;

            document.querySelectorAll('.equipe-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            const filtroEquipeId = btn.dataset.id;
            const termoBusca = document.getElementById('buscaInput').value;
            // Assumindo que 'filtrarProcessos' agora recebe todos os argumentos
            // Você precisa implementar a função 'filtrarProcessos' no seu processo.js
            filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        });
    }

    // 4. Gerencia a busca em tempo real
    const buscaInput = document.getElementById('buscaInput');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            const termoBusca = e.target.value;
            const btnAtivo = document.querySelector('.equipe-btn.ativo');
            const filtroEquipeId = btnAtivo?.dataset.id || 'todos';
            // Assumindo que 'filtrarProcessos' agora recebe todos os argumentos
            filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        });
    }

});


// IMPORTANTE: O código problemático do botão de exclusão foi REMOVIDO daqui.
// Ele deve estar no modal.js, dentro da função inicializarModal().