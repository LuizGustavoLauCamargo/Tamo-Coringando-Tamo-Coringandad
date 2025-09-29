// processo.js

// Importa funções essenciais de outros módulos
import { criarCardProcesso } from './card.js';
// Ajustado para importar as funções do seu modal.js
import { inicializarModal, abrirModalNovoProcesso, fecharModal } from './modal.js';

// --- Dados Iniciais ---
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

// --- Lógica de Exclusão (CORREÇÃO DE CHAMADA DE RENDERIZAÇÃO) ---
export function excluirProcesso(processoId) {
    if (!processoId) return; // Se não houver ID, ignora a exclusão

    const index = processos.findIndex(p => p.id === processoId);
    
    if (index > -1) {
        processos.splice(index, 1);
        
        // 🚀 CRÍTICO: Obtém o estado atual dos filtros e RE-RENDERIZA
        const btnAtivo = document.querySelector('.equipe-btn.ativo');
        const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
        const termoBusca = document.getElementById('buscaInput')?.value || '';
        
        // Chama a função de filtro, que refaz a renderização completa da lista
        filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        
        console.log(`Processo ${processoId} excluído e lista atualizada.`);
        
        // Fecha o modal (importado do modal.js)
        fecharModal(); 
    } else {
        console.warn(`Processo ID ${processoId} não encontrado para exclusão.`);
    }
}

// --- Renderização de Equipes e Filtros ---
export function renderizarEquipes(equipes) {
    const filtroContainer = document.getElementById('filtroEquipes');
    if (!filtroContainer) return;

    // Garante que o container de equipes tem o ID correto (se o seu HTML usar #filtroEquipes)
    if (document.getElementById('filtroEquipes') === null) {
        console.error("ID #filtroEquipes não encontrado no HTML. O filtro não funcionará.");
        return;
    }
    
    filtroContainer.innerHTML = '<button class="equipe-btn ativo" data-equipe-id="todos">Todos</button>';

    equipes.forEach(eq => {
        const btn = document.createElement('button');
        // Usa classes Tailwind de estilo para melhor aparência
        btn.classList.add('equipe-btn', 'px-4', 'py-2', 'rounded-lg', 'transition', 'duration-200', 'bg-white', 'text-blue-600', 'hover:bg-blue-100', 'shadow-md');
        btn.textContent = eq.nome;
        btn.setAttribute('data-equipe-id', eq.id);
        filtroContainer.appendChild(btn);
    });
    
    // Adiciona o listener UMA ÚNICA VEZ ao container PAI
    filtroContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.equipe-btn'); 
        
        if (btn) {
            const equipeId = btn.getAttribute('data-equipe-id');
            
            // Remove 'ativo' de todos e adiciona ao clicado
            document.querySelectorAll('.equipe-btn').forEach(b => {
                b.classList.remove('ativo', 'bg-blue-600', 'text-white');
                b.classList.add('bg-white', 'text-blue-600');
            });
            btn.classList.add('ativo', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-white', 'text-blue-600');
            
            const termoBusca = document.getElementById('buscaInput')?.value || '';
            
            // 🚀 CRÍTICO: Chama filtrarProcessos para aplicar o filtro de equipe e re-renderizar
            filtrarProcessos(processos, equipes, termoBusca, equipeId);
        }
    });
    
    // Configura o estilo inicial do botão "Todos"
    document.querySelector('.equipe-btn[data-equipe-id="todos"]').classList.add('bg-blue-600', 'text-white');
}

// Função de Filtro completa (MOTOR DE RENDERIZAÇÃO)
export function filtrarProcessos(processosParaFiltrar, equipesParaFiltrar, termoBusca = '', equipeId) {
    
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
    // Procura por containers Kanban
    const kanbanContainers = document.querySelectorAll('.process-list[data-status]');
    
    // Garante que o getEquipeById está disponível no escopo (já está exportado)
    const getEquipe = getEquipeById; 

    if (kanbanContainers.length > 0) {
        // Modo Kanban
        kanbanContainers.forEach(container => {
            const status = container.getAttribute('data-status');
            container.innerHTML = ''; // Limpa o container
            
            const processosStatus = processosParaRenderizar.filter(p => p.status === status)
                .sort((a, b) => {
                    // Ordenação por prioridade
                    const prioridadeOrdem = { 'urgente': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
                    return prioridadeOrdem[b.prioridade] - prioridadeOrdem[a.prioridade];
                });

            if (processosStatus.length === 0) {
                 container.innerHTML = '<p class="text-center text-gray-500 mt-4 text-sm">Nenhum processo neste status.</p>';
                 return;
            }

            processosStatus.forEach(proc => {
                // Passa 'getEquipe' explicitamente
                const cardElement = criarCardProcesso(proc, equipes, false, getEquipe); 
                container.appendChild(cardElement);
            });
        });
    } else {
        // Fallback para lista simples, se não houver kanban
        const listaProcessosContainer = document.getElementById('listaProcessos');
        if (listaProcessosContainer) {
            listaProcessosContainer.innerHTML = '';
            processosParaRenderizar.forEach(proc => {
                // Passa 'getEquipe' explicitamente
                const cardElement = criarCardProcesso(proc, equipes, false, getEquipe); 
                listaProcessosContainer.appendChild(cardElement);
            });
        } else {
             console.error("Nenhum container Kanban (process-list[data-status]) ou lista simples (#listaProcessos) encontrado no HTML.");
        }
    }
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o modal (importado do modal.js)
    inicializarModal(); 
    
    // Renderiza os botões de filtro e adiciona listeners de clique
    renderizarEquipes(equipes); 
    
    // CRÍTICO: Chamada inicial para carregar a lista (aplicando o filtro 'todos' por padrão)
    filtrarProcessos(processos, equipes, '', 'todos'); 

    // Listener para busca (que dispara o filtro)
    const buscaInput = document.getElementById('buscaInput');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            const termoBusca = e.target.value;
            // Pega o filtro de equipe ativo 
            const btnAtivo = document.querySelector('.equipe-btn.ativo');
            const filtroEquipeId = btnAtivo?.getAttribute('data-equipe-id') || 'todos';
            
            // Chama a função de filtro com o termo de busca e o filtro de equipe atual
            filtrarProcessos(processos, equipes, termoBusca, filtroEquipeId);
        });
    }

    // Listener Adicionar Processo
    document.getElementById('addProcessBtn')?.addEventListener('click', () => {
        const equipeAtiva = document.querySelector('.equipe-btn.ativo');
        const equipeId = equipeAtiva?.getAttribute('data-equipe-id') !== 'todos' 
                             ? equipeAtiva?.getAttribute('data-equipe-id') : null;
        
        const equipePadrao = equipeId || equipes[0]?.id || '1'; 

        abrirModalNovoProcesso(equipes, equipePadrao);
    });
});
