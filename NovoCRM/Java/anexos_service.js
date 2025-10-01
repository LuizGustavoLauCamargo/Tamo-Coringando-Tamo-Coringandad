// ARQUIVO: anexos_service.js (Finalizado com lógica de renderização e remoção)

let dataRefs = {}; // Referência ao módulo de dados (data_e_equipe.js)
let modalRefs = {}; // Referência ao módulo do modal (modal_processo.js)
let currentProcessId = null;

// Função auxiliar simples para formatar o tamanho do arquivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function inicializarAnexos(data, modal) {
    dataRefs = data;
    modalRefs = modal;

    // Listener para o botão de download geral (fora do modal) - (Se implementado no HTML)
    document.getElementById('downloadGeralBtn')?.addEventListener('click', baixarTodosArquivos);
    
    // Listener para o input de arquivo dentro do modal
    document.getElementById('anexarArquivoInput')?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            anexarNovosArquivos(e.target.files);
        }
    });
}

// Chamada pelo modal_processo.js quando um card é aberto ou limpo
export function carregarAnexosDoProcesso(processo) {
    currentProcessId = processo.id;
    // Garante que o processo.anexos é um array, mesmo que vazio
    if (!processo.anexos) {
        processo.anexos = [];
    }
    renderizarListaAnexos(processo.anexos);
}

// Renderiza a lista de anexos dentro do modal, adicionando botões de interação
function renderizarListaAnexos(anexosArray) {
    const container = document.getElementById('listaDeAnexosContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (anexosArray.length === 0) {
        container.innerHTML = '<span class="text-xs text-gray-500 italic">Nenhum arquivo anexado.</span>';
        return;
    }

    anexosArray.forEach((anexo, index) => {
        const div = document.createElement('div');
        // Usando Tailwind CSS para estilo
        div.className = 'flex justify-between items-center bg-gray-50 p-1 rounded text-xs'; 
        div.innerHTML = `
            <span class="truncate text-gray-700">${anexo.nome} <span class="text-xs text-gray-500">(${formatBytes(anexo.tamanho || 0)})</span></span>
            <div class="flex space-x-2">
                                <button data-index="${index}" class="text-indigo-500 hover:text-indigo-700 download-anexo-btn" title="Baixar ${anexo.nome}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                                <button data-index="${index}" class="text-red-500 hover:text-red-700 excluir-anexo-btn" title="Remover anexo">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    // Adicionar listeners para botões de excluir
    container.querySelectorAll('.excluir-anexo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne que o card/modal feche acidentalmente
            const index = e.currentTarget.dataset.index;
            removerAnexo(index);
        });
    });
    
    // Adicionar listener para botão de download simulado
    container.querySelectorAll('.download-anexo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne que o card/modal feche acidentalmente
            const index = e.currentTarget.dataset.index;
            const anexo = anexosArray[index];
            alert(`Simulando download do arquivo: ${anexo.nome} (${formatBytes(anexo.tamanho)})`);
        });
    });
}

function anexarNovosArquivos(files) {
    if (!currentProcessId) return;

    const processo = dataRefs.data.processos.find(p => p.id === currentProcessId);
    if (!processo) return;

    if (!processo.anexos) {
        processo.anexos = [];
    }

    // Apenas armazena o nome e o tamanho (o FILE REAL não é salvo neste modelo)
    Array.from(files).forEach(file => {
        processo.anexos.push({
            id: Date.now().toString(), // ID único
            nome: file.name,
            tamanho: file.size
        });
    });

    // 1. Re-renderiza a lista no modal para mostrar o novo anexo
    renderizarListaAnexos(processo.anexos);

    // 2. Notifica a UI principal para atualizar a contagem no card
    modalRefs.renderizarKanbanCompleto(); 

    // 3. Limpa o input para permitir anexar o mesmo arquivo novamente
    document.getElementById('anexarArquivoInput').value = '';
}

function removerAnexo(index) {
    const processo = dataRefs.data.processos.find(p => p.id === currentProcessId);
    if (!processo || !processo.anexos) return;

    // Remove o anexo do array usando o índice
    processo.anexos.splice(parseInt(index), 1); 
    
    // 1. Re-renderiza a lista no modal
    renderizarListaAnexos(processo.anexos);
    
    // 2. Notifica a UI principal para atualizar a contagem no card
    modalRefs.renderizarKanbanCompleto(); 
}

// Simulação de download em lote (função de exemplo)
function baixarTodosArquivos() {
    alert("Funcionalidade de Download em Lote (ZIP) requer um backend ou uma biblioteca específica. No momento, esta é apenas uma simulação.");

    const totalAnexos = dataRefs.data.processos.reduce((count, p) => count + (p.anexos ? p.anexos.length : 0), 0);
    console.log(`Simulando download de ${totalAnexos} anexos em ZIP.`);
}   