// ARQUIVO: main.js (FINAL - CORRIGIDO com DELEGAÇÃO DE EVENTOS e DOWNLOAD)

// --------------------------------------------------------------------------------
// MÓDULO: main.js
// Ponto de entrada da aplicação. Inicializa módulos e o listener de delegação.
// --------------------------------------------------------------------------------

import * as Data from './data_e_equipe.js'; 
import * as Alerta from './modal_alerta.js'; 
import * as ModalEquipe from './modal_equipes.js'; 
import * as ModalProcesso from './modal_processo.js'; 
import * as UI from './kanban_ui_e_filtros.js';
import * as anexos from './anexos_service.js'; 
import { simularDownloadTodos } from './render.js'; // 👈 Importa a função de download

// Função de inicialização principal
function inicializarApp() {
    console.log("✅ [MAIN] Aplicação inicializada. Iniciando módulos.");
    
    // 1. Inicializa Módulos
    Alerta.inicializarModalAlerta();
    ModalEquipe.inicializarModalEquipe(Data, UI);
    ModalProcesso.inicializarModalProcesso(Data, UI);
    anexos.inicializarAnexos(Data, ModalProcesso); 
    
    // 2. Inicializa a UI. Passamos a função de callback para reanexar listeners (caso necessário, mas a delegação resolve).
    // 🚨 Nota: Embora a delegação reduza a necessidade de um afterRenderCallback, mantemos a estrutura.
    UI.inicializarUI(Data, ModalProcesso, Alerta, ModalEquipe, null); 
    
    // 3. Configura o Listener ÚNICO (Delegação de Eventos)
    configurarListenerCard(Data, UI);
}

// ✅ NOVO: Funções de Delegação de Eventos para os Cards
// Anexa um único listener ao container pai para capturar todos os cliques em cards.
function configurarListenerCard(data, filtros) {
    const processosContainer = document.getElementById('processosContainer');
    if (!processosContainer) return;

    // Anexa UM ÚNICO listener ao container pai.
    processosContainer.addEventListener('click', (e) => {
        // 1. Verifica se o clique foi no botão de download
        const downloadBtn = e.target.closest('.download-all-btn');
        if (downloadBtn) {
            // Impede que o clique no botão de download propague para o card (e abra o modal)
            e.stopPropagation(); 
            
            console.log("💾 [MAIN] Delegação detectada no Botão de Download. Acionando serviço...");
            // Chama a função importada para simular o download
            simularDownloadTodos(e);
            return; // Encerra a execução do listener
        }

        // 2. Se não for o botão de download, verifica se foi um clique no card (ou qualquer outro elemento dentro dele)
        const card = e.target.closest('.processo-card');
        
        if (card) {
            const processoId = card.getAttribute('data-processo-id');
            console.log(`➡️ [MAIN] Delegação detectada no Card ID: ${processoId}. Abrindo modal...`);
            
            // Chama a função de abertura do modal  
            ModalProcesso.abrirModalProcesso(data, filtros, processoId); 
        }
    });
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarApp);