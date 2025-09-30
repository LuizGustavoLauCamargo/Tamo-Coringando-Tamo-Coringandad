// ... (Continuação do módulo kanban_ui_e_filtros.js)

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
    renderizarProcessos(processosFiltrados, equipesArray);



// --- Funções de Renderização ---

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
        
        // 3. Renderizar os Cards (Processos) dentro da coluna
        coluna.processos.sort((a, b) => {
            // Ordenação por prioridade: Urgente > Alta > Média > Baixa
            const prioridades = ['urgente', 'alta', 'media', 'baixa'];
            return prioridades.indexOf(a.prioridade) - prioridades.indexOf(b.prioridade);
        }).forEach(processo => {
            colunaDiv.querySelector('.coluna-body').appendChild(criarCardProcesso(processo, equipesArray));
        });

        processosContainer.appendChild(colunaDiv);
    });
}

function criarColunaKanban(titulo) {
    const div = document.createElement('div');
    div.className = 'kanban-col flex-1 min-w-[300px] max-w-[400px]';
    div.innerHTML = `
        <h2 class="text-xl font-bold mb-4 border-b pb-2 text-gray-700">${titulo} (${document.querySelector('.kanban-col:last-child')?.querySelectorAll('.processo-card').length || 0})</h2>
        <div class="coluna-body flex flex-col gap-3 h-full overflow-y-auto pr-2">
            </div>
    `;
    // O número de cards é atualizado no main.js, mas a estrutura já está pronta.
    return div;
}

function criarCardProcesso(processo, equipesArray) {
    // Usando as funções do módulo data_e_equipes.js
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

    // Adiciona o listener para abrir o modal de edição
    card.addEventListener('click', () => {
        // A função de abertura do modal deve ser passada na inicialização
        // Como 'modal' não está disponível aqui, essa lógica deve estar no main.js
    });

    return card;
}