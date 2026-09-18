/* =========================================================================
   MAIN MODULE - CONTROLE DA PÁGINA, EVENTOS DA VITRINE E FIRESTORE REAL-TIME
   ========================================================================= */

import { loginComGoogle, logoutUsuario, vigiarSessao } from "./auth.js";
import { 
  toggleAuthModal, 
  abrirPainelUsuario, 
  abrirModalDetalhesCartao, 
  getUsuarioLogado, 
  initModalListeners 
} from "./modal.js";
import { db } from "./firebaseConfig.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Cache dos cartões sincronizados com o Firestore
let cardsMemoria = [];

// --- 1. GERENCIAMENTO DO MENU MOBILE (HAMBÚRGUER) ---
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");
const menuBackdrop = document.getElementById("menuBackdrop");

function toggleMenu(forceClose = false) {
  const isOpen = forceClose ? false : !navMenu?.classList.contains("open");
  navMenu?.classList.toggle("open", isOpen);
  menuBackdrop?.classList.toggle("open", isOpen);
  const icon = hamburgerBtn?.querySelector("i");
  if (icon) icon.className = isOpen ? "bi bi-x-lg" : "bi bi-list";
}

toggleMenu(true);

hamburgerBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

menuBackdrop?.addEventListener("click", () => toggleMenu(true));
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(true));
});

// --- 2. NOTIFICAÇÕES (TOAST) ---
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

// --- 3. ESTADO DA SESSÃO ---
export function setUsuarioLogado(usuario) {
  if (usuario) {
    localStorage.setItem("profissionaisDF_usuario", JSON.stringify(usuario));
  } else {
    localStorage.removeItem("profissionaisDF_usuario");
  }
  atualizarInterfaceSessao();
}

// --- 4. ELEMENTOS DA NAVBAR E BOTÃO DO HERO ---
const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const navAuthItem = document.getElementById("navAuthItem");
const navLogoutItem = document.getElementById("navLogoutItem");
const navUserBadgeItem = document.getElementById("navUserBadgeItem");
const navUserBadgeBtn = document.getElementById("navUserBadgeBtn");
const navUserPhoto = document.getElementById("navUserPhoto");
const navUserFirstName = document.getElementById("navUserFirstName");
const heroActionBtn = document.getElementById("heroActionBtn");
const heroGuestState = document.getElementById("heroGuestState");
const heroLoggedState = document.getElementById("heroLoggedState");

export function atualizarInterfaceSessao() {
  const usuario = getUsuarioLogado();

  if (usuario) {
    if (navLogoutItem) navLogoutItem.style.display = "inline-block";
    if (navUserBadgeItem) navUserBadgeItem.style.display = "inline-flex";
    if (navAuthItem) navAuthItem.style.display = "none";

    if (navUserPhoto) {
      navUserPhoto.src = usuario.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120";
    }

    if (navUserFirstName) {
      navUserFirstName.textContent = (usuario.nome || "Usuário").trim();
    }

    if (heroGuestState) heroGuestState.style.display = "none";
    if (heroLoggedState) heroLoggedState.style.display = "inline-flex";
  } else {
    if (navLogoutItem) navLogoutItem.style.display = "none";
    if (navUserBadgeItem) navUserBadgeItem.style.display = "none";
    if (navAuthItem) navAuthItem.style.display = "inline-block";

    if (heroGuestState) heroGuestState.style.display = "inline-flex";
    if (heroLoggedState) heroLoggedState.style.display = "none";
  }
}

googleLoginBtn?.addEventListener("click", async () => {
  try {
    const usuario = await loginComGoogle();
    setUsuarioLogado(usuario);
    toggleAuthModal(false);
    showToast(`Bem-vindo, ${usuario.nome}!`);
  } catch (err) {
    showToast("Falha ao entrar com o Google.");
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await logoutUsuario();
    setUsuarioLogado(null);
    toggleMenu(true);
    showToast("Sessão finalizada.");
    filtrarCardsVitrine(true);
  } catch (err) {
    showToast("Erro ao finalizar sessão.");
  }
});

vigiarSessao((usuario) => {
  setUsuarioLogado(usuario);
});

openAuthModalBtn?.addEventListener("click", () => {
  toggleMenu(true);
  toggleAuthModal(true);
});

navUserBadgeBtn?.addEventListener("click", () => {
  toggleMenu(true);
  abrirPainelUsuario();
});

heroActionBtn?.addEventListener("click", () => {
  const usuario = getUsuarioLogado();
  if (usuario) abrirPainelUsuario();
  else toggleAuthModal(true);
});

// --- 5. ARRAYS E ACCORDIONS (DF) ---
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
  cityListWrapper.replaceChildren(
    ...CIDADES_DF.map((cidade) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "city-option";
      btn.textContent = cidade;
      return btn;
    })
  );
}

cityListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (cidadeInput) cidadeInput.value = btn.textContent.trim();
  toggleCityAccordion(true);
});

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
  const btnLimpar = document.createElement("button");
  btnLimpar.type = "button";
  btnLimpar.className = "city-option btn-limpar-prof";
  btnLimpar.textContent = " Limpar seleção";

  const opcoesProfissoes = PROFISSOES_LISTA.map((prof) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "city-option";
    btn.textContent = prof;
    return btn;
  });

  profissaoListWrapper.replaceChildren(btnLimpar, ...opcoesProfissoes);
}

profissaoListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn || !profissaoInput) return;
  e.stopPropagation();

  if (btn.classList.contains("btn-limpar-prof")) {
    profissaoInput.value = "";
    profissaoInput.rows = 1;
    profissaoListWrapper.querySelectorAll(".city-option").forEach((b) => b.classList.remove("selected"));
    showToast("Seleção de profissões limpa.");
    return;
  }

  const itemEscolhido = btn.textContent.trim();
  let selecionadas = profissaoInput.value
    ? profissaoInput.value.split("\n").map((p) => p.trim()).filter(Boolean)
    : [];

  const index = selecionadas.indexOf(itemEscolhido);

  if (index !== -1) {
    selecionadas.splice(index, 1);
    btn.classList.remove("selected");
  } else {
    if (selecionadas.length >= 3) {
      showToast("Você pode escolher no máximo 3 profissões.");
      return;
    }
    selecionadas.push(itemEscolhido);
    btn.classList.add("selected");
  }

  profissaoInput.value = selecionadas.join("\n");
  profissaoInput.rows = selecionadas.length > 0 ? selecionadas.length : 1;
});

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
  cnhListWrapper.replaceChildren(
    ...CNH_MOBILIDADE_LISTA.map((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "city-option";
      btn.textContent = item;
      return btn;
    })
  );
}

cnhListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (cnhInput) cnhInput.value = btn.textContent.trim();
  toggleCnhAccordion(true);
});

function fecharTodosAcordeons() {
  toggleCityAccordion(true);
  toggleProfissaoAccordion(true);
  toggleCnhAccordion(true);
}

cityAccordionHeader?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = cityAccordionDrawer?.classList.contains("open");
  fecharTodosAcordeons();
  if (!isOpen) toggleCityAccordion();
});

profissaoAccordionHeader?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = profissaoAccordionDrawer?.classList.contains("open");
  fecharTodosAcordeons();
  if (!isOpen) toggleProfissaoAccordion();
});

cnhAccordionHeader?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = cnhAccordionDrawer?.classList.contains("open");
  fecharTodosAcordeons();
  if (!isOpen) toggleCnhAccordion();
});

document.getElementById("publishForm")?.addEventListener("click", (e) => {
  if (!e.target.closest(".accordion-item-city")) {
    fecharTodosAcordeons();
  }
});

// --- 6. RENDER DO CARD DE VISITA VIA TEMPLATE ---
const cardTemplate = document.getElementById("cardVisitaTemplate");

export function criarCardVisitaElemento({ nome, experiencia, cidade, profissao, bio, cnh, email, telefone, fotoUrl, instagram, linkedin }) {
  const clone = cardTemplate.content.firstElementChild.cloneNode(true);
  const textoExp = experiencia == 1 ? "1 ano de experiência" : `${experiencia} anos de experiência`;

  const img = clone.querySelector(".card-img");
  img.src = fotoUrl;
  img.alt = nome;
  img.onerror = () => {
    img.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300";
  };

  const nomeEl = clone.querySelector(".card-nome");
  nomeEl.textContent = nome.toUpperCase();
  nomeEl.title = nome.toUpperCase();

  const profs = profissao ? profissao.split("\n").map((p) => p.trim()).filter(Boolean) : [];

  const l1 = clone.querySelector(".card-prof-linha-1");
  const t1 = clone.querySelector(".card-prof-texto-1");
  if (t1) {
    t1.textContent = profs[0] || profissao;
    t1.title = profs[0] || profissao;
  }

  const l2 = clone.querySelector(".card-prof-linha-2");
  const t2 = clone.querySelector(".card-prof-texto-2");
  if (l2 && t2 && profs[1]) {
    t2.textContent = profs[1];
    t2.title = profs[1];
    l2.style.display = "flex";
  }

  const l3 = clone.querySelector(".card-prof-linha-3");
  const t3 = clone.querySelector(".card-prof-texto-3");
  if (l3 && t3 && profs[2]) {
    t3.textContent = profs[2];
    t3.title = profs[2];
    l3.style.display = "flex";
  }

  const cidadeEl = clone.querySelector(".cidade-texto");
  cidadeEl.textContent = cidade;
  cidadeEl.title = cidade;

  clone.querySelector(".exp-destaque").textContent = textoExp;

  const btn = clone.querySelector(".btn-abrir-cartao");
  btn.dataset.nome = nome;
  btn.dataset.profissao = profissao;
  btn.dataset.bio = bio || "";
  btn.dataset.cnh = cnh || "";
  btn.dataset.cidade = cidade;
  btn.dataset.exp = textoExp;
  btn.dataset.foto = fotoUrl;
  btn.dataset.telefone = telefone;
  btn.dataset.email = email;
  btn.dataset.instagram = instagram || "";
  btn.dataset.linkedin = linkedin || "";

  return clone;
}

// --- 7. BUSCA E VITRINE COM PAGINAÇÃO ---
const cardsGrid = document.getElementById("cardsGrid");
const filtroProfissaoInput = document.getElementById("filtroProfissaoInput");
const limparBuscaBtn = document.getElementById("limparBuscaBtn");
const buscaVaziaMsg = document.getElementById("buscaVaziaMsg");

function normalizarTexto(txt) {
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const CARDS_PAGINA_1 = 6;
const CARDS_DEMAIS_PAGINAS = 12;
let paginaAtual = 1;

const paginationContainer = document.getElementById("paginationContainer");
const paginationPagesList = document.getElementById("paginationPagesList");
const btnPaginaAnterior = document.getElementById("btnPaginaAnterior");
const btnPaginaProxima = document.getElementById("btnPaginaProxima");

function calcularTotalPaginas(totalItens) {
  if (totalItens <= 0) return 0;
  if (totalItens <= CARDS_PAGINA_1) return 1;
  const itensRestantes = totalItens - CARDS_PAGINA_1;
  return 1 + Math.ceil(itensRestantes / CARDS_DEMAIS_PAGINAS);
}

function renderizarPagina(cardsFiltrados) {
  const total = cardsFiltrados.length;
  const totalPaginas = calcularTotalPaginas(total);

  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;
  if (paginaAtual < 1) paginaAtual = 1;

  let inicio = 0;
  let fim = CARDS_PAGINA_1;

  if (paginaAtual > 1) {
    inicio = CARDS_PAGINA_1 + (paginaAtual - 2) * CARDS_DEMAIS_PAGINAS;
    fim = inicio + CARDS_DEMAIS_PAGINAS;
  }

  const cardsPagina = cardsFiltrados.slice(inicio, fim);
  if (cardsGrid) {
    const fragmento = document.createDocumentFragment();
    cardsPagina.forEach((dados) => fragmento.appendChild(criarCardVisitaElemento(dados)));
    
    if (buscaVaziaMsg) buscaVaziaMsg.style.display = "none";
    cardsGrid.replaceChildren(fragmento);
  }

  desenharControlesPaginacao(totalPaginas);
}

export function filtrarCardsVitrine(resetPagina = true) {
  if (resetPagina) paginaAtual = 1;

  const termo = normalizarTexto(filtroProfissaoInput?.value || "");

  if (limparBuscaBtn) {
    limparBuscaBtn.style.display = termo.length > 0 ? "grid" : "none";
  }

  const cardsValidos = cardsMemoria.filter((card) => {
    if (card.status !== "publicado") return false;

    const nome = normalizarTexto(card.nome || "");
    const profissao = normalizarTexto(card.profissao || "");
    const cidade = normalizarTexto(card.cidade || "");

    return nome.includes(termo) || profissao.includes(termo) || cidade.includes(termo);
  });

  if (cardsValidos.length === 0) {
    if (buscaVaziaMsg) buscaVaziaMsg.style.display = "block";
    if (cardsGrid) cardsGrid.replaceChildren(buscaVaziaMsg);
    if (paginationContainer) paginationContainer.style.display = "none";
  } else {
    if (buscaVaziaMsg) buscaVaziaMsg.style.display = "none";

    if (termo.length > 0) {
      if (cardsGrid) {
        const fragmento = document.createDocumentFragment();
        cardsValidos.forEach((dados) => fragmento.appendChild(criarCardVisitaElemento(dados)));
        cardsGrid.replaceChildren(fragmento);
      }
      cardsGrid?.classList.add("modo-busca-rolagem");
      if (paginationContainer) paginationContainer.style.display = "none";
    } else {
      cardsGrid?.classList.remove("modo-busca-rolagem");
      renderizarPagina(cardsValidos);
    }
  }
}

function desenharControlesPaginacao(totalPaginas) {
  if (!paginationContainer || !paginationPagesList) return;

  if (totalPaginas <= 1) {
    paginationContainer.style.display = "none";
    return;
  }
  paginationContainer.style.display = "flex";

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
        document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    paginationPagesList.appendChild(btnNum);
  }

  if (btnPaginaAnterior) btnPaginaAnterior.disabled = paginaAtual === 1;
  if (btnPaginaProxima) btnPaginaProxima.disabled = paginaAtual === totalPaginas;
}

btnPaginaAnterior?.addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    filtrarCardsVitrine(false);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

btnPaginaProxima?.addEventListener("click", () => {
  const termo = normalizarTexto(filtroProfissaoInput?.value || "");
  const validos = cardsMemoria.filter((c) => c.status === "publicado" && (
    normalizarTexto(c.nome || "").includes(termo) ||
    normalizarTexto(c.profissao || "").includes(termo) ||
    normalizarTexto(c.cidade || "").includes(termo)
  ));
  const totalPaginas = calcularTotalPaginas(validos.length);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    filtrarCardsVitrine(false);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// Sincronização em tempo real da coleção 'cartoes' com o Firestore
function iniciarSincronizacaoFirestore() {
  const colecaoRef = collection(db, "cartoes");
  onSnapshot(colecaoRef, (snapshot) => {
    cardsMemoria = [];
    snapshot.forEach((doc) => {
      cardsMemoria.push({ id: doc.id, ...doc.data() });
    });
    filtrarCardsVitrine(false);
  }, (error) => {
    console.error("Erro ao sincronizar com Firestore:", error);
  });
}

filtroProfissaoInput?.addEventListener("input", () => filtrarCardsVitrine(true));
limparBuscaBtn?.addEventListener("click", () => {
  if (filtroProfissaoInput) {
    filtroProfissaoInput.value = "";
    filtrarCardsVitrine(true);
    filtroProfissaoInput.focus();
  }
});

// --- 8. EVENTO PARA ABRIR O DETALHE DO CARD ---
cardsGrid?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-abrir-cartao");
  if (btn) abrirModalDetalhesCartao(btn);
});

// Inicialização Geral
initModalListeners();
atualizarInterfaceSessao();
iniciarSincronizacaoFirestore();