(() => {
  // Dados iniciais
  let equipes = [
    { id: 'equipe1', nome: 'Equipe A' },
    { id: 'equipe2', nome: 'Equipe B' },
    { id: 'equipe3', nome: 'Equipe C' },
  ];

  let processos = [
    {
      id: 'p1',
      titulo: 'Processo 1',
      responsavel: 'João',
      valor: 'R$ 1.000,00',
      status: 'pendente',
      prioridade: 'alta',
      equipeId: 'equipe1',
      extras: [{ nome: 'Descrição', valor: 'Detalhes do processo 1', arquivos: [] }],
      arquivos: [],
      motivoRetrocesso: null, // novo campo para retrocesso
    },
    {
      id: 'p2',
      titulo: 'Processo 2',
      responsavel: 'Maria',
      valor: 'R$ 500,00',
      status: 'analise',
      prioridade: 'media',
      equipeId: 'equipe2',
      extras: [],
      arquivos: [],
      motivoRetrocesso: null,
    },
  ];

  let processoSelecionadoId = null;
  let filtroEquipeAtivo = null;
  let textoBusca = '';

  // DOM refs
  const filtroEquipesDiv = document.getElementById('filtroEquipes');
  const teamsContainer = document.getElementById('teamsContainer');
  const buscaInput = document.getElementById('buscaInput');
  const addProcessBtn = document.getElementById('addProcessBtn');
  const addEquipeBtn = document.getElementById('addEquipeBtn');

  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalTituloInput = document.getElementById('modalTituloInput');
  const modalResponsavelInput = document.getElementById('modalResponsavelInput');
  // Substitui prazo por valor
  let modalValorInput = null; // vamos criar dinamicamente depois
  const modalStatusInput = document.getElementById('modalStatusInput');
  const modalPrioridadeInput = document.getElementById('modalPrioridadeInput');
  const modalEquipeInput = document.getElementById('modalEquipeInput');
  const modalProximaEquipeInput = document.getElementById('modalProximaEquipeInput');
  const proximaEquipeContainer = document.getElementById('proximaEquipeContainer');
  const extrasContainer = document.getElementById('extrasContainer');
  const addExtraFieldBtn = document.getElementById('addExtraFieldBtn');
  const filesContainer = document.getElementById('filesContainer');
  const fileInput = document.getElementById('fileInput');

  const deleteProcessBtn = document.getElementById('deleteProcessBtn');
  const saveModalBtn = document.getElementById('saveModalBtn');
  const enviarModalBtn = document.getElementById('enviarModalBtn');

  // NOVO: Botão Retroceder
  let retrocederBtn = null;
  // NOVO: Campo obrigatório motivo retrocesso
  let motivoRetrocessoContainer = null;
  let motivoRetrocessoInput = null;

  // --- Funções auxiliares ---

  function gerarId() {
    return 'id' + Math.random().toString(36).substr(2, 9);
  }

  function filtrarProcessos() {
    return processos.filter(proc => {
      const equipeOk = filtroEquipeAtivo ? proc.equipeId === filtroEquipeAtivo : true;
      const buscaOk = proc.titulo.toLowerCase().includes(textoBusca) ||
        proc.responsavel.toLowerCase().includes(textoBusca);
      return equipeOk && buscaOk;
    });
  }

  // --- Render filtro equipes com botão excluir ---
  function renderizarFiltroEquipes() {
    filtroEquipesDiv.innerHTML = '';

    // Botão todas
    const btnTodas = document.createElement('button');
    btnTodas.textContent = 'Todas';
    btnTodas.type = 'button';
    btnTodas.classList.toggle('selected', filtroEquipeAtivo === null);
    btnTodas.addEventListener('click', () => {
      filtroEquipeAtivo = null;
      renderizarFiltroEquipes();
      renderizarProcessos();
    });
    filtroEquipesDiv.appendChild(btnTodas);

    equipes.forEach(eq => {
      const btnWrapper = document.createElement('div');
      btnWrapper.className = 'btn-equipe-wrapper';

      const btn = document.createElement('button');
      btn.textContent = eq.nome;
      btn.type = 'button';
      btn.classList.toggle('selected', filtroEquipeAtivo === eq.id);
      btn.addEventListener('click', () => {
        filtroEquipeAtivo = eq.id;
        renderizarFiltroEquipes();
        renderizarProcessos();
      });
      btnWrapper.appendChild(btn);

      // Botão excluir equipe
      const btnExcluir = document.createElement('button');
      btnExcluir.type = 'button';
      btnExcluir.className = 'btn-excluir-equipe';
      btnExcluir.title = `Excluir equipe "${eq.nome}"`;
      btnExcluir.textContent = '×';
      btnExcluir.addEventListener('click', e => {
        e.stopPropagation();
        excluirEquipe(eq.id);
      });
      btnWrapper.appendChild(btnExcluir);

      filtroEquipesDiv.appendChild(btnWrapper);
    });
  }

  // Excluir equipe com confirmação e checar se há processos vinculados
  function excluirEquipe(equipeId) {
    const temProcessos = processos.some(p => p.equipeId === equipeId);
    if (temProcessos) {
      alert('Não é possível excluir uma equipe que possui processos vinculados.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
      equipes = equipes.filter(e => e.id !== equipeId);
      // Se filtro ativo for essa equipe, limpa filtro
      if (filtroEquipeAtivo === equipeId) filtroEquipeAtivo = null;
      carregarEquipesNoSelect();
      renderizarFiltroEquipes();
      renderizarProcessos();
    }
  }

  function renderizarProcessos() {
    teamsContainer.innerHTML = '';

    const processosFiltrados = filtrarProcessos();

    if (processosFiltrados.length === 0) {
      teamsContainer.textContent = 'Nenhum processo encontrado.';
      return;
    }

    equipes.forEach(equipe => {
      const processosDaEquipe = processosFiltrados.filter(p => p.equipeId === equipe.id);
      if (processosDaEquipe.length === 0) return;

      const section = document.createElement('section');
      section.setAttribute('tabindex', '-1');
      section.classList.add('team-section');

      const h2 = document.createElement('h2');
      h2.textContent = equipe.nome;
      section.appendChild(h2);

      processosDaEquipe.forEach(proc => {
        const card = criarCardProcesso(proc);
        section.appendChild(card);
      });

      teamsContainer.appendChild(section);
    });
  }

  // Cria card do processo, incluindo motivo retrocesso se houver
  function criarCardProcesso(proc) {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.dataset.processoId = proc.id;

    if (proc.status === 'pendente' && proc.prioridade === 'alta') {
      card.classList.add('alerta');
    }

    const h3 = document.createElement('h3');
    h3.textContent = proc.titulo;
    card.appendChild(h3);

    const responsavelP = document.createElement('p');
    responsavelP.textContent = `Responsável: ${proc.responsavel || '-'}`;
    card.appendChild(responsavelP);

    // Valor no lugar do prazo
    const valorP = document.createElement('p');
    valorP.textContent = `Valor: ${proc.valor || '-'}`;
    card.appendChild(valorP);

    // Status badge
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge status ${proc.status}`;
    statusBadge.textContent = proc.status;
    card.appendChild(statusBadge);

    // Prioridade
    const prioridadeSpan = document.createElement('span');
    prioridadeSpan.className = `priority ${proc.prioridade}`;
    prioridadeSpan.textContent = `Prioridade: ${proc.prioridade}`;
    card.appendChild(prioridadeSpan);

    // Motivo retrocesso (se houver)
    if (proc.motivoRetrocesso) {
      const motivoDiv = document.createElement('div');
      motivoDiv.className = 'motivo-retrocesso';
      motivoDiv.innerHTML = `<strong>Motivo do Retrocesso:</strong> ${proc.motivoRetrocesso}`;
      card.appendChild(motivoDiv);
    }

    // Extras com arquivos
    if (proc.extras && proc.extras.length) {
      const extrasDiv = document.createElement('div');
      extrasDiv.className = 'extras-card';

      proc.extras.forEach(extra => {
        const extraItem = document.createElement('div');
        extraItem.className = 'extra-item';

        const label = document.createElement('em');
        label.textContent = `${extra.nome}: `;
        extraItem.appendChild(label);

        const valorSpan = document.createElement('span');
        valorSpan.textContent = extra.valor;
        extraItem.appendChild(valorSpan);

        // Arquivos anexados no extra
        if (extra.arquivos && extra.arquivos.length) {
          const arquivosList = document.createElement('ul');
          arquivosList.className = 'arquivos-extra-list';
          extra.arquivos.forEach((file, i) => {
            const li = document.createElement('li');
            // Cria link para download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = file.name;
            link.textContent = file.name;
            li.appendChild(link);
            arquivosList.appendChild(li);
          });
          extraItem.appendChild(arquivosList);
        }

        extrasDiv.appendChild(extraItem);
      });

      card.appendChild(extrasDiv);
    }

    // Arquivos gerais do processo
    if (proc.arquivos && proc.arquivos.length) {
      const arquivosDiv = document.createElement('div');
      arquivosDiv.className = 'arquivos-processo';

      const label = document.createElement('strong');
      label.textContent = 'Arquivos:';
      arquivosDiv.appendChild(label);

      const ul = document.createElement('ul');
      proc.arquivos.forEach((file, i) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        link.textContent = file.name;
        li.appendChild(link);
        ul.appendChild(li);
      });
      arquivosDiv.appendChild(ul);

      card.appendChild(arquivosDiv);
    }

    card.addEventListener('click', () => abrirModal(proc.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirModal(proc.id);
      }
    });

    return card;
  }

  // --- Modal ---

  function abrirModal(processoId) {
    processoSelecionadoId = processoId;
    const proc = processos.find(p => p.id === processoId);
    if (!proc) return;

    modalTituloInput.value = proc.titulo || '';
    modalResponsavelInput.value = proc.responsavel || '';
    modalStatusInput.value = proc.status || 'pendente';
    modalPrioridadeInput.value = proc.prioridade || 'baixa';

    carregarEquipesNoSelect(proc.equipeId, proc.proximaEquipeId);
    carregarProximaEquipe(proc.equipeId);

    // Criar input Valor dinamicamente (se não existir)
    if (!modalValorInput) {
      modalValorInput = document.createElement('input');
      modalValorInput.type = 'text';
      modalValorInput.id = 'modalValorInput';
      modalValorInput.placeholder = 'Valor';
      modalValorInput.style.marginTop = '10px';
      modalValorInput.style.width = '100%';
      modalValorInput.style.boxSizing = 'border-box';
      modalValorInput.style.padding = '5px';
      modalValorInput.style.fontSize = '1rem';
      modalValorInput.setAttribute('aria-label', 'Valor');
      modalStatusInput.parentNode.insertBefore(modalValorInput, modalPrioridadeInput);
    }
    modalValorInput.value = proc.valor || '';

    // Renderizar extras no modal
    carregarExtrasModal(proc.extras);

    // Renderizar arquivos gerais do processo
    carregarArquivosModal(proc.arquivos);

    // Limpar campo motivo retrocesso
    criarCampoMotivoRetrocesso(false);

    // Mostrar ou esconder botão retroceder (se não for primeira equipe)
    const indiceEquipeAtual = equipes.findIndex(e => e.id === proc.equipeId);
    if (indiceEquipeAtual > 0) {
      criarBotaoRetroceder(true);
    } else {
      criarBotaoRetroceder(false);
    }

    limparMensagensErro();

    modal.style.display = 'block';
    modal.focus();
  }

  function fecharModal() {
    processoSelecionadoId = null;
    modal.style.display = 'none';
    extrasContainer.innerHTML = '';
    filesContainer.innerHTML = '';
    if (modalValorInput) {
      modalValorInput.remove();
      modalValorInput = null;
    }
    if (retrocederBtn) {
      retrocederBtn.remove();
      retrocederBtn = null;
    }
    if (motivoRetrocessoContainer) {
      motivoRetrocessoContainer.remove();
      motivoRetrocessoContainer = null;
    }
    limparMensagensErro();
  }

  function carregarEquipesNoSelect(selectedEquipeId = null, selectedProximaEquipeId = null) {
    modalEquipeInput.innerHTML = '';
    modalProximaEquipeInput.innerHTML = '';

    equipes.forEach(eq => {
      const opt = document.createElement('option');
      opt.value = eq.id;
      opt.textContent = eq.nome;
      if (eq.id === selectedEquipeId) opt.selected = true;
      modalEquipeInput.appendChild(opt);

      const optProx = document.createElement('option');
      optProx.value = eq.id;
      optProx.textContent = eq.nome;
      if (eq.id === selectedProximaEquipeId) optProx.selected = true;
      modalProximaEquipeInput.appendChild(optProx);
    });
  }

  function carregarProximaEquipe(equipeAtualId) {
    // Próxima equipe será a seguinte na lista de equipes, se houver
    const idxAtual = equipes.findIndex(e => e.id === equipeAtualId);
    if (idxAtual >= 0 && idxAtual < equipes.length - 1) {
      modalProximaEquipeInput.value = equipes[idxAtual + 1].id;
    } else {
      modalProximaEquipeInput.value = '';
    }
  }

  function carregarExtrasModal(extras = []) {
    extrasContainer.innerHTML = '';

    extras.forEach((extra, idx) => {
      const div = criarExtraField(extra.nome, extra.valor, extra.arquivos || [], idx);
      extrasContainer.appendChild(div);
    });
  }

  // Cria campo extra com nome, valor e input para arquivos
  function criarExtraField(nome = '', valor = '', arquivos = [], idx = null) {
    const div = document.createElement('div');
    div.className = 'extra-field';

    const nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.placeholder = 'Nome do campo';
    nomeInput.value = nome;
    nomeInput.className = 'extra-nome';
    div.appendChild(nomeInput);

    const valorInput = document.createElement('input');
    valorInput.type = 'text';
    valorInput.placeholder = 'Valor';
    valorInput.value = valor;
    valorInput.className = 'extra-valor';
    div.appendChild(valorInput);

    // Input arquivo para esse campo extra
    const arquivoInput = document.createElement('input');
    arquivoInput.type = 'file';
    arquivoInput.multiple = true;
    arquivoInput.className = 'extra-arquivo';
    arquivoInput.title = 'Anexar arquivos';
    div.appendChild(arquivoInput);

    // Mostrar arquivos já anexados
    const listaArquivos = document.createElement('ul');
    listaArquivos.className = 'arquivos-extra-list';
    div.appendChild(listaArquivos);

    // Função para mostrar arquivos anexados
    function atualizarListaArquivos() {
      listaArquivos.innerHTML = '';
      arquivos.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.textContent = file.name;
        li.appendChild(a);
        listaArquivos.appendChild(li);
      });
    }
    atualizarListaArquivos();

    // Quando adicionar arquivos via input
    arquivoInput.addEventListener('change', e => {
      const filesNovos = Array.from(e.target.files);
      arquivos.push(...filesNovos);
      atualizarListaArquivos();
      arquivoInput.value = null; // limpa input
    });

    // Armazenar referências para salvar depois
    div._arquivos = arquivos;
    div._nomeInput = nomeInput;
    div._valorInput = valorInput;

    return div;
  }
  // Deletar os card
    deleteProcessBtn.addEventListener('click', () => {
    if (!processoSelecionadoId) return;

    const confirmacao = confirm('Tem certeza que deseja excluir este processo?');
    if (!confirmacao) return;

    // Remove o processo do array
    const index = processos.findIndex(p => p.id === processoSelecionadoId);
    if (index !== -1) {
      processos.splice(index, 1);
    }

    fecharModal();             // Fecha o modal
    renderizarFiltroEquipes(); // Atualiza os botões de equipe
    renderizarProcessos();     // Atualiza a tela com os processos restantes
  });

  // Carregar arquivos gerais do processo no modal
  function carregarArquivosModal(arquivos = []) {
    filesContainer.innerHTML = '';
    if (arquivos.length === 0) return;

    const label = document.createElement('strong');
    label.textContent = 'Arquivos do processo:';
    filesContainer.appendChild(label);

    const ul = document.createElement('ul');
    arquivos.forEach(file => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = file.name;
      a.textContent = file.name;
      li.appendChild(a);
      ul.appendChild(li);
    });
    filesContainer.appendChild(ul);
  }

  // Limpar mensagens de erro do modal
  function limparMensagensErro() {
    const inputs = modal.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.classList.remove('input-erro');
      if (input.nextSibling && input.nextSibling.classList && input.nextSibling.classList.contains('msg-erro')) {
        input.nextSibling.remove();
      }
    });
  }

  // Validação simples com aviso visual
  function validarModal(ativarMotivoRetrocesso = false) {
    limparMensagensErro();
    let valido = true;

    function marcarErro(input, msg) {
      input.classList.add('input-erro');
      const span = document.createElement('span');
      span.className = 'msg-erro';
      span.textContent = msg;
      input.parentNode.insertBefore(span, input.nextSibling);
    }

    if (!modalTituloInput.value.trim()) {
      marcarErro(modalTituloInput, 'Título é obrigatório');
      valido = false;
    }
    if (!modalResponsavelInput.value.trim()) {
      marcarErro(modalResponsavelInput, 'Responsável é obrigatório');
      valido = false;
    }
    if (!modalValorInput.value.trim()) {
      marcarErro(modalValorInput, 'Valor é obrigatório');
      valido = false;
    }
    if (!modalStatusInput.value.trim()) {
      marcarErro(modalStatusInput, 'Status é obrigatório');
      valido = false;
    }
    if (!modalPrioridadeInput.value.trim()) {
      marcarErro(modalPrioridadeInput, 'Prioridade é obrigatória');
      valido = false;
    }
    if (!modalEquipeInput.value.trim()) {
      marcarErro(modalEquipeInput, 'Equipe é obrigatória');
      valido = false;
    }

    if (ativarMotivoRetrocesso) {
      if (!motivoRetrocessoInput || !motivoRetrocessoInput.value.trim()) {
        marcarErro(motivoRetrocessoInput, 'Motivo do retrocesso é obrigatório');
        valido = false;
      }
    }

    return valido;
  }

  // Salvar mudanças do modal (editar processo)
  function salvarModal() {
    if (!processoSelecionadoId) return;
    const proc = processos.find(p => p.id === processoSelecionadoId);
    if (!proc) return;

    // Se botão retroceder estiver ativo e o campo motivo foi mostrado, validar motivo
    const retrocedendo = retrocederBtn && retrocederBtn.dataset.retrocedendo === 'true';

    if (!validarModal(retrocedendo)) return;

    proc.titulo = modalTituloInput.value.trim();
    proc.responsavel = modalResponsavelInput.value.trim();
    proc.valor = modalValorInput.value.trim();
    proc.status = modalStatusInput.value;
    proc.prioridade = modalPrioridadeInput.value;
    proc.equipeId = modalEquipeInput.value;
    proc.proximaEquipeId = modalProximaEquipeInput.value;

    // Salvar extras (nome, valor e arquivos)
    proc.extras = [];
    const extrasDivs = extrasContainer.querySelectorAll('.extra-field');
    extrasDivs.forEach(div => {
      const nome = div._nomeInput.value.trim();
      const valor = div._valorInput.value.trim();
      const arquivos = div._arquivos || [];
      if (nome) {
        proc.extras.push({ nome, valor, arquivos });
      }
    });

    // Atualizar arquivos gerais do processo
    // TODO: adicionar campo arquivos gerais (se quiser pode implementar aqui)

    // Se retrocedendo, muda equipe para anterior e salva motivo
    if (retrocedendo) {
      const idxAtual = equipes.findIndex(e => e.id === proc.equipeId);
      if (idxAtual > 0) {
        proc.equipeId = equipes[idxAtual - 1].id;
      }
      proc.motivoRetrocesso = motivoRetrocessoInput.value.trim();

      // Limpar flag retrocedendo
      retrocederBtn.dataset.retrocedendo = 'false';
      motivoRetrocessoContainer.style.display = 'none';
    } else {
      proc.motivoRetrocesso = null;
    }

    fecharModal();
    renderizarFiltroEquipes();
    renderizarProcessos();
  }

  // --- Botão retroceder ---

  function criarBotaoRetroceder(visible) {
    if (!retrocederBtn) {
      retrocederBtn = document.createElement('button');
      retrocederBtn.type = 'button';
      retrocederBtn.textContent = 'Retroceder';
      retrocederBtn.id = 'retrocederBtn';
      retrocederBtn.style.marginRight = '10px';
      retrocederBtn.addEventListener('click', () => {
        // Mostra campo motivo obrigatório e ativa flag retrocedendo
        if (!motivoRetrocessoContainer) criarCampoMotivoRetrocesso(true);
        motivoRetrocessoContainer.style.display = 'block';
        retrocederBtn.dataset.retrocedendo = 'true';
      });
      saveModalBtn.parentNode.insertBefore(retrocederBtn, saveModalBtn);
    }
    retrocederBtn.style.display = visible ? 'inline-block' : 'none';
    retrocederBtn.dataset.retrocedendo = 'false';
  }

  // Criar campo motivo retrocesso obrigatório no modal
  function criarCampoMotivoRetrocesso(visible) {
    if (!motivoRetrocessoContainer) {
      motivoRetrocessoContainer = document.createElement('div');
      motivoRetrocessoContainer.style.marginTop = '10px';

      const label = document.createElement('label');
      label.for = 'motivoRetrocessoInput';
      label.textContent = 'Motivo do Retrocesso *';
      motivoRetrocessoContainer.appendChild(label);

      motivoRetrocessoInput = document.createElement('textarea');
      motivoRetrocessoInput.id = 'motivoRetrocessoInput';
      motivoRetrocessoInput.rows = 3;
      motivoRetrocessoInput.style.width = '100%';
      motivoRetrocessoInput.style.boxSizing = 'border-box';
      motivoRetrocessoInput.setAttribute('aria-required', 'true');
      motivoRetrocessoContainer.appendChild(motivoRetrocessoInput);

      saveModalBtn.parentNode.insertBefore(motivoRetrocessoContainer, saveModalBtn);
    }
    motivoRetrocessoContainer.style.display = visible ? 'block' : 'none';
    if (!visible) motivoRetrocessoInput.value = '';
  }

  // --- Eventos ---

  buscaInput.addEventListener('input', () => {
    textoBusca = buscaInput.value.trim().toLowerCase();
    renderizarProcessos();
  });

  addProcessBtn.addEventListener('click', () => {
    processoSelecionadoId = null;
    abrirModalNovoProcesso();
  });

  addEquipeBtn.addEventListener('click', () => {
    const nomeNovaEquipe = prompt('Digite o nome da nova equipe:');
    if (nomeNovaEquipe && nomeNovaEquipe.trim()) {
      equipes.push({ id: gerarId(), nome: nomeNovaEquipe.trim() });
      carregarEquipesNoSelect();
      renderizarFiltroEquipes();
    }
  });

  closeModalBtn.addEventListener('click', fecharModal);
  window.addEventListener('click', e => {
    if (e.target === modal) fecharModal();
  });

  saveModalBtn.addEventListener('click', salvarModal);

  addExtraFieldBtn.textContent = '+'; // trocar texto por +

  addExtraFieldBtn.addEventListener('click', () => {
    const div = criarExtraField();
    extrasContainer.appendChild(div);
  });

  // --- Modal para novo processo ---
  function abrirModalNovoProcesso() {
    modalTituloInput.value = '';
    modalResponsavelInput.value = '';
    modalStatusInput.value = 'pendente';
    modalPrioridadeInput.value = 'baixa';
    modalValorInput.value = '';
    carregarEquipesNoSelect();
    modalProximaEquipeInput.value = '';
    extrasContainer.innerHTML = '';
    filesContainer.innerHTML = '';
    criarBotaoRetroceder(false);
    criarCampoMotivoRetrocesso(false);
    limparMensagensErro();
    modal.style.display = 'block';
    modal.focus();
  }

  // Inicialização
  carregarEquipesNoSelect();
  renderizarFiltroEquipes();
  renderizarProcessos();
})();
