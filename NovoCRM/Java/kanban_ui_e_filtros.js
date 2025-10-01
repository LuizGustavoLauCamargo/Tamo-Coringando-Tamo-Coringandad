// ARQUIVO: kanban_ui_e_filtros.js (COMPLETO E FINALIZADO - REVISADO)

let processosContainer, equipesFiltroContainer, buscaInput;

export let filtroEquipeAtivo = 'todos';
export let buscaAtiva = '';

let processosArrayGlobal = [];
let equipesArrayGlobal = [];

export function inicializarUI(data, modal, alerta, equipesModal, afterRenderCallback) {
    processosContainer = document.getElementById('processosContainer');
    equipesFiltroContainer = document.getElementById('equipesFiltroContainer');
    buscaInput = document.getElementById('buscaInput');
    
    // Estilos de visualização dos filtros
    equipesFiltroContainer.style.display = 'flex';
    equipesFiltroContainer.style.gap = "20px"

    processosArrayGlobal = data.processos;
    equipesArrayGlobal = data.equipes;

    // Inicialização e Renderização
    inicializarFiltroEquipes(data.processos, data.equipes, filtrarProcessos, afterRenderCallback);
    // Chamada inicial para popular o Kanban
    filtrarProcessos(data.processos, data.equipes, '', 'todos', afterRenderCallback);

    // Eventos Globais 
    if (document.getElementById('novoProcessoBtn')) {
        document.getElementById('novoProcessoBtn').addEventListener('click', () => {
            // Passa o afterRenderCallback para o modal usar após salvar
            modal.abrirModalProcesso(data, { filtrarProcessos, filtroEquipeAtivo, buscaAtiva, afterRenderCallback }); 
        });
    }

    if (document.getElementById('gerenciarEquipesBtn')) {
        document.getElementById('gerenciarEquipesBtn').addEventListener('click', () => {
             // Passa o afterRenderCallback para o modal usar após salvar
            equipesModal.abrirModalGerenciarEquipes(data, { inicializarFiltroEquipes, filtrarProcessos, filtroEquipeAtivo, buscaAtiva, afterRenderCallback });
        });
    }

    if (buscaInput) {
        buscaInput.addEventListener('input', () => {
            buscaAtiva = buscaInput.value;
            filtrarProcessos(data.processos, data.equipes, buscaAtiva, filtroEquipeAtivo, afterRenderCallback);
        });
    }
}

// --- Funções de Filtro ---

export function inicializarFiltroEquipes(processosArray, equipesArray, callback, afterRenderCallback) {
    if (!equipesFiltroContainer) return;

    equipesFiltroContainer.innerHTML = ''; 

    // Botão "Todas as Equipes"
    const totalCount = processosArray.length;
    equipesFiltroContainer.appendChild(criarBotaoFiltro('todos', 'Todas as Equipes', totalCount, '#374151', callback, afterRenderCallback));

    // Botões individuais das equipes
    equipesArray.forEach(equipe => {
        const count = processosArray.filter(p => p.equipeId === equipe.id).length;
        // Mostra o botão se houver processos OU se a equipe estiver ativa no filtro
        if (count > 0 || equipe.id === filtroEquipeAtivo) { 
             equipesFiltroContainer.appendChild(criarBotaoFiltro(equipe.id, equipe.nome, count, equipe.cor, callback, afterRenderCallback));
        }
    });
}

function criarBotaoFiltro(id, nome, count, corHex, callback, afterRenderCallback) {
    const button = document.createElement('button');
    const isActive = id === filtroEquipeAtivo;
    
    button.className = `equipe-btn text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition duration-300 flex items-center whitespace-nowrap`;
    button.style.backgroundColor = corHex;
    button.style.color = '#ffffff'; 
    button.style.opacity = isActive ? '1' : '0.8';
    
    if (isActive) {
        button.classList.add('ring-4', 'ring-offset-2', 'ativo'); 
        button.style.setProperty('ring-color', corHex, 'important'); 
    }
    
    const countTextColor = corHex === '#374151' ? 'text-gray-800' : 'text-gray-900';
    
    button.innerHTML = `
        ${nome} 
        <span class="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-white ${countTextColor}">${count}</span>
    `;

    button.addEventListener('click', () => {
        filtroEquipeAtivo = id;
        callback(processosArrayGlobal, equipesArrayGlobal, buscaAtiva, id, afterRenderCallback);
        // Garante que o filtro visual seja atualizado
        inicializarFiltroEquipes(processosArrayGlobal, equipesArrayGlobal, callback, afterRenderCallback); 
    });

    return button;
}

// 🎯 CORREÇÃO CRÍTICA AQUI: O callback agora é tratado como opcional
export function filtrarProcessos(processosArray, equipesArray, busca = '', equipeId = 'todos', afterRenderCallback) {
    processosArrayGlobal = processosArray;
    equipesArrayGlobal = equipesArray;
    filtroEquipeAtivo = equipeId;
    buscaAtiva = busca;

    if (!processosContainer) return;
    
    // 1. Filtragem por Equipe
    let processosFiltrados = equipeId === 'todos' 
        ? processosArray 
        : processosArray.filter(p => p.equipeId === equipeId);

    // 2. Filtragem por Busca (Título, Responsável, Motivo Retrocesso)
    if (busca.trim()) {
        const termo = busca.trim().toLowerCase();
        processosFiltrados = processosFiltrados.filter(p => 
            p.titulo.toLowerCase().includes(termo) ||
            p.responsavel.toLowerCase().includes(termo) ||
            // A busca já inclui o Motivo Retrocesso (bom!)
            (p.retrocessoMotivo && p.retrocessoMotivo.toLowerCase().includes(termo))
        );
    }

    // 3. Renderização dos cards
    renderizarProcessos(processosFiltrados, equipesArray); 
    
    // 4. CHAMADA CRÍTICA: Se o afterRenderCallback for passado (não é nulo), ele é executado.
    if (afterRenderCallback) {
        afterRenderCallback(); 
    }
}

// --- Funções de Renderização ---

function renderizarProcessos(processosFiltrados, equipesArray) {
    if (!processosContainer) return;
    processosContainer.innerHTML = ''; // Limpa o Kanban 

    const colunas = {
        pendente: { titulo: 'Pendentes', processos: [] },
        em_andamento: { titulo: 'Em Andamento', processos: [] },
        concluido: { titulo: 'Concluídos', processos: [] }
    };

    processosFiltrados.forEach(p => {
        if (colunas[p.status]) {
            colunas[p.status].processos.push(p);
        }
    });

    Object.values(colunas).forEach(coluna => {
        const colunaDiv = criarColunaKanban(coluna.titulo);
        const colunaBody = colunaDiv.querySelector('.coluna-body');
        
        // Ordenação por prioridade (Correto: Urgente vem primeiro)
        coluna.processos.sort((a, b) => {
            const prioridades = ['urgente', 'alta', 'media', 'baixa'];
            return prioridades.indexOf(a.prioridade) - prioridades.indexOf(b.prioridade);
        }).forEach(processo => {
            colunaBody.appendChild(criarCardProcesso(processo, equipesArray));
        });

        colunaDiv.querySelector('.coluna-titulo-h2').textContent = `${coluna.titulo} (${coluna.processos.length})`;

        processosContainer.appendChild(colunaDiv);
    });
}

function criarColunaKanban(titulo) {
    const div = document.createElement('div');
    div.className = 'kanban-col flex-1 min-w-[300px] max-w-[400px] flex flex-col';
    div.innerHTML = `
        <h2 class="coluna-titulo-h2 text-xl font-bold mb-4 border-b pb-2 text-gray-700">${titulo} (0)</h2>
        <div class="coluna-body flex flex-col gap-3 h-full overflow-y-auto pr-2">
            </div>
    `;
    return div;
}

function criarCardProcesso(processo, equipesArray) {
    const obterNomeEquipe = (id) => (equipesArray.find(e => e.id === id) || { nome: 'N/A' }).nome;
    const obterCorEquipe = (id) => (equipesArray.find(e => e.id === id) || { cor: '#9ca3af' }).cor;

    const corHex = obterCorEquipe(processo.equipeId);
    const equipeNome = obterNomeEquipe(processo.equipeId);
    const proximaEquipeNome = processo.proximaEquipeId ? obterNomeEquipe(processo.proximaEquipeId) : '';
    
    // Formatação de Valor Monerário Correta
    const valorFormatado = (processo.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); 
    
    let prioridadeClasses = '';
    switch(processo.prioridade) {
        case 'urgente': prioridadeClasses = 'bg-red-600'; break;
        case 'alta': prioridadeClasses = 'bg-orange-500'; break;
        case 'media': prioridadeClasses = 'bg-yellow-500'; break;
        case 'baixa': prioridadeClasses = 'bg-gray-400'; break;
    }

    const card = document.createElement('div');
    card.className = 'processo-card bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border-l-4';
    card.style.borderLeftColor = corHex;
    card.style.borderLeftWidth = '6px';
    card.setAttribute('data-processo-id', processo.id);

    // Verifica se há anexos para exibir o ícone
    const temAnexos = processo.anexos && processo.anexos.length > 0;
    const anexoIcone = temAnexos ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.586a6 6 0 108.486 8.486l6.586-6.586"/></svg>` : '';

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800 text-lg">${processo.titulo}</h3>
            <div class="flex items-center gap-2">
                ${anexoIcone}
                <span class="text-xs font-semibold py-1 px-3 rounded-full text-white ${prioridadeClasses}">
                    ${processo.prioridade.charAt(0).toUpperCase() + processo.prioridade.slice(1)}
                </span>
            </div>
        </div>
        <p class="text-sm text-gray-500 mb-1">Responsável: <span class="font-medium text-gray-600">${processo.responsavel}</span></p>
        <p class="text-sm text-gray-500 mb-3">Valor: <span class="font-medium text-gray-600">${valorFormatado}</span></p>
        
        <div class="flex justify-between items-center border-t pt-2 mt-2">
            <span class="text-xs font-medium py-1 px-2 rounded-lg text-white" style="background-color: ${corHex};">
                ${equipeNome} 
            </span>
            ${proximaEquipeNome ? `
                <span class="text-xs text-gray-500 italic">Próximo: ${proximaEquipeNome}</span>
            ` : ''}
        </div>
        
        ${processo.retrocedido ? `
            <div class="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-xs text-red-700">
                <span class="font-semibold">RETROCEDIDO:</span> ${processo.retrocessoMotivo}
            </div>
        ` : ''}
    `;

    return card;
}