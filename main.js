/* =========================================================================
   MAIN MODULE - CONTROLE DE INTERFACE, MENU MOBILE E GERAÇÃO DE CARTÕES
   ========================================================================= */

// --- 1. GERENCIAMENTO DO MENU MOBILE (HAMBÚRGUER) ---
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");
const menuBackdrop = document.getElementById("menuBackdrop");

// Função que abre/fecha o menu mobile via clique
function toggleMenu(forceClose = false) {
  const isOpen = forceClose ? false : !navMenu?.classList.contains("open");
  navMenu?.classList.toggle("open", isOpen);
  menuBackdrop?.classList.toggle("open", isOpen);
  // Troca o ícone: se aberto vira "X", se fechado vira "três traços"
  const icon = hamburgerBtn?.querySelector("i");
  if (icon) {
    icon.className = isOpen ? "bi bi-x-lg" : "bi bi-list";
  }
}
// Força o menu mobile e o backdrop a iniciarem 100% fechados ao carregar a página
toggleMenu(true);
// --- SISTEMA DE TOAST NOTIFICATION ---
const toastNotification = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");
let toastTimeout;

export function showToast(mensagem) {
  if (!toastNotification || !toastMessage) return;

  clearTimeout(toastTimeout);
  toastMessage.textContent = mensagem;
  toastNotification.classList.add("show");

  toastTimeout = setTimeout(() => {
    toastNotification.classList.remove("show");
  }, 3200);
}
// Ao clicar no botão (seja hambúrguer ou o X), abre ou fecha
hamburgerBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

// Fecha ao clicar fora (no fundo escuro)
menuBackdrop?.addEventListener("click", () => toggleMenu(true));

// Fecha ao clicar em qualquer item da lista
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(true));
});

// --- 2. GERENCIAMENTO DO MODAL "DIVULGUE" ---
const publishModal = document.getElementById("publishModal");
const openPublishModalBtn = document.getElementById("openPublishModalBtn");
const heroPublishBtn = document.getElementById("heroPublishBtn");
const closePublishModalBtn = document.getElementById("closePublishModalBtn");

function togglePublishModal(isOpen) {
  publishModal?.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

openPublishModalBtn?.addEventListener("click", () => {
  toggleMenu(false);
  togglePublishModal(true);
});

heroPublishBtn?.addEventListener("click", () => togglePublishModal(true));
closePublishModalBtn?.addEventListener("click", () => togglePublishModal(false));

publishModal?.addEventListener("click", (e) => {
  if (e.target === publishModal) togglePublishModal(false);
});

// --- 3. CRIAÇÃO E INJEÇÃO DINÂMICA DO CARD NO INDEX ---
const publishForm = document.getElementById("publishForm");
const cardsGrid = document.getElementById("cardsGrid");




// --- PRÉ-VISUALIZAÇÃO IMEDIATA DA FOTO SELECIONADA NO MODAL ---
const fotoInput = document.getElementById("fotoInput");
const uploadPreviewImg = document.getElementById("uploadPreviewImg");
const uploadPlaceholderIcon = document.getElementById("uploadPlaceholderIcon");

fotoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    if (uploadPreviewImg) {
      uploadPreviewImg.src = evt.target.result;
      uploadPreviewImg.style.display = "block";
    }
    if (uploadPlaceholderIcon) {
      uploadPlaceholderIcon.style.display = "none";
    }
  };
  reader.readAsDataURL(file);
});

// --- CONTROLE DO ACCORDION DE CIDADES (DF) ---
// --- ARRAYS E DADOS ---
export const CIDADES_DF = [
  "Águas Claras", "Arniqueira", "Asa Norte", "Asa Sul", "Brazlândia", "Candangolândia", "Ceilândia", "Cruzeiro", "Fercal", "Gama",
  "Guará", "Guará II", "Itapoã", "Jardim Botânico", "Lago Norte", "Lago Sul", "Núcleo Bandeirante", "Paranoá", "Park Way", "Planaltina",
  "Plano Piloto", "Recanto das Emas", "Riacho Fundo", "Riacho Fundo II", "Samambaia Norte", "Samambaia Sul", "Santa Maria", "São Sebastião",
  "Estrutural", "SIA", "Sobradinho", "Sobradinho II", "Sol Nascente", "Pôr do Sol", "Sudoeste", "Octogonal", "Taguatinga", "Taguatinga Norte",
  "Taguatinga Sul", "Varjão", "Vicente Pires"
];

export const PROFISSOES_LISTA = [
  "Adestrador(a) de Animais", "Administrador(a)", "Advogado(a)", "Alfaiate,Costureira", "Animador(a) de Festas",
  "Ajudante,Servente de Obras", "Armador de Ferragens", "Arquiteto(a)", "Artesão(ã)", "Asfaltador,Pavimentador",
  "Assistente Social", "Assistente Técnico de TI", "Astrólogo(a)", "Babá", "Barbeiro", "Balconista", "Barman,Bartender",
  "Biomédico(a)", "Bombeiro Hidráulico","Brigadista", "Borracheiro", "Cabeleireiro(a)", "Calheiro,Rufista", "Carpinteiro",
  "Carpinteiro de Obras", "Caseiro(a),Zelador(a)", "Chaveiro", "Coach, Mentor(a)", "Concretador",
  "Confeiteiro(a)", "Consultor(a) Financeiro", "Contador(a)", "Copeiro(a)", "Corretor(a) de Imóveis", "Corretor(a) de Seguros",
  "Cozinheiro(a),Buffet", "Cuidador(a) de Idosos", "Designer de Interiores", 
  "Dentista", "Depilador(a)", "Designer de Sobrancelhas", "Designer Gráfico", "Desenvolvedor(a) Mobile", "Desenvolvedor(a) Web",
  "Departamento pessoal,RH", "Diarista,Faxineiro(a)", "DJ", "Dublador(a)", "Economista", "Editor(a) de Vídeo",
  "Eletricista Automotivo", "Eletricista Predial,Residencial", "Encanador", "Encanador Industrial", "Enfermeiro(a)",
  "Engenheiro(a) Civil", "Engenheiro(a) Eletricista", "Engenheiro(a) Mecânico", "Engenheiro(a) ambiental",
   "Esteticista", "Farmacêutico(a)", "Fisioterapeuta", "Fonoaudiólogo(a)",
  "Fotógrafo(a)", "Garçom,Garçonete", "Gesseiro", "Guia de Turismo", "Impermeabilizador", "Instalador de Ar-Condicionado",
  "Instalad: de Câmeras", "Instalad: de Drywall", "Instal: de Energia Solar", "Instalador de Insulfilm",
  "Instalad: de Papel de Parede", "Instalad: de Piso Laminado", "Instalad: de Pisos,Revestimentos",
  "Instalador de cortinas", "Instal: de toldos,coberturas", "Instrutor(a) de Artes Marciais",
  "Instrutor(a) de Dança", "Instrutor(a) de Trânsito", "Instrutor(a) de Yoga", "Jardineiro", "Jornalista",
  "Ladrilheiro / Azulejista", "Luthier (Manutenção de Instrumentos)", "Maquiador(a)", "Marceneiro", "Manicure,Pedicure",
  "Marmoreiro", "Massoterapeuta", "Massagista", "Mecânico Automotivo", "Mecânico de Motos", "Médico(a)",
  "Mestre de Cerimônias", "Mestre de Obras", "Montador de Andaimes", "Montador de Estrutura Metálica", "Montador de Móveis",
  "Moto-boy,Entregador(a)", "Motorista,Freteiro", "Nutricionista", "Operad de Betoneira", "Operad de Máquinas Pesadas",
  "Operad: de Retroescavadeira","Operad:Mini Carregadeira", "Operad: de Empilhadeira", "Operad: de Guindaste", "Operad de Pá Carregadeira",
  "Ourives", "Operador de Demolição","Padeiro", "Paisagista","Pedagogo(a)", "Pedreiro",
  "Personal Trainer", "Pintor Automotivo", "Pintor de Obras,Residencial", "Piscineiro", "Podólogo(a)", "Polidor Automotivo",
  "Poceiro (Abertura de Poços)", "Professor(a)", "Psicólogo(a)", "Psicopedagogo(a)", "Publicitário(a)", "Recepcionista",
  "Recreador(a) Infantil", "Redator(a)", "Sapateiro", "Segurança,Vigilante", "Serviços Gerais", "Serralheiro",
   "Social Media", "Soldador", "Tapeceiro / Estofador", "Tatuador(a)", "Técnico de Celular",
  "Eletrotécnico", "Téc: de Enfermagem", "Téc: em Edificações", "Téc: em Segurança do Trabalho", "Telhadista",
  "Terapeuta Holístico", "Terapeuta Ocupacional", "Topógrafo(a)", "Tosador / Pet Care", "Tradutor(a)",
  "Veterinário(a)", "Vidraceiro", "Vendedor(a),Representante Comercial",
 "Outros Serviços"
];

export const CNH_MOBILIDADE_LISTA = [
  "CNH Categoria B ",
  "CNH Categoria A ",
  "CNH Categoria AB",
  "CNH Categoria C/D/E",
  "Transporte Público"
];

// --- CONTROLE DO ACCORDION DE CIDADES (DF) -------------------------------
const cityAccordionHeader = document.getElementById("cityAccordionHeader");
const cityAccordionDrawer = document.getElementById("cityAccordionDrawer");
const cityArrowIcon = document.getElementById("cityArrowIcon");
const cidadeInput = document.getElementById("cidadeInput");
const cityListWrapper = document.getElementById("cityListWrapper");

function toggleCityAccordion(forceClose = false) {
  const isOpen = forceClose ? false : !cityAccordionDrawer?.classList.contains("open");
  cityAccordionDrawer?.classList.toggle("open", isOpen);
  cityArrowIcon?.classList.toggle("open", isOpen);
}

if (cityListWrapper) {
  cityListWrapper.innerHTML = CIDADES_DF.map(
    (cidade) => `<button type="button" class="city-option">${cidade}</button>`
  ).join("");
}

// --- SELEÇÃO DE CIDADE ---
cityListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (cidadeInput) cidadeInput.value = btn.textContent.trim();
  toggleCityAccordion(true);
});

// --- CONTROLE DO ACCORDION DE PROFISSÕES ---
const profissaoAccordionHeader = document.getElementById("profissaoAccordionHeader");
const profissaoAccordionDrawer = document.getElementById("profissaoAccordionDrawer");
const profissaoArrowIcon = document.getElementById("profissaoArrowIcon");
const profissaoInput = document.getElementById("profissaoInput");
const profissaoListWrapper = document.getElementById("profissaoListWrapper");

export function toggleProfissaoAccordion(forceClose = false) {
  const isOpen = forceClose ? false : !profissaoAccordionDrawer?.classList.contains("open");
  profissaoAccordionDrawer?.classList.toggle("open", isOpen);
  profissaoArrowIcon?.classList.toggle("open", isOpen);
}

if (profissaoListWrapper) {
  profissaoListWrapper.innerHTML = PROFISSOES_LISTA.map(
    (prof) => `<button type="button" class="city-option">${prof}</button>`
  ).join("");
}

profissaoListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (profissaoInput) profissaoInput.value = btn.textContent.trim();
  toggleProfissaoAccordion(true);
});

// --- CONTROLE DO ACCORDION DE HABILITAÇÃO / MOBILIDADE ---
const cnhAccordionHeader = document.getElementById("cnhAccordionHeader");
const cnhAccordionDrawer = document.getElementById("cnhAccordionDrawer");
const cnhArrowIcon = document.getElementById("cnhArrowIcon");
const cnhInput = document.getElementById("cnhInput");
const cnhListWrapper = document.getElementById("cnhListWrapper");

export function toggleCnhAccordion(forceClose = false) {
  const isOpen = forceClose ? false : !cnhAccordionDrawer?.classList.contains("open");
  cnhAccordionDrawer?.classList.toggle("open", isOpen);
  cnhArrowIcon?.classList.toggle("open", isOpen);
}

if (cnhListWrapper) {
  cnhListWrapper.innerHTML = CNH_MOBILIDADE_LISTA.map(
    (item) => `<button type="button" class="city-option">${item}</button>`
  ).join("");
}

cnhListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (cnhInput) cnhInput.value = btn.textContent.trim();
  toggleCnhAccordion(true);
});

// --- CLIQUES DE ABERTURA COM FECHAMENTO CRUZADO ENTRE OS 3 ---
cityAccordionHeader?.addEventListener("click", () => {
  toggleProfissaoAccordion(true);
  toggleCnhAccordion(true);
  toggleCityAccordion();
});

profissaoAccordionHeader?.addEventListener("click", () => {
  toggleCityAccordion(true);
  toggleCnhAccordion(true);
  toggleProfissaoAccordion();
});

cnhAccordionHeader?.addEventListener("click", () => {
  toggleCityAccordion(true);
  toggleProfissaoAccordion(true);
  toggleCnhAccordion();
});

// --- FUNÇÃO PARA GERAR O HTML DO CARD DE VISITA ---
export function criarCardVisitaHTML({ nome, experiencia, idade, cidade, profissao, bio, cnh, email, telefone, fotoUrl, instagram, linkedin }) {
  const expValor = experiencia !== undefined ? experiencia : idade;
  const textoExp = expValor == 1 ? "1 ano exp." : `${expValor} anos exp.`;
  const miniBio = bio || "";
  const mobilidade = cnh || "";

  return `
    <div class="card-visita">
      <div class="card-perfil-col">
        <div class="card-avatar">
          <img src="${fotoUrl}" alt="${nome}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'">
        </div>

        <div class="card-dados-pessoais">
          <div class="card-header-nome">
            <h3 class="card-nome" title="${nome.toUpperCase()}">${nome.toUpperCase()}</h3>
          </div>
          
          <div class="card-profissao-destaque" title="${profissao}">
            <i class="bi bi-person-workspace"></i>
            <span>${profissao}</span>
          </div>

          <div class="card-linha-discreta">
            <i class="bi bi-geo-alt-fill"></i>
            <span class="cidade-texto" title="${cidade}">${cidade}</span>
            <span class="separador-bullet">•</span>
            <span class="exp-destaque">${textoExp}</span>
          </div>

          <!-- BOTÃO VER MAIS LOGO ABAIXO DA CIDADE E EXP -->
          <button type="button" 
                  class="btn-abrir-cartao" 
                  data-nome="${nome}"
                  data-profissao="${profissao}"
                  data-bio="${miniBio}"
                  data-cnh="${mobilidade}"
                  data-cidade="${cidade}"
                  data-exp="${textoExp}"
                  data-foto="${fotoUrl}"
                  data-telefone="${telefone}"
                  data-email="${email}"
                  data-instagram="${instagram || ''}"
                  data-linkedin="${linkedin || ''}">
            <i class="bi bi-person-vcard-fill"></i> Ver mais
          </button>
        </div>
      </div>
    </div>
  `;
}

// --- MÁSCARA AUTOMÁTICA OBRIGATÓRIA (61) + 9 DÍGITOS ---
const telefoneInput = document.getElementById("telefoneInput");

telefoneInput?.addEventListener("input", (e) => {
  // Pega apenas os números digitados
  let apenasNumeros = e.target.value.replace(/\D/g, "");

  // Se o usuário já digitou começando com 61, removemos para evitar duplicação (6161...)
  if (apenasNumeros.startsWith("61")) {
    apenasNumeros = apenasNumeros.slice(2);
  }

  // Limita estritamente a 9 dígitos de número
  apenasNumeros = apenasNumeros.slice(0, 9);

  if (apenasNumeros.length === 0) {
    e.target.value = "";
    return;
  }

  // Monta a formatação: (61) 9XXXX-XXXX
  if (apenasNumeros.length <= 5) {
    e.target.value = `(61) ${apenasNumeros}`;
  } else {
    e.target.value = `(61) ${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
  }
});
// Intercepta o envio do formulário, lê a imagem e insere o card no topo da vitrine
// --- FUNÇÃO PARA COMPACTAR IMAGENS ANTES DE SALVAR NO LOCALSTORAGE ---
// Evita estourar o limite de 5MB do navegador ao salvar fotos em Base64
function redimensionarFoto(arquivo, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Define tamanho máximo fixo de 280x280 (resolução ideal para o avatar)
      const maxDim = 280;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Exporta em JPEG otimizado
      callback(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(arquivo);
}

// --- FUNÇÃO PARA CARREGAR OS CARDS SALVOS ASSIM QUE O SITE ABRE ---
function carregarCardsSalvos() {
  try {
    const cardsSalvos = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
    // Percorre cada profissional salvo e insere no topo da vitrine
    cardsSalvos.forEach((dados) => {
      const cardHTML = criarCardVisitaHTML(dados);
      cardsGrid?.insertAdjacentHTML("afterbegin", cardHTML);
    });
  } catch (erro) {
    console.error("Erro ao carregar profissionais salvos:", erro);
  }
}

// Executa o carregamento inicial dos cartões fixos
// Executa o carregamento inicial e inicia a paginação
carregarCardsSalvos();


// --- ENVIO DO FORMULÁRIO COM PERSISTÊNCIA NO LOCALSTORAGE ---
publishForm?.addEventListener("submit", (e) => {
  e.preventDefault();

const fotoArquivo = document.getElementById("fotoInput").files[0];
  const nome = document.getElementById("nomeInput").value.trim();
const experiencia = document.getElementById("experienciaInput").value.trim();
  const cnh = document.getElementById("cnhInput")?.value.trim() || "";
  const cidade = document.getElementById("cidadeInput").value.trim();
 const profissao = document.getElementById("profissaoInput").value.trim();
  const bio = document.getElementById("bioInput")?.value.trim() || "";
  const email = document.getElementById("emailInput").value.trim();
  const telefone = document.getElementById("telefoneInput").value.trim();
  const instagram = document.getElementById("instagramInput")?.value.trim() || "";
  const linkedin = document.getElementById("linkedinInput")?.value.trim() || "";

  if (!fotoArquivo) {
    alert("Por favor, selecione uma foto.");
    return;
  }

  // Validação: DDD 61 + 9 dígitos (11 números ao todo)
  const numerosTelefone = telefone.replace(/\D/g, "");
  if (numerosTelefone.length !== 11 || !numerosTelefone.startsWith("61")) {
    alert("Por favor, digite um telefone válido do DF com DDD (61) e 9 dígitos completos.");
    telefoneInput?.focus();
    return;
  }

  // Compacta e processa a imagem
  redimensionarFoto(fotoArquivo, (fotoUrl) => {
const dadosNovoProfissional = {
      nome,
      experiencia,
      cnh,
      cidade,
      profissao,
      bio,
      email,
      telefone,
      fotoUrl,
      instagram,
      linkedin
    };

    // 1. Gera o HTML e renderiza na tela imediatamente
    const novoCardHTML = criarCardVisitaHTML(dadosNovoProfissional);
    cardsGrid.insertAdjacentHTML("afterbegin", novoCardHTML);

    // 2. Salva permanentemente no navegador (localStorage)
    try {
      const cardsAtuais = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
      cardsAtuais.push(dadosNovoProfissional);
      localStorage.setItem("profissionaisDF_cards", JSON.stringify(cardsAtuais));
    } catch (err) {
      console.warn("Aviso: Limite de armazenamento local atingido.", err);
    }

    // 3. Limpa o formulário, accordions e pré-visualizações
    publishForm.reset();
    toggleCityAccordion(true);
    toggleProfissaoAccordion(true);
    if (uploadPreviewImg) {
      uploadPreviewImg.src = "";
      uploadPreviewImg.style.display = "none";
    }
    if (uploadPlaceholderIcon) {
      uploadPlaceholderIcon.style.display = "block";
    }

    // 4. Fecha o modal e rola suavemente até o novo card
 // 4. Recalcula a paginação para exibir o novo card na página 1 e fecha o modal
    filtrarCardsVitrine(true);
    togglePublishModal(false);
    cardsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


// --- GERENCIAMENTO DO MODAL "CRIAR CONTA" ---
const registerModal = document.getElementById("registerModal");
const openRegisterModalBtn = document.getElementById("openRegisterModalBtn");
const closeRegisterModalBtn = document.getElementById("closeRegisterModalBtn");
const registerForm = document.getElementById("registerForm");

function toggleRegisterModal(isOpen) {
  registerModal?.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// Abre o modal de cadastro e fecha o menu mobile caso esteja aberto
openRegisterModalBtn?.addEventListener("click", () => {
  toggleMenu(true);
  toggleRegisterModal(true);
});

// Fecha no botão X do modal
closeRegisterModalBtn?.addEventListener("click", () => toggleRegisterModal(false));

// Fecha ao clicar fora (no fundo escuro)
registerModal?.addEventListener("click", (e) => {
  if (e.target === registerModal) toggleRegisterModal(false);
});

// Envio do formulário
registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmailInput")?.value;
  alert(`Cadastro recebido para: ${email}\nEm breve ativaremos a autenticação!`);
  registerForm.reset();
  toggleRegisterModal(false);
});

// --- SISTEMA DE BUSCA E FILTRO POR PROFISSÃO ---
const filtroProfissaoInput = document.getElementById("filtroProfissaoInput");
const limparBuscaBtn = document.getElementById("limparBuscaBtn");

function normalizarTexto(txt) {
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


// --- SISTEMA DE FILTRO UNIFICADO: PROFISSÃO E CIDADE/RA (DF) ---
// ================= SISTEMA DE PAGINAÇÃO E BUSCA INTEGRADA =================
// ================= SISTEMA DE PAGINAÇÃO E BUSCA INTEGRADA =================
const CARDS_PAGINA_1 = 6;
const CARDS_DEMAIS_PAGINAS = 12;
let paginaAtual = 1;

const paginationContainer = document.getElementById("paginationContainer");
const paginationPagesList = document.getElementById("paginationPagesList");
const btnPaginaAnterior = document.getElementById("btnPaginaAnterior");
const btnPaginaProxima = document.getElementById("btnPaginaProxima");

// Função matemática que calcula o total de páginas considerando 6 na primeira e 12 nas demais
function calcularTotalPaginas(totalItens) {
  if (totalItens <= 0) return 0;
  if (totalItens <= CARDS_PAGINA_1) return 1;
  const itensRestantes = totalItens - CARDS_PAGINA_1;
  return 1 + Math.ceil(itensRestantes / CARDS_DEMAIS_PAGINAS);
}

// Atualiza quais cards ficam visíveis conforme a página selecionada

// Atualiza quais cards ficam visíveis conforme a página selecionada
function renderizarPagina(cardsFiltrados) {
  const todosCards = cardsGrid?.querySelectorAll(".card-visita");
  const total = cardsFiltrados.length;
  const totalPaginas = calcularTotalPaginas(total);

  // Garante que a página atual seja válida
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;
  if (paginaAtual < 1) paginaAtual = 1;

  // Mostra a busca e o botão divulgue apenas na página 1; oculta da página 2 em diante
  const heroActions = document.querySelector(".hero-actions");
  if (heroActions) {
    heroActions.style.display = paginaAtual === 1 ? "flex" : "none";
  }

  // Oculta todos os cards antes de exibir a fatia da página atual
  todosCards?.forEach((card) => {
    card.style.display = "none";
  });

  // Calcula o início e o fim da fatia conforme a página
  let inicio = 0;
  let fim = CARDS_PAGINA_1;

  if (paginaAtual > 1) {
    inicio = CARDS_PAGINA_1 + (paginaAtual - 2) * CARDS_DEMAIS_PAGINAS;
    fim = inicio + CARDS_DEMAIS_PAGINAS;
  }

  const cardsPagina = cardsFiltrados.slice(inicio, fim);

  cardsPagina.forEach((card) => {
    card.style.display = ""; // Mantém o display padrão do grid
  });

  desenharControlesPaginacao(totalPaginas);
}
















// Cria as bolinhas de números e controla o estado dos botões Anterior/Próxima
function desenharControlesPaginacao(totalPaginas) {
  if (!paginationContainer || !paginationPagesList) return;

  // Se não houver itens ou couber tudo em 1 página só, esconde a barra
  if (totalPaginas <= 1) {
    paginationContainer.style.display = "none";
    return;
  }
  paginationContainer.style.display = "flex";

  // Desenha os botões numéricos
  paginationPagesList.innerHTML = "";
  for (let i = 1; i <= totalPaginas; i++) {
    const btnNum = document.createElement("button");
    btnNum.type = "button";
    btnNum.className = `page-num ${i === paginaAtual ? "active" : ""}`;
    btnNum.textContent = i;
    btnNum.addEventListener("click", () => {
      if (paginaAtual !== i) {
        paginaAtual = i;
        filtrarCardsVitrine(false);
        rolarParaTopoVitrine();
      }
    });
    paginationPagesList.appendChild(btnNum);
  }

  // Desativa os botões quando atinge o limite
  if (btnPaginaAnterior) btnPaginaAnterior.disabled = paginaAtual === 1;
  if (btnPaginaProxima) btnPaginaProxima.disabled = paginaAtual === totalPaginas;
}

// Rola a tela suavemente para a vitrine ao trocar de página
function rolarParaTopoVitrine() {
  const vitrineSecao = document.getElementById("vitrine");
  vitrineSecao?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Botões Anterior e Próxima
btnPaginaAnterior?.addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    filtrarCardsVitrine(false);
    rolarParaTopoVitrine();
  }
});

btnPaginaProxima?.addEventListener("click", () => {
  const termo = normalizarTexto(filtroProfissaoInput?.value || "");
  const todosCards = Array.from(cardsGrid?.querySelectorAll(".card-visita") || []);
  
  const cardsValidos = todosCards.filter((card) => {
    const nomeTexto = card.querySelector(".card-nome")?.textContent || "";
    const profissaoTexto = card.querySelector(".card-profissao-destaque")?.textContent || "";
    const cidadeTexto = card.querySelector(".cidade-texto")?.textContent || "";
    return normalizarTexto(nomeTexto).includes(termo) ||
           normalizarTexto(profissaoTexto).includes(termo) ||
           normalizarTexto(cidadeTexto).includes(termo);
  });

  const totalPaginas = calcularTotalPaginas(cardsValidos.length);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    filtrarCardsVitrine(false);
    rolarParaTopoVitrine();
  }
});

// --- SISTEMA DE FILTRO UNIFICADO INTEGRADO COM PAGINAÇÃO ---



function filtrarCardsVitrine(resetPagina = true) {
  if (resetPagina) paginaAtual = 1;

  const termo = normalizarTexto(filtroProfissaoInput?.value || "");
  const todosCards = Array.from(cardsGrid?.querySelectorAll(".card-visita") || []);

  if (limparBuscaBtn) {
    limparBuscaBtn.style.display = termo.length > 0 ? "grid" : "none";
  }

  // Filtra os cards que atendem ao critério de busca
  const cardsValidos = todosCards.filter((card) => {
    const nomeTexto = card.querySelector(".card-nome")?.textContent || "";
    const profissaoTexto = card.querySelector(".card-profissao-destaque")?.textContent || "";
    const cidadeTexto = card.querySelector(".cidade-texto")?.textContent || "";

    const bateuNome = normalizarTexto(nomeTexto).includes(termo);
    const bateuProfissao = normalizarTexto(profissaoTexto).includes(termo);
    const bateuCidade = normalizarTexto(cidadeTexto).includes(termo);

    return bateuNome || bateuProfissao || bateuCidade;
  });

  // Mensagem amigável caso não encontre nenhum resultado
// Mensagem amigável caso não encontre nenhum resultado
  let feedbackVazio = document.getElementById("buscaSemResultados");
  if (cardsValidos.length === 0) {
    todosCards.forEach((c) => (c.style.display = "none"));
    cardsGrid?.classList.remove("modo-busca-rolagem");
    if (!feedbackVazio && cardsGrid) {
      feedbackVazio = document.createElement("p");
      feedbackVazio.id = "buscaSemResultados";
      feedbackVazio.style.cssText = "grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 1.05rem; padding: 40px 0;";
      feedbackVazio.textContent = "Nenhum profissional encontrado para esta busca.";
      cardsGrid.appendChild(feedbackVazio);
    }
    if (paginationContainer) paginationContainer.style.display = "none";
  } else {
    if (feedbackVazio) feedbackVazio.remove();

    // SE O USUÁRIO ESTÁ PESQUISANDO: trava a altura e ativa a rolagem interna do grid
    if (termo.length > 0) {
      todosCards.forEach((c) => (c.style.display = "none"));
      cardsValidos.forEach((c) => (c.style.display = ""));
      cardsGrid?.classList.add("modo-busca-rolagem");
      if (paginationContainer) paginationContainer.style.display = "none";
      cardsGrid.scrollTop = 0; // Volta a rolagem para o topo
    } else {
      // SE A BUSCA ESTÁ VAZIA: desativa a rolagem interna e volta à paginação normal
      cardsGrid?.classList.remove("modo-busca-rolagem");
      renderizarPagina(cardsValidos);
    }
  }

}

// Dispara o filtro automaticamente ao digitar
filtroProfissaoInput?.addEventListener("input", () => filtrarCardsVitrine(true));

// Limpa a busca e restaura a vitrine na página 1
// Limpa a busca e restaura a vitrine na página 1
limparBuscaBtn?.addEventListener("click", () => {
  if (filtroProfissaoInput) {
    filtroProfissaoInput.value = "";
    filtrarCardsVitrine(true);
    filtroProfissaoInput.focus();
  }
});

// Inicializa a paginação exibindo os primeiros 6 cards e gerando os botões
filtrarCardsVitrine(true);

// --- CONTROLE DO MODAL ÚNICO DO CARTÃO DE VISITA ---
const cartaoModal = document.getElementById("cartaoModal");
const closeCartaoModalBtn = document.getElementById("closeCartaoModalBtn");

function toggleCartaoModal(isOpen) {
  cartaoModal?.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

closeCartaoModalBtn?.addEventListener("click", () => toggleCartaoModal(false));

cartaoModal?.addEventListener("click", (e) => {
  if (e.target === cartaoModal) toggleCartaoModal(false);
});

// Delegação de evento: clique em "Ver Cartão" abre o modal preenchendo os dados
cardsGrid?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-abrir-cartao");
  if (!btn) return;

const nome = btn.getAttribute("data-nome");
  const profissao = btn.getAttribute("data-profissao");
const bio = btn.getAttribute("data-bio") || "";
  const cnh = btn.getAttribute("data-cnh") || "";
  const cidade = btn.getAttribute("data-cidade");
  const exp = btn.getAttribute("data-exp");
  const foto = btn.getAttribute("data-foto");
  const telefone = btn.getAttribute("data-telefone") || "";
  const email = btn.getAttribute("data-email") || "";
  const instagram = btn.getAttribute("data-instagram") || "";
  const linkedin = btn.getAttribute("data-linkedin") || "";

  // Preenche elementos do modal
  document.getElementById("modalFoto").src = foto;
document.getElementById("modalProfissao").textContent = profissao;
  document.getElementById("modalCidade").textContent = cidade;

  // Formata o texto para aparecer completo: "X anos de experiência"
  const anosApenas = exp.replace(/\D/g, "");
  const textoExpCompleto = anosApenas == 1 ? "1 ano de experiência" : `${anosApenas} anos de experiência`;
  document.getElementById("modalExp").textContent = textoExpCompleto;

  // Preenche a Mobilidade / CNH
  const modalCnhLinha = document.getElementById("modalCnhLinha");
  const modalCnh = document.getElementById("modalCnh");
  if (modalCnhLinha && modalCnh) {
    if (cnh) {
      modalCnh.textContent = cnh;
      modalCnhLinha.style.display = "flex";
    } else {
      modalCnhLinha.style.display = "none";
    }
  }

  // Preenchimento e exibição condicional da Mini Bio
  const modalBio = document.getElementById("modalBio");
  if (modalBio) {
    if (bio) {
      modalBio.textContent = bio;
      modalBio.style.display = "block";
    } else {
      modalBio.textContent = "";
      modalBio.style.display = "none";
    }
  }

  // Converte o nome para caixa mista elegante (Ex: Ana Beatriz Silva da Costa)
  // Converte o nome para caixa mista elegante (Ex: Ana Beatriz Silva da Costa)
  const formatarNomeMisto = (str) => {
    const conectivos = ["de", "da", "do", "das", "dos", "e"];
    return str
      .toLowerCase()
      .split(" ")
      .filter(palavra => palavra.length > 0)
      .map((palavra, index) => {
        if (index > 0 && conectivos.includes(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(" ");
  };

  document.getElementById("modalNome").textContent = formatarNomeMisto(nome);

  // WhatsApp link
  const zapNums = telefone.replace(/\D/g, "");
  const zapHref = zapNums.length >= 10 ? `https://wa.me/55${zapNums}` : `tel:${zapNums}`;
  const modalZapLink = document.getElementById("modalZapLink");
  if (modalZapLink) modalZapLink.href = zapHref;

  // E-mail link
// E-mail link
  const modalMailLink = document.getElementById("modalMailLink");
  if (modalMailLink) {
    if (email) {
      modalMailLink.href = `mailto:${email}`;
      modalMailLink.style.display = "inline-flex";
    } else {
      modalMailLink.style.display = "none";
    }
  }

  // Redes Sociais
  const instaBtn = document.getElementById("modalInstaLink");
  if (instaBtn) {
    if (instagram) {
      const userInsta = instagram.replace("@", "").trim();
      instaBtn.href = `https://instagram.com/${userInsta}`;
      instaBtn.style.display = "inline-flex";
    } else {
      instaBtn.style.display = "none";
    }
  }

  const linkedinBtn = document.getElementById("modalLinkedinLink");
  if (linkedinBtn) {
    if (linkedin) {
      linkedinBtn.href = linkedin.startsWith("http") ? linkedin : `https://${linkedin}`;
      linkedinBtn.style.display = "inline-flex";
    } else {
      linkedinBtn.style.display = "none";
    }
  }

  toggleCartaoModal(true);
});