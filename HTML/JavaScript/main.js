import { inicializarProcessos, renderizarProcessos, processos } from './processo.js';
import { inicializarEquipes, renderizarFiltroEquipes, equipes, adicionarEquipe } from './equipe.js';
import { inicializarModal, abrirModalNovoProcesso } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    inicializarEquipes();
    inicializarProcessos();
    inicializarModal();
    
    // Renderiza a lista inicial de processos e os botões de filtro
    renderizarFiltroEquipes(equipes);
    renderizarProcessos(processos, equipes);

    // Adiciona evento ao botão "Adicionar Processo"
    document.getElementById('addProcessBtn').addEventListener('click', () => {
        const equipePadrao = equipes[0]?.id; 
        abrirModalNovoProcesso(equipes, equipePadrao);
    });

    // Adiciona evento ao botão "Adicionar Equipe"
    document.getElementById('addEquipeBtn').addEventListener('click', () => {
        const nome = prompt('Digite o nome da nova equipe:');
        if (nome) {
            adicionarEquipe(nome);
            renderizarFiltroEquipes(equipes);
            renderizarProcessos(processos, equipes);
        }
    });

    // Gerencia o clique nos botões de filtro de equipe
    document.getElementById('filtroEquipes').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-filtro');
        if (!btn) return;

        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');

        const filtroEquipeId = btn.dataset.id;
        const termoBusca = document.getElementById('buscaInput').value;
        renderizarProcessos(processos, equipes, termoBusca, filtroEquipeId);
    });

    // Gerencia a busca em tempo real
    document.getElementById('buscaInput').addEventListener('input', (e) => {
        const termoBusca = e.target.value;
        const btnAtivo = document.querySelector('.btn-filtro.ativo');
        const filtroEquipeId = btnAtivo?.dataset.id || '';
        renderizarProcessos(processos, equipes, termoBusca, filtroEquipeId);
    });
});