// ARQUIVO: render.js (Responsável por construir e injetar o HTML)

// --------------------------------------------------------------------------------
// FUNÇÕES DE UTILIDADE
// --------------------------------------------------------------------------------

/**
 * Função utilitária simples para formatar o tamanho do arquivo
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string} Tamanho formatado.
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// --------------------------------------------------------------------------------
// LÓGICA DO BOTÃO 'BAIXAR TODOS' (Integração de Anexos)
// --------------------------------------------------------------------------------

/**
 * Função utilitária para gerar o HTML do botão de download.
 * @param {string} processoId - ID do processo.
 * @param {number} count - Número de anexos.
 * @returns {string} - O HTML do botão ou string vazia.
 */
export function gerarHtmlBotaoDownload(processoId, count) {
    if (count === 0) {
        return '';
    }
    
    const baseClasses = "download-all-btn flex items-center text-xs font-semibold hover:underline";
    const colorClasses = "text-indigo-600 hover:text-indigo-800";
    
    return `
        <button type="button" class="${baseClasses} ${colorClasses}" data-processo-id="${processoId}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Todos (${count})
        </button>
    `;
}

/**
 * Simula o download de todos os anexos de um processo.
 * IMPORTANTE: Esta função é chamada via DELEGAÇÃO DE EVENTOS no main.js
 * @param {Event} event - O evento de clique.
 */
export function simularDownloadTodos(event) {
    const button = event.currentTarget;
    const processoId = button.getAttribute('data-processo-id');
    
    // Supondo que o objeto 'data' esteja acessível ou importado aqui (Se não, ajuste o import)
    // Para simplificar, vou assumir que 'data' é passado ou importado, mas aqui faremos um mock
    
    // **Atenção: Você precisará garantir que 'data.processos' está acessível aqui.**
    // Se o seu 'data_e_equipe.js' exporta o objeto 'data', você deve importá-lo:
    // import { data } from './data_e_equipe.js'; 
    const data = window.KANBAN_DATA; // Assumindo uma forma de acesso global temporária, ou importe.
    
    if (!data) return; 

    const processo = data.processos.find(p => p.id === processoId);
    if (!processo || !processo.anexos || processo.anexos.length === 0) {
        alert('Nenhum anexo encontrado para download.');
        return;
    }

    const numAnexos = processo.anexos.length;
    
    button.disabled = true;
    button.innerHTML = `<span class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m15.356-5h-5M4 20v-5h.582m15.356-2A8.001 8.001 0 014.582 15m15.356 5h-5"/></svg> Baixando (${numAnexos})</span>`;

    console.log(`Iniciando simulação de download de ${numAnexos} arquivo(s)...`);

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = gerarHtmlBotaoDownload(processoId, numAnexos);
        
        alert(`O download (simulado) de ${numAnexos} arquivo(s) foi concluído para o processo "${processo.titulo}".`);
    }, 1500); 
}


// --------------------------------------------------------------------------------
// FUNÇÕES DE RENDERIZAÇÃO DO KANBAN
// --------------------------------------------------------------------------------

/**
 * Cria o HTML para um único card de processo.
 * @param {object} processo - O objeto de processo.
 * @param {string} equipeCor - A cor da equipe.
 * @returns {string} - O HTML do card.
 */
function criarCardProcesso(processo, equipeCor, obterNomeEquipe) {
    const isUrgente = processo.prioridade === 'urgente';
    const isRetrocedido = processo.retrocedido;
    const numAnexos = processo.anexos ? processo.anexos.length : 0;
    
    let prioridadeBg = '';
    let prioridadeText = processo.prioridade.charAt(0).toUpperCase() + processo.prioridade.slice(1);

    if (isUrgente) {
        prioridadeBg = 'bg-red-600 text-white';
    } else {
        // Cores baseadas na prioridade normal
        switch (processo.prioridade) {
            case 'alta': prioridadeBg = 'bg-yellow-500 text-gray-900'; break;
            case 'media': prioridadeBg = 'bg-green-500 text-gray-900'; break;
            case 'baixa': prioridadeBg = 'bg-gray-400 text-gray-900'; break;
        }
    }
    
    // Adiciona uma borda destacada para processos retrocedidos/urgentes
    const borderClass = isRetrocedido ? 'border-2 border-red-500' : 'border-gray-200';

    // Conteúdo extra
    const extrasHtml = (processo.extras || []).map(extra => `
        <span class="text-xs text-gray-500 ml-2">| ${extra.nome}: ${extra.valor}</span>
    `).join('');

    // Ícone de Anexos
    const anexosIcon = numAnexos > 0 ? `
        <span class="text-xs text-gray-500 flex items-center ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a3 3 0 00-4.242-4.242l-7.81 7.81a4 4 0 005.656 5.656L18 13" />
            </svg>
            ${numAnexos}
        </span>
    ` : '';
    
    // Renderização do botão de Próxima Equipe (somente se status for 'concluido' e houver equipe selecionada)
    let nextEquipeHtml = '';
    if (processo.status === 'concluido' && processo.proximaEquipeId) {
        const proximaEquipeNome = obterNomeEquipe(processo.proximaEquipeId);
        nextEquipeHtml = `<div class="mt-2 text-xs text-indigo-700 font-semibold border-t pt-1">
            Próximo: ${proximaEquipeNome}
        </div>`;
    }


    return `
        <div class="p-3 bg-white rounded-lg shadow-sm mb-3 cursor-pointer processo-card ${borderClass}" 
             data-processo-id="${processo.id}">
            
            <div class="flex justify-between items-start mb-2">
                <p class="text-sm font-semibold text-gray-800 break-words">${processo.titulo}</p>
                <span class="ml-2 px-2 py-0.5 rounded-full ${prioridadeBg} text-xs font-bold whitespace-nowrap">${prioridadeText}</span>
            </div>
            
            <div class="text-xs text-gray-600 mb-2">
                <span class="font-medium">R$: ${processo.valor.toFixed(2).replace('.', ',')}</span>
                ${extrasHtml}
            </div>

            <div class="card-footer mt-2 border-t pt-2">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500">${processo.responsavel || 'Sem Responsável'}</span>
                    
                    ${anexosIcon}
                </div>
                
                ${nextEquipeHtml}

                ${numAnexos > 0 ? `
                    <div class="mt-2 text-right">
                        ${gerarHtmlBotaoDownload(processo.id, numAnexos)}
                    </div>
                ` : ''}

            </div>

        </div>
    `;
}

/**
 * Renderiza os botões de filtro de equipe.
 * @param {object[]} equipes - Lista de equipes.
 * @param {string} filtroEquipeAtivo - ID da equipe ativa.
 */
export function renderizarEquipesFiltro(equipes, filtroEquipeAtivo) {
    const container = document.getElementById('equipesFiltroContainer');
    if (!container) return;

    let html = `
        <button data-equipe-id="todos" class="btn-filtro-equipe ${filtroEquipeAtivo === 'todos' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}">
            Todos
        </button>
    `;

    equipes.forEach(equipe => {
        const isActive = equipe.id === filtroEquipeAtivo;
        const style = isActive ? `background-color: ${equipe.cor}; color: white;` : `border: 1px solid ${equipe.cor}; color: ${equipe.cor}; background-color: white;`;

        html += `
            <button data-equipe-id="${equipe.id}" style="${style}" class="btn-filtro-equipe font-semibold py-2 px-4 rounded-lg text-sm transition duration-150">
                ${equipe.nome}
            </button>
        `;
    });

    container.innerHTML = html;
}

/**
 * Renderiza todas as colunas do Kanban com os processos filtrados.
 * @param {object[]} processosFiltrados - A lista de processos após o filtro.
 * @param {object[]} equipes - Lista de todas as equipes.
 * @param {function} obterNomeEquipe - Função para obter nome da equipe pelo ID.
 * @param {string} filtroEquipeAtivo - ID da equipe atualmente ativa.
 */
export function renderizarProcessos(processosFiltrados, equipes, obterNomeEquipe, filtroEquipeAtivo) {
    const container = document.getElementById('processosContainer');
    if (!container) return;

    const statusColunas = [
        { id: 'pendente', titulo: 'A Fazer' },
        { id: 'em_andamento', titulo: 'Em Andamento' },
        { id: 'concluido', titulo: 'Concluído' }
    ];

    let kanbanHtml = '';

    statusColunas.forEach(coluna => {
        const processosDaColuna = processosFiltrados.filter(p => p.status === coluna.id);
        const processosCount = processosDaColuna.length;

        let cardsHtml = '';
        processosDaColuna.forEach(processo => {
            const equipe = equipes.find(e => e.id === processo.equipeId);
            const equipeCor = equipe ? equipe.cor : '#9CA3AF';
            cardsHtml += criarCardProcesso(processo, equipeCor, obterNomeEquipe);
        });

        // Título da Coluna com o nome da equipe ativa
        const equipeTitulo = filtroEquipeAtivo === 'todos' ? 'Todos' : obterNomeEquipe(filtroEquipeAtivo);
        const colunaTitulo = filtroEquipeAtivo === 'todos' ? coluna.titulo : `${equipeTitulo} - ${coluna.titulo}`;


        kanbanHtml += `
            <div class="flex-1 min-w-[300px] bg-gray-100 rounded-xl p-4 shadow-inner">
                <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                    ${colunaTitulo}
                    <span class="text-sm font-normal text-gray-500">(${processosCount})</span>
                </h3>
                <div class="processos-coluna" data-status-id="${coluna.id}">
                    ${cardsHtml}
                    ${processosCount === 0 ? '<p class="text-sm text-gray-500 italic">Nenhum processo.</p>' : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = kanbanHtml;
}       