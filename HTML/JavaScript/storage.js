export function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

export function carregarDados(chave) {
    const dadosSalvos = localStorage.getItem(chave);
    return dadosSalvos ? JSON.parse(dadosSalvos) : null;
}