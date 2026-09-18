import { loginComGoogle, logoutUsuario, vigiarSessao } from "./auth.js";
import { 
  toggleAuthModal, 
  toggleDashboardModal, 
  togglePublishModal, 
  toggleCartaoModal, 
  initModalListeners 
} from "./modal.js";
/* =========================================================================
   MAIN MODULE - CONTROLE DE INTERFACE, LOGIN GOOGLE E PAINEL DO USUÁRIO
   ========================================================================= */

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

// --- TOAST NOTIFICATION ---
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

hamburgerBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

menuBackdrop?.addEventListener("click", () => toggleMenu(true));
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(true));
});



const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const openMobileAuthModalBtn = document.getElementById("openMobileAuthModalBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const navAuthItem = document.getElementById("navAuthItem");
const mobileAuthItem = document.getElementById("mobileAuthItem");
const navLogoutItem = document.getElementById("navLogoutItem");
const navPanelItem = document.getElementById("navPanelItem");
const openDashboardNavBtn = document.getElementById("openDashboardNavBtn");
const navUserBadgeItem = document.getElementById("navUserBadgeItem");
const mobileUserBadgeItem = document.getElementById("mobileUserBadgeItem");
const navUserPhoto = document.getElementById("navUserPhoto");
const mobileUserPhoto = document.getElementById("mobileUserPhoto");
const navUserFirstName = document.getElementById("navUserFirstName");
const mobileUserFirstName = document.getElementById("mobileUserFirstName");
const heroActionBtn = document.getElementById("heroActionBtn");
const heroActionText = document.getElementById("heroActionText");

function getUsuarioLogado() {
  const dados = localStorage.getItem("profissionaisDF_usuario");
  return dados ? JSON.parse(dados) : null;
}

function setUsuarioLogado(usuario) {
  if (usuario) {
    localStorage.setItem("profissionaisDF_usuario", JSON.stringify(usuario));
  } else {
    localStorage.removeItem("profissionaisDF_usuario");
  }
  atualizarInterfaceSessao();
}

// Simulação de login direto com Google (ao plugar Firebase, usará signInWithPopup)

// Login oficial com popup do Google
googleLoginBtn?.addEventListener("click", async () => {
  try {
    const usuario = await loginComGoogle();
    setUsuarioLogado(usuario);
    toggleAuthModal(false);
    showToast(`Bem-vindo, ${usuario.nome}!`);
    abrirPainelUsuario();
  } catch (err) {
    showToast("Falha ao entrar com o Google.");
  }
});

// Logout oficial
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

// Sincronização contínua com a sessão oficial do Firebase
vigiarSessao((usuario) => {
  setUsuarioLogado(usuario);
});


function atualizarInterfaceSessao() {
  const usuario = getUsuarioLogado();
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (navPanelItem) navPanelItem.style.display = "inline-block";

  if (usuario) {
    // Desktop: se estiver no celular (isMobile), o li dentro da lista fica "none" para não duplicar
    if (navLogoutItem) navLogoutItem.style.display = "inline-block";
    if (navUserBadgeItem) navUserBadgeItem.style.display = isMobile ? "none" : "inline-flex";
    if (navAuthItem) navAuthItem.style.display = "none";

    // Mobile (topo fixo)
    if (mobileUserBadgeItem) mobileUserBadgeItem.style.display = isMobile ? "flex" : "none";
    if (mobileAuthItem) mobileAuthItem.style.display = "none";

    const foto = usuario.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120";
    const nome = (usuario.nome || "Usuário").trim();

    if (navUserPhoto) navUserPhoto.src = foto;
    if (mobileUserPhoto) mobileUserPhoto.src = foto;

    if (navUserFirstName) navUserFirstName.textContent = nome;
    if (mobileUserFirstName) mobileUserFirstName.textContent = nome;

    if (heroActionText) heroActionText.textContent = "Acessar Meu Painel";
  } else {
    // Desktop: se for celular, o item entrar da lista também não duplica
    if (navLogoutItem) navLogoutItem.style.display = "none";
    if (navUserBadgeItem) navUserBadgeItem.style.display = "none";
    if (navAuthItem) navAuthItem.style.display = isMobile ? "none" : "inline-block";

    // Mobile (topo fixo)
    if (mobileUserBadgeItem) mobileUserBadgeItem.style.display = "none";
    if (mobileAuthItem) mobileAuthItem.style.display = isMobile ? "flex" : "none";

    if (heroActionText) heroActionText.textContent = "Divulgue sua Profissão";
  }
}

// Reavalia a interface sem recarregar caso a tela seja redimensionada
window.addEventListener("resize", () => {
  atualizarInterfaceSessao();
});








// Abrir modal de Login
openAuthModalBtn?.addEventListener("click", () => {
  toggleMenu(true);
  toggleAuthModal(true);
});
openMobileAuthModalBtn?.addEventListener("click", () => {
  toggleMenu(true);
  toggleAuthModal(true);
});

mobileUserBadgeItem?.addEventListener("click", () => {
  toggleMenu(true);
  abrirPainelUsuario();
});

// Abrir Meu Painel pelo link no menu
// Clique em Meu Painel no menu (se estiver logado abre o painel, se deslogado abre login)
openDashboardNavBtn?.addEventListener("click", () => {
  toggleMenu(true);
  const usuario = getUsuarioLogado();
  if (usuario) {
    abrirPainelUsuario();
  } else {
    toggleAuthModal(true);
  }
});

// Ação do botão no Hero
heroActionBtn?.addEventListener("click", () => {
  const usuario = getUsuarioLogado();
  if (usuario) abrirPainelUsuario();
  else toggleAuthModal(true);
});

// --- 3. MODAL PAINEL DO USUÁRIO ---

// --- 3. PAINEL DO USUÁRIO ---
const dashUserName = document.getElementById("dashUserName");
const dashUserEmail = document.getElementById("dashUserEmail");
const dashUserAvatar = document.getElementById("dashUserAvatar");
const dashCardViewBlock = document.getElementById("dashCardViewBlock");
const dashNoCardBlock = document.getElementById("dashNoCardBlock");
const dashCardPreviewContainer = document.getElementById("dashCardPreviewContainer");
const btnToggleStatus = document.getElementById("btnToggleStatus");
const toggleStatusLabel = document.getElementById("toggleStatusLabel");
const btnEditarMeuCartao = document.getElementById("btnEditarMeuCartao");
const btnExcluirMeuCartao = document.getElementById("btnExcluirMeuCartao");
const btnCriarPrimeiroCartao = document.getElementById("btnCriarPrimeiroCartao");




function getMeuCartao() {
  const usuario = getUsuarioLogado();
  if (!usuario) return null;
  const cardsSalvos = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
  return cardsSalvos.find((c) => c.email.toLowerCase() === usuario.email.toLowerCase()) || null;
}

function abrirPainelUsuario() {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    toggleAuthModal(true);
    return;
  }

  if (dashUserName) dashUserName.textContent = usuario.nome;
  if (dashUserEmail) dashUserEmail.textContent = usuario.email;
  if (dashUserAvatar) dashUserAvatar.src = usuario.foto;

  const meuCartao = getMeuCartao();

  if (meuCartao) {
    if (dashCardViewBlock) dashCardViewBlock.style.display = "block";
    if (dashNoCardBlock) dashNoCardBlock.style.display = "none";

    const statusBadge = meuCartao.status === "publicado"
      ? '<span class="status-badge published"><i class="bi bi-check-circle-fill"></i> Publicado na Vitrine</span>'
      : '<span class="status-badge paused"><i class="bi bi-pause-circle-fill"></i> Cartão Pausado (Oculto)</span>';

    if (dashCardPreviewContainer) {
      dashCardPreviewContainer.innerHTML = statusBadge + criarCardVisitaHTML(meuCartao);
    }

    if (meuCartao.status === "publicado") {
      btnToggleStatus.className = "dash-btn btn-toggle-status paused";
      toggleStatusLabel.textContent = "Pausar Cartão";
    } else {
      btnToggleStatus.className = "dash-btn btn-toggle-status";
      toggleStatusLabel.textContent = "Publicar Cartão";
    }
  } else {
    if (dashCardViewBlock) dashCardViewBlock.style.display = "none";
    if (dashNoCardBlock) dashNoCardBlock.style.display = "block";
  }

  toggleDashboardModal(true);
}

// Botão Alternar Status (Publicado / Pausado)
btnToggleStatus?.addEventListener("click", () => {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  let cards = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
  const idx = cards.findIndex((c) => c.email.toLowerCase() === usuario.email.toLowerCase());

  if (idx !== -1) {
    cards[idx].status = cards[idx].status === "publicado" ? "pausado" : "publicado";
    localStorage.setItem("profissionaisDF_cards", JSON.stringify(cards));
    showToast(cards[idx].status === "publicado" ? "Cartão publicado na vitrine!" : "Cartão pausado.");
    abrirPainelUsuario();
    filtrarCardsVitrine(true);
  }
});

// Botão Excluir Cartão
btnExcluirMeuCartao?.addEventListener("click", () => {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  if (confirm("Tem certeza que deseja excluir seu cartão de visita?")) {
    let cards = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
    cards = cards.filter((c) => c.email.toLowerCase() !== usuario.email.toLowerCase());
    localStorage.setItem("profissionaisDF_cards", JSON.stringify(cards));
    showToast("Cartão excluído com sucesso.");
    abrirPainelUsuario();
    filtrarCardsVitrine(true);
  }
});

// --- 4. FORMULÁRIO DO CARTÃO (CRIAÇÃO / EDIÇÃO) ---
// --- 4. FORMULÁRIO DO CARTÃO (CRIAÇÃO / EDIÇÃO) ---
const publishForm = document.getElementById("publishForm");
const formModalTitle = document.getElementById("formModalTitle");
const formModalSub = document.getElementById("formModalSub");
const fotoInput = document.getElementById("fotoInput");
const uploadPreviewImg = document.getElementById("uploadPreviewImg");
const uploadPlaceholderIcon = document.getElementById("uploadPlaceholderIcon");

function prepararFormularioCartao() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const meuCartao = getMeuCartao();
  publishForm?.reset();

  const emailInput = document.getElementById("emailInput");
  if (emailInput) {
    emailInput.value = usuario.email;
    emailInput.readOnly = true;
  }

  if (meuCartao) {
    if (formModalTitle) formModalTitle.textContent = "Editar Meu Cartão";
    if (formModalSub) formModalSub.textContent = "Atualize suas informações e salve as alterações.";
    document.getElementById("nomeInput").value = meuCartao.nome || "";
    document.getElementById("experienciaInput").value = meuCartao.experiencia !== undefined ? meuCartao.experiencia : "";
    document.getElementById("cnhInput").value = meuCartao.cnh || "";
    document.getElementById("cidadeInput").value = meuCartao.cidade || "";
    document.getElementById("profissaoInput").value = meuCartao.profissao || "";
    document.getElementById("bioInput").value = meuCartao.bio || "";
    document.getElementById("telefoneInput").value = meuCartao.telefone || "";
    document.getElementById("instagramInput").value = meuCartao.instagram || "";
    document.getElementById("linkedinInput").value = meuCartao.linkedin || "";

    if (uploadPreviewImg && meuCartao.fotoUrl) {
      uploadPreviewImg.src = meuCartao.fotoUrl;
      uploadPreviewImg.style.display = "block";
    }
    if (uploadPlaceholderIcon) uploadPlaceholderIcon.style.display = "none";
  } else {
    if (formModalTitle) formModalTitle.textContent = "Criar Meu Cartão";
    if (formModalSub) formModalSub.textContent = "Preencha seus dados para publicar seu cartão no DF.";
    document.getElementById("nomeInput").value = usuario.nome || "";
    if (uploadPreviewImg) {
      uploadPreviewImg.src = "";
      uploadPreviewImg.style.display = "none";
    }
    if (uploadPlaceholderIcon) uploadPlaceholderIcon.style.display = "block";
  }

  toggleDashboardModal(false);
  togglePublishModal(true);
}

btnEditarMeuCartao?.addEventListener("click", prepararFormularioCartao);
btnCriarPrimeiroCartao?.addEventListener("click", prepararFormularioCartao);

fotoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    if (uploadPreviewImg) {
      uploadPreviewImg.src = evt.target.result;
      uploadPreviewImg.style.display = "block";
    }
    if (uploadPlaceholderIcon) uploadPlaceholderIcon.style.display = "none";
  };
  reader.readAsDataURL(file);
});

// --- ARRAYS E ACCORDIONS (DF) ---
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
  cityListWrapper.innerHTML = CIDADES_DF.map(
    (cidade) => `<button type="button" class="city-option">${cidade}</button>`
  ).join("");
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

// --- RENDER DO CARD DE VISITA ---
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

// --- MÁSCARA TELEFONE (DF) ---
const telefoneInput = document.getElementById("telefoneInput");

telefoneInput?.addEventListener("input", (e) => {
  let apenasNumeros = e.target.value.replace(/\D/g, "");
  if (apenasNumeros.startsWith("61")) apenasNumeros = apenasNumeros.slice(2);
  apenasNumeros = apenasNumeros.slice(0, 9);

  if (apenasNumeros.length === 0) {
    e.target.value = "";
    return;
  }
  if (apenasNumeros.length <= 5) {
    e.target.value = `(61) ${apenasNumeros}`;
  } else {
    e.target.value = `(61) ${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
  }
});

function redimensionarFoto(arquivo, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const maxDim = 160;
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
      callback(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(arquivo);
}

// --- SUBMISSÃO DO FORMULÁRIO DO CARTÃO ---
publishForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const fotoArquivo = document.getElementById("fotoInput").files[0];
  const nome = document.getElementById("nomeInput").value.trim();
  const experiencia = document.getElementById("experienciaInput").value.trim();
  const cnh = document.getElementById("cnhInput")?.value.trim() || "";
  const cidade = document.getElementById("cidadeInput").value.trim();
  const profissao = document.getElementById("profissaoInput").value.trim();
  const bio = document.getElementById("bioInput")?.value.trim() || "";
  const email = usuario.email;
  const telefone = document.getElementById("telefoneInput").value.trim();
  const instagram = document.getElementById("instagramInput")?.value.trim() || "";
  const linkedin = document.getElementById("linkedinInput")?.value.trim() || "";

  let cards = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
  const idx = cards.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
  const cartaoExistente = idx !== -1 ? cards[idx] : null;

  if (!fotoArquivo && !cartaoExistente?.fotoUrl) {
    showToast("Por favor, selecione uma foto para o seu cartão.");
    return;
  }

  const numerosTelefone = telefone.replace(/\D/g, "");
  if (numerosTelefone.length !== 11 || !numerosTelefone.startsWith("61")) {
    showToast("Digite um telefone válido do DF com DDD (61) e 9 dígitos.");
    telefoneInput?.focus();
    return;
  }

  const salvarCardFinal = (fotoUrlFinal) => {
    const dadosCard = {
      nome,
      experiencia,
      cnh,
      cidade,
      profissao,
      bio,
      email,
      telefone,
      fotoUrl: fotoUrlFinal,
      instagram,
      linkedin,
      status: cartaoExistente ? cartaoExistente.status : "publicado" // Nasce publicado por padrão
    };

    if (idx !== -1) {
      cards[idx] = dadosCard;
      showToast("Cartão atualizado com sucesso!");
    } else {
      cards.unshift(dadosCard);
      showToast("Cartão criado e publicado na vitrine!");
    }

    localStorage.setItem("profissionaisDF_cards", JSON.stringify(cards));
    togglePublishModal(false);
    abrirPainelUsuario();
    filtrarCardsVitrine(true);
  };

  if (fotoArquivo) {
    redimensionarFoto(fotoArquivo, (novaFotoUrl) => {
      salvarCardFinal(novaFotoUrl);
    });
  } else {
    salvarCardFinal(cartaoExistente.fotoUrl);
  }
});

// --- BUSCA E VITRINE (EXIBE APENAS CARTÕES COM STATUS 'PUBLICADO') ---
const cardsGrid = document.getElementById("cardsGrid");
const filtroProfissaoInput = document.getElementById("filtroProfissaoInput");
const limparBuscaBtn = document.getElementById("limparBuscaBtn");

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
    cardsGrid.innerHTML = cardsPagina.map((dados) => criarCardVisitaHTML(dados)).join("");
  }

  desenharControlesPaginacao(totalPaginas);
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
  const cards = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];
  const validos = cards.filter((c) => c.status === "publicado" && (
    normalizarTexto(c.nome).includes(termo) ||
    normalizarTexto(c.profissao).includes(termo) ||
    normalizarTexto(c.cidade).includes(termo)
  ));
  const totalPaginas = calcularTotalPaginas(validos.length);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    filtrarCardsVitrine(false);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

function filtrarCardsVitrine(resetPagina = true) {
  if (resetPagina) paginaAtual = 1;

  const termo = normalizarTexto(filtroProfissaoInput?.value || "");
  const todosCards = JSON.parse(localStorage.getItem("profissionaisDF_cards")) || [];

  if (limparBuscaBtn) {
    limparBuscaBtn.style.display = termo.length > 0 ? "grid" : "none";
  }

  // REGRA FUNDAMENTAL: Só exibe cartões que tenham status === "publicado"
  const cardsValidos = todosCards.filter((card) => {
    if (card.status !== "publicado") return false;

    const bateuNome = normalizarTexto(card.nome).includes(termo);
    const bateuProfissao = normalizarTexto(card.profissao).includes(termo);
    const bateuCidade = normalizarTexto(card.cidade).includes(termo);

    return bateuNome || bateuProfissao || bateuCidade;
  });

  if (cardsValidos.length === 0) {
    if (cardsGrid) {
      cardsGrid.innerHTML = `
        <p style="grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 1.05rem; padding: 40px 0;">
          Nenhum profissional encontrado para esta busca no DF.
        </p>
      `;
    }
    if (paginationContainer) paginationContainer.style.display = "none";
  } else {
    if (termo.length > 0) {
      if (cardsGrid) {
        cardsGrid.innerHTML = cardsValidos.map((dados) => criarCardVisitaHTML(dados)).join("");
      }
      cardsGrid?.classList.add("modo-busca-rolagem");
      if (paginationContainer) paginationContainer.style.display = "none";
    } else {
      cardsGrid?.classList.remove("modo-busca-rolagem");
      renderizarPagina(cardsValidos);
    }
  }
}

filtroProfissaoInput?.addEventListener("input", () => filtrarCardsVitrine(true));
limparBuscaBtn?.addEventListener("click", () => {
  if (filtroProfissaoInput) {
    filtroProfissaoInput.value = "";
    filtrarCardsVitrine(true);
    filtroProfissaoInput.focus();
  }
});

// --- MODAL DE DETALHES DO CARTÃO (VISITANTE) ---

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

  document.getElementById("modalFoto").src = foto;
  document.getElementById("modalProfissao").textContent = profissao;
  document.getElementById("modalCidade").textContent = cidade;

  const anosApenas = exp.replace(/\D/g, "");
  document.getElementById("modalExp").textContent = anosApenas == 1 ? "1 ano de experiência" : `${anosApenas} anos de experiência`;

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

  const modalBio = document.getElementById("modalBio");
  if (modalBio) {
    if (bio) {
      modalBio.textContent = bio;
      modalBio.style.display = "block";
    } else {
      modalBio.style.display = "none";
    }
  }

  const formatarNomeMisto = (str) => {
    const conectivos = ["de", "da", "do", "das", "dos", "e"];
    return str
      .toLowerCase()
      .split(" ")
      .filter((p) => p.length > 0)
      .map((p, i) => (i > 0 && conectivos.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join(" ");
  };

  document.getElementById("modalNome").textContent = formatarNomeMisto(nome);

  const zapNums = telefone.replace(/\D/g, "");
  const modalZapLink = document.getElementById("modalZapLink");
  if (modalZapLink) {
    modalZapLink.href = zapNums.length >= 10 ? `https://wa.me/55${zapNums}` : `tel:${zapNums}`;
  }

  const modalMailLink = document.getElementById("modalMailLink");
  if (modalMailLink) {
    if (email) {
      modalMailLink.href = `mailto:${email}`;
      modalMailLink.style.display = "inline-flex";
    } else {
      modalMailLink.style.display = "none";
    }
  }

  const instaBtn = document.getElementById("modalInstaLink");
  if (instaBtn) {
    if (instagram) {
      instaBtn.href = `https://instagram.com/${instagram.replace("@", "").trim()}`;
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
// Inicialização Geral
initModalListeners();
atualizarInterfaceSessao();
filtrarCardsVitrine(true);