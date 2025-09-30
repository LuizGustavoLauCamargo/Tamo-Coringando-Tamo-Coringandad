// card.js
// Importa a função para preencher e abrir o modal ao clicar no card.
import { deleteProcessBtn, preencherModalComProcesso } from './modal.js';

/**
 * Cria e retorna um elemento HTML (card) para um processo específico.
 * * @param {Object} proc - O objeto de dados do processo.
 * @param {Array<Object>} equipes - A lista completa de equipes.
 * @param {boolean} isCompactView - Se deve renderizar em modo compacto.
 * @param {function(string): Object} getEquipeById - Função auxiliar para obter o objeto equipe pelo ID (preferencial).
 * @returns {HTMLElement} O elemento <div> do card do processo.
 */
export function criarCardProcesso(proc, equipes = [], isCompactView = false, getEquipeById) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Aplica classes CSS de borda e estilo
    card.classList.add('process-card');

  
    // Aplica a borda colordia baseada na prioridade (ex: border-alta)
    card.classList.add(`border-${proc.prioridade}`); 

    if (isCompactView) {
        card.classList.add('card-compact');
    }
    // Adiciona atributos de acessibilidade
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    // Destaque se o processo sofreu retrocesso (usando a classe 'alerta')
    if (proc.retrocessoMotivo) {
        card.classList.add('alerta'); 
    }

    // Ação ao clicar no card: abre o modal para edição/visualização
    card.addEventListener('click', () => {
        // Usa a função importada para preencher e exibir o modal
        preencherModalComProcesso(proc, equipes);
    });
    
    // 1. Título do Processo
    const titulo = document.createElement('h3');
    titulo.textContent = proc.titulo;
    card.appendChild(titulo);

    // 2. Busca do Nome da Equipe
    let nomeEquipe = 'Sem equipe';
    
    // Prioriza o uso da função auxiliar injetada (getEquipeById)
    if (getEquipeById) {
        const equipeObj = getEquipeById(proc.equipeId);
        nomeEquipe = equipeObj ? equipeObj.nome : 'Sem equipe';
    } else {
        // Fallback: procura na lista completa de equipes passada
        const equipeObj = Array.isArray(equipes) ? equipes.find(eq => String(eq.id) === String(proc.equipeId)) : null;
        nomeEquipe = equipeObj ? equipeObj.nome : 'Sem equipe';
    }

    // 3. Responsável e Equipe
    const responsavel = document.createElement('p');
    responsavel.innerHTML = `Responsável: <strong>${proc.responsavel || '-'}</strong>`;
    card.appendChild(responsavel);
    
    const equipe = document.createElement('p');
    equipe.innerHTML = `Equipe: <strong>${nomeEquipe}</strong>`;
    card.appendChild(equipe);

    // 4. Status e Prioridade (Container de sub-informações)
    const subInfoDiv = document.createElement('div');
    subInfoDiv.className = 'sub-info';

    // Badge de Status (ex: badge status pendente)
    const statusSpan = document.createElement('span');
    statusSpan.className = `badge status ${proc.status}`;
    statusSpan.textContent = proc.status.toUpperCase();
    subInfoDiv.appendChild(statusSpan);

    // Prioridade (ex: priority alta)
    const prioridadeSpan = document.createElement('span');
    prioridadeSpan.className = `priority ${proc.prioridade}`;
    prioridadeSpan.innerHTML = `Prioridade: <strong>${proc.prioridade.toUpperCase()}</strong>`;
    subInfoDiv.appendChild(prioridadeSpan);

    card.appendChild(subInfoDiv);

    // 5. Valor (Formatado em Reais - BRL)
    const valor = document.createElement('p');
    const valorFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(parseFloat(proc.valor || 0));
    valor.innerHTML = `Valor: <strong>${valorFormatado}</strong>`;
    card.appendChild(valor);

    // 6. Indicação de Retrocesso (se aplicável)
    if (proc.retrocessoMotivo) {
        const retrocesso = document.createElement('p');
        retrocesso.className = 'text-alerta';
        // Exibe uma prévia do motivo, limitada a 40 caracteres
        const motivoCurto = proc.retrocessoMotivo.length > 40 
                            ? proc.retrocessoMotivo.substring(0, 40) + '...'
                            : proc.retrocessoMotivo;
                            
        retrocesso.innerHTML = `⚠️ Retrocedido: <em>${motivoCurto}</em>`;
        card.appendChild(retrocesso);
    }

    return card;
}
