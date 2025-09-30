// ARQUIVO: Java/anexos_service.js (Exemplo de UI Logic)

let dataRefs = {};
let modalRefs = {};
let currentProcessId = null;

export function inicializarAnexos(data, modal) {
    dataRefs = data;
    modalRefs = modal;

    // Listener para o botão de download geral (fora do modal)
    document.getElementById('downloadGeralBtn').addEventListener('click', baixarTodosArquivos);
    
    // Listener para o input de arquivo dentro do modal
    document.getElementById('anexarArquivoInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            anexarNovosArquivos(e.target.files);
        }
    });
}

// Chamada pelo modal_processo.js quando um card é aberto
export function carregarAnexosDoProcesso(processo) {
    currentProcessId = processo.id;
    renderizarListaAnexos(processo.anexos || []);
}

function renderizarListaAnexos(anexosArray) {
    const container = document.getElementById('listaDeAnexosContainer');
    container.innerHTML = '';

    if (anexosArray.length === 0) {
        container.innerHTML = '<span class="text-gray-500 italic">Nenhum arquivo anexado.</span>';
        return;
    }

    anexosArray.forEach((anexo, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-gray-50 p-1 rounded';
        div.innerHTML = `
            <span class="truncate">${anexo.nome}</span>
            <div class="flex space-x-2">
                <button data-index="${index}" class="text-indigo-500 hover:text-indigo-700 download-anexo-btn" title="Baixar ${anexo.nome}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                <button data-index="${index}" class="text-red-500 hover:text-red-700 excluir-anexo-btn" title="Remover anexo">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    // Adicionar listeners para botões de excluir (download é complexo de simular sem um backend)
    container.querySelectorAll('.excluir-anexo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            removerAnexo(index);
        });
    });
}

function anexarNovosArquivos(files) {
    if (!currentProcessId) return;

    const processo = dataRefs.processos.find(p => p.id === currentProcessId);
    if (!processo) return;

    if (!processo.anexos) {
        processo.anexos = [];
    }

    // Apenas armazena o nome e um ID. O FILE REAL não é salvo aqui!
    Array.from(files).forEach(file => {
        processo.anexos.push({
            id: Date.now(),
            nome: file.name,
            tamanho: file.size
        });
    });

    // Re-renderiza a lista no modal
    renderizarListaAnexos(processo.anexos);

    // Limpa o input para permitir anexar o mesmo arquivo novamente
    document.getElementById('anexarArquivoInput').value = '';
}

function removerAnexo(index) {
    const processo = dataRefs.processos.find(p => p.id === currentProcessId);
    if (!processo || !processo.anexos) return;

    processo.anexos.splice(index, 1);
    renderizarListaAnexos(processo.anexos);
}

function baixarTodosArquivos() {
    // ESTA PARTE REQUER UM BACKEND OU UMA BIBLIOTECA COMO JSZIP
    // No ambiente do navegador, não temos acesso aos arquivos reais para zipar.
    
    // ⚠️ Aviso ao usuário:
    alert("Funcionalidade de Download em Lote (ZIP) requer um backend ou uma biblioteca como JSZip para compactar os arquivos. No momento, esta é apenas uma simulação.");

    const totalAnexos = dataRefs.processos.reduce((count, p) => count + (p.anexos ? p.anexos.length : 0), 0);
    console.log(`Simulando download de ${totalAnexos} anexos em ZIP.`);
}