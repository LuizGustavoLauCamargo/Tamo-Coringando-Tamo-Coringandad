// ARQUIVO: kanban_ui_e_filtros.js (COMPLETO E CORRIGIDO)

// --------------------------------------------------------------------------------
// MÓDULO: kanban_ui_e_filtros.js
// Lógica de renderização da interface e manipulação de filtros.
// --------------------------------------------------------------------------------

let processosContainer, equipesFiltroContainer, buscaInput;

export let filtroEquipeAtivo = 'todos';
export let buscaAtiva = '';

// Variaveis globais de array que serão preenchidas por referência
let processosArrayGlobal = [];
let equipesArrayGlobal = [];

// ✅ MUDANÇA 1: Adicionar afterRenderCallback aos parâmetros
export function inicializarUI(data, modal, alerta, equipesModal, afterRenderCallback) {
    processosContainer = document.getElementById('processosContainer');
    equipesFiltroContainer = document.getElementById('equipesFiltroContainer');
    buscaInput = document.getElementById('buscaInput');

    // Inicializa a UI do Kanban
    // Armazena as referências globais
    processosArrayGlobal = data.processos;
    equipesArrayGlobal = data.equipes;

    // ✅ MUDANÇA 2: Passar afterRenderCallback
    inicializarFiltroEquipes(data.processos, data.equipes, filtrarProcessos, afterRenderCallback);
    filtrarProcessos(data.processos, data.equipes, '', 'todos', afterRenderCallback);

    // Eventos Globais
    if (document.getElementById('novoProcessoBtn')) {
        document.getElementById('novoProcessoBtn').addEventListener('click', () => {
            // Passa o objeto UI para que o modal possa chamar funções de filtro após salvar/atualizar
            modal.abrirModalProcesso(data, { filtrarProcessos, filtroEquipeAtivo, buscaAtiva }); 
        });
    }

    if (document.getElementById('gerenciarEquipesBtn')) {
        document.getElementById('gerenciarEquipesBtn').addEventListener('click', () => {
            // Passa funções de UI para que o modal possa atualizar os botões de filtro
            equipesModal.abrirModalGerenciarEquipes(data, { inicializarFiltroEquipes, filtrarProcessos, filtroEquipeAtivo, buscaAtiva, afterRenderCallback });
        });
    }

    if (buscaInput) {
        buscaInput.addEventListener('input', () => {
            buscaAtiva = buscaInput.value;
            // ✅ MUDANÇA 3: Passar afterRenderCallback
            filtrarProcessos(data.processos, data.equipes, buscaAtiva, filtroEquipeAtivo, afterRenderCallback);
        });
    }
}

// --- Funções de Filtro ---

// ✅ MUDANÇA 4: Adicionar afterRenderCallback aos parâmetros
export function inicializarFiltroEquipes(processosArray, equipesArray, callback, afterRenderCallback) {
    if (!equipesFiltroContainer) return;

    equipesFiltroContainer.innerHTML = ''; // Limpa os botões existentes

    // 1. Botão "Todas as Equipes"
    const totalCount = processosArray.length;
    // ✅ MUDANÇA 5: Passar afterRenderCallback
    equipesFiltroContainer.appendChild(criarBotaoFiltro('todos', 'Todas as Equipes', totalCount, '#374151', callback, afterRenderCallback));

    // 2. Botões das Equipes
    equipesArray.forEach(equipe => {
        const count = processosArray.filter(p => p.equipeId === equipe.id).length;
        // Mostra a equipe se tiver processos OU se for a equipe ativa
        if (count > 0 || equipe.id === filtroEquipeAtivo) { 
             // ✅ MUDANÇA 6: Passar afterRenderCallback
             equipesFiltroContainer.appendChild(criarBotaoFiltro(equipe.id, equipe.nome, count, equipe.cor, callback, afterRenderCallback));
        }
    });
}

// ✅ MUDANÇA 7: Adicionar afterRenderCallback aos parâmetros
function criarBotaoFiltro(id, nome, count, corHex, callback, afterRenderCallback) {
    const button = document.createElement('button');
    const isActive = id === filtroEquipeAtivo;
    
    // Configuração de classes e estilo dinâmico
    button.className = `equipe-btn text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition duration-300 flex items-center whitespace-nowrap`;
    
    // Aplica a cor de fundo e texto dinamicamente
    button.style.backgroundColor = corHex;
    button.style.color = '#ffffff'; 
    button.style.opacity = isActive ? '1' : '0.8';
    
    // Adiciona a classe ativa para o efeito de destaque
    if (isActive) {
        button.classList.add('ring-4', 'ring-offset-2', 'ativo'); // Adiciona a classe 'ativo' para usar o CSS customizado
        button.style.setProperty('ring-color', corHex, 'important'); 
    }
    
    const countTextColor = corHex === '#374151' ? 'text-gray-800' : 'text-gray-900';
    
    button.innerHTML = `
        ${nome} 
        <span class="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-white ${countTextColor}">${count}</span>
    `;

    button.addEventListener('click', () => {
        filtroEquipeAtivo = id;
        // ✅ MUDANÇA 8: Passar afterRenderCallback na chamada de callback (filtrarProcessos)
        callback(processosArrayGlobal, equipesArrayGlobal, buscaAtiva, id, afterRenderCallback);
        // ✅ MUDANÇA 9: Passar afterRenderCallback na recriação dos botões
        inicializarFiltroEquipes(processosArrayGlobal, equipesArrayGlobal, callback, afterRenderCallback); 
    });

    return button;
}

// ✅ MUDANÇA 10: Adicionar afterRenderCallback com valor padrão para a função principal
export function filtrarProcessos(processosArray, equipesArray, busca = '', equipeId = 'todos', afterRenderCallback = () => {}) {
    // Atualiza o estado global
    processosArrayGlobal = processosArray;
    equipesArrayGlobal = equipesArray;
    filtroEquipeAtivo = equipeId;
    buscaAtiva = busca;

    if (!processosContainer) return;
    
    // 1. Filtro por Equipe
    let processosFiltrados = equipeId === 'todos' 
        ? processosArray 
        : processosArray.filter(p => p.equipeId === equipeId);

    // 2. Filtro por Busca (título, responsável, motivo de retrocesso)
    if (busca.trim()) {
        const termo = busca.trim().toLowerCase();
        processosFiltrados = processosFiltrados.filter(p => 
            p.titulo.toLowerCase().includes(termo) ||
            p.responsavel.toLowerCase().includes(termo) ||
            (p.retrocessoMotivo && p.retrocessoMotivo.toLowerCase().includes(termo))
        );
    }

    // 3. Renderização
    // AQUI OCORRIA O ERRO! renderizarProcessos agora está definido abaixo.
    renderizarProcessos(processosFiltrados, equipesArray); 
    
    // ✅ MUDANÇA 11: Executar o callback (adicionarListenerDeEdicao) após a renderização
    afterRenderCallback(); 
}

// --- Funções de Renderização (Estavam faltando/invisíveis) ---

function renderizarProcessos(processosFiltrados, equipesArray) {
    if (!processosContainer) return;
    processosContainer.innerHTML = ''; // Limpa o container

    // 1. Agrupar por Status (Pendentes, Em Andamento, Concluídos)
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

    // 2. Renderizar as Colunas
    Object.values(colunas).forEach(coluna => {
        const colunaDiv = criarColunaKanban(coluna.titulo);
        const colunaBody = colunaDiv.querySelector('.coluna-body');
        
        // 3. Renderizar os Cards (Processos) dentro da coluna
        coluna.processos.sort((a, b) => {
            // Ordenação por prioridade: Urgente > Alta > Média > Baixa
            const prioridades = ['urgente', 'alta', 'media', 'baixa'];
            return prioridades.indexOf(a.prioridade) - prioridades.indexOf(b.prioridade);
        }).forEach(processo => {
            colunaBody.appendChild(criarCardProcesso(processo, equipesArray));
        });

        // Atualiza a contagem no título da coluna
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
    // Usando as funções de helpers que simulam as do data_e_equipes (Data)
    const obterNomeEquipe = (id) => (equipesArray.find(e => e.id === id) || { nome: 'N/A' }).nome;
    const obterCorEquipe = (id) => (equipesArray.find(e => e.id === id) || { cor: '#9ca3af' }).cor;

    const corHex = obterCorEquipe(processo.equipeId);
    const equipeNome = obterNomeEquipe(processo.equipeId);
    const proximaEquipeNome = processo.proximaEquipeId ? obterNomeEquipe(processo.proximaEquipeId) : '';
    const valorFormatado = (processo.valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Classes de Prioridade
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

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800 text-lg">${processo.titulo}</h3>
            <span class="text-xs font-semibold py-1 px-3 rounded-full text-white ${prioridadeClasses}">
                ${processo.prioridade.charAt(0).toUpperCase() + processo.prioridade.slice(1)}
            </span>
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