// --------------------------------------------------------------------------------
// MÓDULO: data_e_equipes.js
// Armazena dados mock, funções de manipulação de equipe e helpers.
// --------------------------------------------------------------------------------

// As cores são salvas como hexadecimais puros.
export let equipes = [
    { id: 'dev', nome: 'Desenvolvimento', cor: '#3b82f6' }, // blue-500
    { id: 'qa', nome: 'Controle de Qualidade', cor: '#10b981' }, // green-500
    { id: 'design', nome: 'Design UX/UI', cor: '#8b5cf6' }, // purple-500
    { id: 'comercial', nome: 'Comercial', cor: '#ef4444' }, // red-500
    { id: 'vendas', nome: 'Vendas', cor: '#f97316' }, // orange-500
];

export let processos = [
    { id: 'p1', titulo: 'Criação de Landing Page p/ Lançamento', responsavel: 'Ana Souza', valor: 5500.00, status: 'em_andamento', prioridade: 'alta', equipeId: 'dev', proximaEquipeId: 'qa', extras: [{nome: 'Design Aprovado', valor: 'Sim'}], historicoEquipes: ['design', 'dev'] },
    { id: 'p2', titulo: 'Revisão Contratual - Cliente Alpha', responsavel: 'João Silva', valor: 1200.00, status: 'pendente', prioridade: 'media', equipeId: 'comercial', proximaEquipeId: '', extras: [], historicoEquipes: ['comercial'] },
    { id: 'p3', titulo: 'Implementação de Fluxo de Login c/ Oauth', responsavel: 'Carlos Lima', valor: 8900.00, status: 'pendente', prioridade: 'baixa', equipeId: 'dev', proximaEquipeId: '', extras: [], historicoEquipes: ['dev'] },
    { id: 'p4', titulo: 'Testes de Acessibilidade (QA)', responsavel: 'Maria Clara', valor: 0, status: 'concluido', prioridade: 'media', equipeId: 'qa', proximaEquipeId: '', extras: [], historicoEquipes: ['dev', 'qa'] },
    { id: 'p5', titulo: 'Retrocedido - Revisão de Wireframes V2', responsavel: 'Pedro Alvares', valor: 3500.00, status: 'pendente', prioridade: 'urgente', equipeId: 'design', proximaEquipeId: '', extras: [], retrocedido: true, retrocessoMotivo: 'Os wireframes não contemplavam a nova regra de negócio do cliente.', historicoEquipes: ['comercial', 'design'] },
    { id: 'p6', titulo: 'Fechamento de Negócio Beta', responsavel: 'Ricardo Moura', valor: 15000.00, status: 'pendente', prioridade: 'alta', equipeId: 'vendas', proximaEquipeId: 'comercial', extras: [], historicoEquipes: ['vendas'] }
];

// --- Funções de Manipulação de Equipe ---

export function addEquipe(nome, id, corHex) {
    if (equipes.some(e => e.id === id)) {
        return { success: false, message: `O ID de equipe '${id}' já existe.` };
    }
    
    // Guarda o hex puro
    const newEquipe = {
        id: id,
        nome: nome,
        cor: corHex, 
    };
    
    equipes.push(newEquipe);
    return { success: true, equipe: newEquipe };
}

export function deleteEquipe(equipeId, processosArray) {
    // 1. Encontrar o índice da equipe
    const index = equipes.findIndex(e => e.id === equipeId);
    if (index === -1) {
        return { success: false, message: 'Equipe não encontrada.' };
    }

    // 2. Remover todos os processos associados a esta equipe
    const processosRemovidos = processosArray.filter(p => p.equipeId === equipeId);
    
    // ATENÇÃO: É preciso manipular o array 'processos' exportado para atualizar a referência global.
    // Embora o JS não permita reatribuir um 'export const', podemos manipulá-lo diretamente
    // ou, para garantir que a referência seja atualizada globalmente (como em main.js), 
    // faremos a alteração por manipulação de array (splice) se o 'processos' fosse um objeto
    // aninhado, mas aqui usaremos a abordagem onde o 'main' gerencia o array.
    // Para simplificar no contexto do módulo de dados, faremos a exclusão no array importado (processosArray)
    // e atualizaremos a referência 'processos' globalmente dentro deste módulo.
    
    // Para fins práticos de Módulos ES, vamos atualizar a referência global do Data.processos
    // para que a exclusão funcione no módulo 'main.js' que importa esta referência.

    // Remove os processos com splice para atualizar a referência
    const processosRestantes = processosArray.filter(p => p.equipeId !== equipeId);
    
    // Limpa o array 'processos' e adiciona os restantes
    processos.length = 0; // Limpa o array
    processos.push(...processosRestantes); // Adiciona os novos elementos
    
    // 3. Remover a equipe
    const equipeNome = equipes[index].nome;
    equipes.splice(index, 1);
    
    return { success: true, message: `Equipe '${equipeNome}' e ${processosRemovidos.length} processos associados foram removidos.` };
}

// --- Helpers ---

export function obterCorEquipe(id) {
    const equipe = equipes.find(e => String(e.id) === String(id));
    return equipe ? equipe.cor : '#9ca3af'; // Retorna o HEX puro
}

export function obterNomeEquipe(id) {
    if (id === '') return 'N/A';
    const equipe = equipes.find(e => String(e.id) === String(id));
    return equipe ? equipe.nome : `Equipe ID: ${id} (Removida)`;
}