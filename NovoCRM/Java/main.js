// ARQUIVO: main.js (CORRIGIDO)

// --------------------------------------------------------------------------------
// MÓDULO: main.js
// Ponto de entrada da aplicação. Importa e inicializa todos os módulos.
// --------------------------------------------------------------------------------

// ✅ CORREÇÃO DE CAMINHO: Usar SOMENTE o caminho relativo './'
import * as Data from './data_e_equipe.js'; // Confirme o nome do arquivo (equipe ou equipes)
import * as Alerta from './modal_alerta.js'; 
import * as ModalEquipe from './modal_equipes.js'; 
import * as ModalProcesso from './modal_processo.js'; 
import * as UI from './kanban_ui_e_filtros.js';
import * as anexos from './anexos_service.js'; // ✅ NOVO MÓDULO DE ANEXOS


// Função de inicialização principal
function inicializarApp() {
    // 1. Inicializa o Módulo de Alerta
    Alerta.inicializarModalAlerta();

    // 2. Inicializa o Módulo de Equipes (precisa da Data e das funções de filtro da UI)
    ModalEquipe.inicializarModalEquipe(Data, UI);

    // 3. Inicializa o Módulo de Processos (precisa de Data e UI para salvar e atualizar)
    ModalProcesso.inicializarModalProcesso(Data, UI);
    
    // ✅ CORREÇÃO LÓGICA: Passa adicionarListenerDeEdicao como um callback para a UI.
    UI.inicializarUI(Data, ModalProcesso, Alerta, ModalEquipe, adicionarListenerDeEdicao); 
}

// Essa função anexa o listener de 'click' aos cards para abrir o modal de edição.
// (MANTIDA)
function adicionarListenerDeEdicao() {
    const processosContainer = document.getElementById('processosContainer');
    if (!processosContainer) return;

    // Remove listeners antigos (prevenção de duplicação) usando a técnica de cloneNode
    processosContainer.querySelectorAll('.processo-card').forEach(card => {
        // Clonamos e substituímos o nó para remover todos os event listeners de forma simples
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', () => {
            const processoId = newCard.getAttribute('data-processo-id');
            // Chama a função de abertura do modal, passando os dados e o ID
            ModalProcesso.abrirModalProcesso(Data, UI, processoId);
        });
    });
}

// ❌ BLOCO REMOVIDO: Este código causava o Uncaught TypeError e foi substituído pelo callback.
/*
const filtrarProcessosOriginal = UI.filtrarProcessos;
UI.filtrarProcessos = (processosArray, equipesArray, busca, equipeId) => {
    filtrarProcessosOriginal(processosArray, equipesArray, busca, equipeId);
    adicionarListenerDeEdicao();
};
*/

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarApp);