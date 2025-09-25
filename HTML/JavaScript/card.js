import { preencherModalComProcesso } from './modal.js';

export function criarCardProcesso(proc, equipes = [], isCompactView = false) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Aplica as classes CSS de borda e prioridade
    card.classList.add('process-card');
    card.classList.add(`border-${proc.prioridade}`);

    if (isCompactView) {
        card.classList.add('card-compact');
    }
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    if (proc.retrocessoMotivo) {
        card.classList.add('alerta');
    }

    card.addEventListener('click', () => {
        preencherModalComProcesso(proc, equipes);
    });

    const titulo = document.createElement('h3');
    titulo.textContent = proc.titulo;
    card.appendChild(titulo);

    // Oculta informações extras na visualização compacta
    if (!isCompactView) {
        const responsavel = document.createElement('p');
        responsavel.innerHTML = `<strong>Responsável:</strong> ${proc.responsavel || '-'}`;
        responsavel.className = 'card-responsavel';
        card.appendChild(responsavel);
    
        const equipeObj = Array.isArray(equipes) ? equipes.find(eq => eq.id.toString() === proc.equipeId.toString()) : null;
        const nomeEquipe = equipeObj ? equipeObj.nome : 'Sem equipe';
        const equipe = document.createElement('p');
        equipe.innerHTML = `<strong>Equipe:</strong> ${nomeEquipe}`;
        equipe.className = 'card-equipe';
        card.appendChild(equipe);
    }
    
    const valor = document.createElement('p');
    valor.innerHTML = `<strong>Valor:</strong> R$ ${proc.valor ?? '0,00'}`;
    valor.className = 'card-valor';
    card.appendChild(valor);

    if (!isCompactView) {
        const subInfoDiv = document.createElement('div');
        subInfoDiv.className = 'sub-info';

        const statusSpan = document.createElement('span');
        statusSpan.className = `badge status ${proc.status}`;
        statusSpan.textContent = proc.status;
        subInfoDiv.appendChild(statusSpan);

        const prioridadeSpan = document.createElement('span');
        prioridadeSpan.className = `priority ${proc.prioridade}`;
        prioridadeSpan.innerHTML = `<strong>Prioridade:</strong> ${proc.prioridade}`;
        subInfoDiv.appendChild(prioridadeSpan);

        card.appendChild(subInfoDiv);
    }
    
    if (proc.retrocessoMotivo) {
        const retrocessoP = document.createElement('p');
        retrocessoP.className = 'motivo-retrocesso';
        retrocessoP.innerHTML = `<strong>Retrocedido:</strong> ${proc.retrocessoMotivo}`;
        card.appendChild(retrocessoP);
    }

    const extrasPreenchidos = (proc.extras || []).filter(extra => extra.nome.trim() || extra.valor.trim() || (extra.arquivos && extra.arquivos.length > 0));
    if (extrasPreenchidos.length > 0 && !isCompactView) {
        const extrasDiv = document.createElement('div');
        extrasDiv.className = 'extras-card';
        
        extrasPreenchidos.forEach(extra => {
            const extraP = document.createElement('p');
            extraP.innerHTML = `<strong>${extra.nome}:</strong> ${extra.valor || ''}`;
            extrasDiv.appendChild(extraP);
        });
        card.appendChild(extrasDiv);
    }

    const todosOsArquivos = extrasPreenchidos.flatMap(extra => extra.arquivos || []);
    if (todosOsArquivos.length > 0) {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.title = 'Baixar todos os anexos';
        
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation()
            const zip = new JSZip();
            todosOsArquivos.forEach((file, index) => {
                zip.file(file.name, file);
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${proc.titulo}_anexos.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        card.appendChild(downloadBtn);
    }

    return card;
}