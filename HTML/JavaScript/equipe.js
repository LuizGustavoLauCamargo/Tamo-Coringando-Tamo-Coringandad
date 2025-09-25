import { processos, renderizarProcessos } from './processo.js';
import { salvarDados, carregarDados } from './storage.js';

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
    return novaEquipe;
}

export function excluirEquipe(equipeId) {
    const temProcessos = processos.some(p => p.equipeId === equipeId);
    if (temProcessos) {
        alert('Não é possível excluir uma equipe que possui processos.');
        return false;
    }

    if (confirm('Deseja realmente excluir esta equipe?')) {
        const index = equipes.findIndex(e => e.id === equipeId);
        if (index !== -1) equipes.splice(index, 1);
        salvarDados('equipes', equipes);

        renderizarFiltroEquipes(equipes, '');
        renderizarProcessos(processos, equipes, '', '');
    }
    return true;
}

export function renderizarFiltroEquipes(equipes, filtroEquipeId = '') {
    const container = document.getElementById('filtroEquipes');
    if (!container) return;
    container.innerHTML = '';

    const todasEquipes = [{ id: '', nome: 'Todos' }, ...equipes];

    todasEquipes.forEach((eq) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '5px';

        const btn = document.createElement('button');
        btn.textContent = eq.nome;
        btn.classList.add('btn-filtro');
        btn.dataset.id = eq.id;

        if (eq.id === filtroEquipeId || (!filtroEquipeId && eq.id === '')) {
            btn.classList.add('ativo');
        }

        if (eq.id !== '') {
            const btnExcluir = document.createElement('button');
            btnExcluir.innerHTML = '&times;';
            btnExcluir.classList.add('btn-excluir-equipe');
            btnExcluir.title = `Excluir ${eq.nome}`;
            btnExcluir.addEventListener('click', (e) => {
                e.stopPropagation(); // PARA evitar filtro ativar
                excluirEquipe(eq.id);
            });
            wrapper.appendChild(btnExcluir);
        }

        wrapper.prepend(btn);
        container.appendChild(wrapper);
    });
}
