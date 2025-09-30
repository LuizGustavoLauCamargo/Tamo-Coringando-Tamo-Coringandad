// processo.js

// Importa funções essenciais de outros módulos
import { criarCardProcesso } from './card.js';
// Importa as funções de controle de modal/aviso DO modal.js
import { fecharModal, exibirModalConfirmacao, deleteProcessBtn } from './modal.js'; 

// --- Dados Iniciais (Exemplo) ---
export const equipes = [
    { id: '1', nome: 'Vendas' },
    { id: '2', nome: 'Formalização' },
    { id: '3', nome: 'Documentação' },
];

export const processos = [
    { id: 'proc1', titulo: 'Processo A', responsavel: 'Duda', equipeId: '1', valor: '3500.00', status: 'pendente', prioridade: 'alta', extras: [], historicoEquipes: ['1'] },
    { id: 'proc2', titulo: 'Processo B', responsavel: 'Daniel', equipeId: '2', valor: '7000.00', status: 'pendente', prioridade: 'media', extras: [], historicoEquipes: ['2'] },
    { id: 'proc3', titulo: 'Processo C', responsavel: 'Line', equipeId: '3', valor: '3500.00', status: 'analise', prioridade: 'baixa', extras: [], historicoEquipes: ['3'] },
];

// --- Funções Auxiliares ---
export function getEquipeById(id) {
    return equipes.find(eq => String(eq.id) === String(id));
}

// --- Lógica de Exclusão: Confirmação e Execução ---

/**
 * 1. Função que abre o modal de confirmação. EXPORTADA para ser chamada pelo modal.js.
 */
export function confirmarExclusao(processoId) {
    if (!processoId) return;
    
    fecharModal(); // Fecha o modal de edição
    
    // Chama o modal de aviso (pop-up)
    if (typeof exibirModalConfirmacao === 'function') {
        
        exibirModalConfirmacao(
           
            `Tem certeza que deseja excluir o processo ID: ${processoId}? Esta ação é irreversível.`,
            // Passa executarExclusao como callback para ser chamada se o usuário confirmar
            () => executarExclusao(processoId) 
        );
    } else {
        executarExclusao(processoId);
    }
}

/**
 * 2. Função que executa a exclusão real após a confirmação.
 */
export function executarExclusao(processoId) {
    const index = processos.findIndex(p => p.id === processoId);
    
    if (index > -1) {
        processos.splice(index, 1); // Remove o dado do array
        
        // CRÍTICO: Pega os filtros atuais e chama a re-renderização
        const btnAtivo = document.querySelector('.equipe-btn.ativo');
        const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
        const termoBusca = document.getElementById('buscaInput')?.value || '';
        
        filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        
        console.log(`✅ Processo ${processoId} excluído e lista atualizada.`);
        
    } else {
        console.warn(`Processo ID ${processoId} não encontrado para exclusão.`);
    }
}

// --- Renderização de Equipes e Filtros ---

export function renderizarEquipes(equipes) {
    const filtroContainer = document.getElementById('filtroEquipes');
    if (!filtroContainer) return;
    
    filtroContainer.innerHTML = '<button class="equipe-btn ativo bg-blue-600 text-white" data-equipe-id="todos">Todos</button>';
    
    equipes.forEach(eq => {
        const btn = document.createElement('button');
        btn.classList.add('equipe-btn', 'px-4', 'py-2', 'rounded-lg', 'transition', 'duration-200', 'bg-white', 'text-blue-600', 'hover:bg-blue-100', 'shadow-md');
        btn.textContent = eq.nome;
        btn.setAttribute('data-equipe-id', eq.id);
        filtroContainer.appendChild(btn);
    });
    
    filtroContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.equipe-btn'); 
        
        if (btn) {
            const equipeId = btn.getAttribute('data-equipe-id');
            
            document.querySelectorAll('.equipe-btn').forEach(b => {
                b.classList.remove('ativo', 'bg-blue-600', 'text-white');
                b.classList.add('bg-white', 'text-blue-600');
            });
            btn.classList.add('ativo', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-white', 'text-blue-600');
            
            const termoBusca = document.getElementById('buscaInput')?.value || '';
            
            filtrarProcessos(processos, equipes, termoBusca, equipeId);
        }
    });
}

// Função de Filtro completa (MOTOR DE RENDERIZAÇÃO)
export function filtrarProcessos(processosParaFiltrar, equipesParaFiltrar, termoBusca = '', equipeId) {
    
    if (!Array.isArray(processosParaFiltrar)) processosParaFiltrar = [];
    
    // 1. Filtra por equipe
    let processosFiltrados = (equipeId && equipeId !== 'todos') 
        ? processosParaFiltrar.filter(p => String(p.equipeId) === String(equipeId))
        : processosParaFiltrar;

    // 2. Filtra por busca (título ou responsável)
    if (termoBusca && termoBusca.trim() !== '') {
        const termo = termoBusca.toLowerCase().trim();
        processosFiltrados = processosFiltrados.filter(p =>
            p.titulo.toLowerCase().includes(termo) || 
            (p.responsavel && p.responsavel.toLowerCase().includes(termo))
        );
    }
    
    // 3. Renderiza o resultado filtrado
    renderizarProcessos(processosFiltrados, equipesParaFiltrar);
}

// --- Renderização de Cards ---
export function renderizarProcessos(processosParaRenderizar, equipes) {
    
    if (!Array.isArray(processosParaRenderizar)) return;

    const kanbanContainers = document.querySelectorAll('.process-list[data-status]');
    const getEquipe = getEquipeById; 

    if (kanbanContainers.length > 0) {
        // Modo Kanban
        kanbanContainers.forEach(container => {
            const status = container.getAttribute('data-status');
            container.innerHTML = ''; 
            
            const processosStatus = processosParaRenderizar.filter(p => p.status === status)
                .sort((a, b) => {
                    const prioridadeOrdem = { 'urgente': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
                    return prioridadeOrdem[b.prioridade] - prioridadeOrdem[a.prioridade];
                });

            if (processosStatus.length === 0) {
                 container.innerHTML = '<p class="text-center text-gray-500 mt-4 text-sm">Nenhum processo neste status.</p>';
                 return;
            }

            processosStatus.forEach(proc => {
                // Assume que criarCardProcesso está importada do card.js
                const cardElement = criarCardProcesso(proc, equipes, false, getEquipe); 
                container.appendChild(cardElement);
            });
        });
    } else {
        // Fallback para lista simples
        const listaProcessosContainer = document.getElementById('listaProcessos');
        if (listaProcessosContainer) {
            listaProcessosContainer.innerHTML = '';
            processosParaRenderizar.forEach(proc => {
                const cardElement = criarCardProcesso(proc, equipes, false, getEquipe); 
                listaProcessosContainer.appendChild(cardElement);
            });
        }
    }
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    // Importação local do modal.js para evitar importações cíclicas e garantir a inicialização
    import('./modal.js').then(({ inicializarModal, abrirModalNovoProcesso }) => {
        inicializarModal(); 
        
        // Listener Adicionar Processo
        document.getElementById('addProcessBtn')?.addEventListener('click', () => {
            const equipeAtiva = document.querySelector('.equipe-btn.ativo');
            const equipeId = equipeAtiva?.getAttribute('data-equipe-id') !== 'todos' 
                                 ? equipeAtiva?.getAttribute('data-equipe-id') : null;
            
            const equipePadrao = equipeId || equipes[0]?.id || '1'; 
            abrirModalNovoProcesso(equipes, equipePadrao);
        });
    });
    
    renderizarEquipes(equipes); 
    
    // Chamada inicial para carregar a lista
    filtrarProcessos(processos, equipes, '', 'todos'); 

    // Listener para busca
    const buscaInput = document.getElementById('buscaInput');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            const termoBusca = e.target.value;
            const btnAtivo = document.querySelector('.equipe-btn.ativo');
            const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
            
            filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        });
    }
});