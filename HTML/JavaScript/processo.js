import { equipes, getEquipeById } from './equipe.js';
import { preencherModalComProcesso } from './modal.js';
import { salvarDados, carregarDados } from './storage.js';

export let processos = [];

export function inicializarProcessos() {
    processos = carregarDados('processos') || [];
    renderizarProcessos(processos, equipes);
}

export function renderizarProcessos(processos, equipes, textoBusca = '', filtroEquipeId = '') {
    const listaProcessosContainer = document.getElementById('listaProcessos');
    if (!listaProcessosContainer) return;

 


    listaProcessosContainer.innerHTML = '';

    const processosFiltrados = processos.filter(proc => {
        const tituloCorresponde = proc.titulo.toLowerCase().includes(textoBusca.toLowerCase());
        const responsavelCorresponde = proc.responsavel.toLowerCase().includes(textoBusca.toLowerCase());
        const equipeCorresponde = !filtroEquipeId || proc.equipeId === filtroEquipeId;
        return (tituloCorresponde || responsavelCorresponde) && equipeCorresponde;
    });

    if (processosFiltrados.length === 0) {
        listaProcessosContainer.innerHTML = '<p class="text-center">Nenhum processo encontrado.</p>';
        return;
    }

    const processosOrdenados = ordenarProcessos(processosFiltrados);
    processosOrdenados.forEach(proc => {
        const card = criarCardProcesso(proc);
        listaProcessosContainer.appendChild(card);
    });
}

function criarCardProcesso(proc) {
    const card = document.createElement('div');
    card.classList.add('card', 'process-card');
    card.setAttribute('data-id', proc.id);
    
    // Adiciona as classes de estilo para prioridade e status
    card.classList.add(`border-${proc.prioridade}`);
    card.classList.add(`status-${proc.status}`);
    
    const valorFormatado = formatarValor(proc.valor);
    const equipe = getEquipeById(proc.equipeId);
    const nomeEquipe = equipe ? equipe.nome : 'Sem equipe';

    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${proc.titulo}</h5>
            <p class="card-text"><small class="text-muted">Equipe: ${nomeEquipe}</small></p>
            <p class="card-text">Responsável: ${proc.responsavel || '-'}</p>
            <p class="card-text status-badge status-${proc.status}">Status: ${proc.status}</p>
            <p class="card-text">Prioridade: ${proc.prioridade}</p>
            <p class="card-text">Valor: ${valorFormatado}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        preencherModalComProcesso(proc, equipes);
    });

    return card;
}

function formatarValor(valor) {
    let valorNumerico = parseFloat(valor) || 0; 
    if (isNaN(valorNumerico)) {
        valorNumerico = 0;
    }
    return valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
}

export function adicionarProcesso(processo) {
    processos.push(processo);
    salvarDados('processos', processos);
}

export function getProcessos() {
    return processos;
}

export function carregarProcessos() {
    const processosSalvos = localStorage.getItem('processos');
    return processosSalvos ? JSON.parse(processosSalvos) : [];
}

export function ordenarProcessos(processos) {
    const prioridadeOrdem = { 'urgente': 1, 'alta': 2, 'media': 3, 'baixa': 4 };
    return processos.sort((a, b) => {
        return prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade];
    });
}

