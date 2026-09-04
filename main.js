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
  "Plano Piloto", "Recanto das Emas", "Riacho Fundo", "Riacho Fundo II", "Samambaia N", "Samambaia S", "Santa Maria", "São Sebastião",
  "Estrutural", "SIA", "Sobradinho", "Sobradinho II", "Sol Nascente", "Pôr do Sol", "Sudoeste", "Octogonal", "Taguatinga", "Taguatinga N",
  "Taguatinga S", "Varjão", "Vicente Pires"
];

export const PROFISSOES_LISTA = [
  "Adestrador(a) de Animais", "Administrador(a)", "Advogado(a)", "Alfaiate / Costureira", "Animador(a) de Festas",
  "Ajudante / Servente de Obras", "Armador de Ferragens", "Arquiteto(a)", "Artesão(ã)", "Asfaltador / Pavimentador",
  "Assistente Social", "Assistente Técnico de TI", "Astrólogo(a)", "Babá", "Barbeiro", "Balconista", "Barman / Bartender",
  "Biomédico(a)", "Bombeiro Hidráulico", "Borracheiro", "Cabeleireiro(a)", "Calheiro / Rufista", "Carpinteiro",
  "Carpinteiro de Obras / Fôrmas", "Caseiro(a) / Zelador(a)", "Chaveiro", "Coach / Mentor(a)", "Concretador",
  "Confeiteiro(a)", "Consultor(a) Financeiro", "Contador(a)", "Copeiro(a)", "Corretor(a) de Imóveis", "Corretor(a) de Seguros",
  "Cozinheiro(a) / Buffet", "Cuidador(a) de Idosos", "Designer de Interiores", 
  "Dentista", "Depilador(a)", "Designer de Sobrancelhas", "Designer Gráfico", "Desenvolvedor(a) Mobile", "Desenvolvedor(a) Web",
  "Departamento pessoal / RH", "Diarista / Faxineiro(a)", "DJ", "Dublador(a)", "Economista", "Editor(a) de Vídeo",
  "Eletricista Automotivo", "Eletricista Predial,Residencial", "Encanador", "Encanador Industrial", "Enfermeiro(a)",
  "Engenheiro(a) Civil", "Engenheiro(a) Eletricista", "Engenheiro(a) Mecânico", "Engenheiro(a) ambiental",
   "Esteticista", "Farmacêutico(a)", "Fisioterapeuta", "Fonoaudiólogo(a)",
  "Fotógrafo(a)", "Garçom / Garçonete", "Gesseiro", "Guia de Turismo", "Impermeabilizador", "Instalador de Ar-Condicionado",
  "Instalador de Câmeras / Segurança", "Instalador de Drywall", "Instalador de Energia Solar", "Instalador de Insulfilm",
  "Instalador de Papel de Parede", "Instalador de Piso Laminado / Vinílico", "Instalador de Pisos,Revestimentos",
  "Instalador de cortinas / persianas", "Instalador de toldos / coberturas", "Instrutor(a) de Artes Marciais",
  "Instrutor(a) de Dança", "Instrutor(a) de Trânsito", "Instrutor(a) de Yoga", "Jardineiro", "Jornalista",
  "Ladrilheiro / Azulejista", "Luthier (Manutenção de Instrumentos)", "Maquiador(a)", "Marceneiro", "Manicure / Pedicure",
  "Marmoreiro", "Massoterapeuta", "Massagista", "Mecânico Automotivo", "Mecânico de Motos", "Médico(a)",
  "Mestre de Cerimônias", "Mestre de Obras", "Montador de Andaimes", "Montador de Estrutura Metálica", "Montador de Móveis",
  "Moto-boy / Entregador(a)", "Motorista / Freteiro", "Nutricionista", "Operad de Betoneira", "Operad de Máquinas Pesadas",
  "Operad de Retroescavadeira","Operad de BobCat,Mini Carregadeira", "Operad de Empilhadeira", "Operad de Guindaste", "Operad de Pá Carregadeira",
  "Ourives", "Operador de Demolição","Padeiro", "Paisagista", "Pastilheiro / Revestidor", "Pedagogo(a)", "Pedreiro", "Personal Organizer",
  "Personal Trainer", "Pintor Automotivo", "Pintor de Obras,Residencial", "Piscineiro", "Podólogo(a)", "Polidor Automotivo",
  "Poceiro (Abertura de Poços)", "Professor(a)", "Psicólogo(a)", "Psicopedagogo(a)", "Publicitário(a)", "Recepcionista",
  "Recreador(a) Infantil", "Redator(a)", "Sapateiro", "Segurança / Vigilante", "Serviços Gerais / Auxiliar de Limpeza",
  "Serralheiro", "Sondador de Solo", "Social Media", "Soldador", "Tapeceiro / Estofador", "Tatuador(a)", "Técnico de Celular",
  "Eletrotécnico", "Técnico de Enfermagem", "Técnico em Edificações", "Técnico em Segurança do Trabalho", "Telhadista",
  "Terapeuta Holístico", "Terapeuta Ocupacional", "Topógrafo(a)", "Tosador / Pet Care", "Tradutor(a)", "Tratorista",
  "Veterinário(a)", "Vidraceiro", "Vendedor(a) / Representante Comercial", "Outros Serviços"
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

cityAccordionHeader?.addEventListener("click", () => {
  toggleProfissaoAccordion(true); // fecha profissões se abrir cidade
  toggleCityAccordion();
});

cityListWrapper?.addEventListener("click", (e) => {
  const btn = e.target.closest(".city-option");
  if (!btn) return;
  e.stopPropagation();
  if (cidadeInput) cidadeInput.value = btn.textContent.trim();
  toggleCityAccordion(true);
});

// --- CONTROLE DO ACCORDION DE PROFISSÕES ---
// Funções auxiliares para gerar a máscara inicial
// Exibe somente os 3 primeiros dígitos do telefone sem caracteres extras
function mascararTelefone(tel) {
  const nums = tel.replace(/\D/g, "");
  // Remove o DDD 61 caso esteja no início
  const semDDD = nums.startsWith("61") ? nums.slice(2) : nums;
  const tresPrimeiros = semDDD.slice(0, 3);
  return `(61) ${tresPrimeiros}...`;
}

// Exibe somente um pedaço inicial do e-mail sem mostrar o restante
function mascararEmail(em) {
  const partes = em.split("@");
  const user = partes[0] || "";
  const pedaco = user.slice(0, 9);
  return `${pedaco}...`;
}

export function criarCardVisitaHTML({ nome, idade, cidade, profissao, email, telefone, fotoUrl, instagram, linkedin }) {
  const telNumeros = telefone.replace(/\D/g, "");
  const zapLink = telNumeros.length >= 10 ? `https://wa.me/55${telNumeros}` : `tel:${telNumeros}`;
  const mailLink = `mailto:${email}`;

  const telMascara = mascararTelefone(telefone);
  const emailMascara = mascararEmail(email);

  // Redes Sociais opcionais
  let instaLink = "";
  if (instagram) {
    const userInsta = instagram.replace("@", "").trim();
    instaLink = `<a href="https://instagram.com/${userInsta}" target="_blank" rel="noopener noreferrer" class="card-social-btn insta" title="Instagram @${userInsta}"><i class="bi bi-instagram"></i></a>`;
  }

  let linkedinLink = "";
  if (linkedin) {
    const isUrl = linkedin.startsWith("http");
    const fullLink = isUrl ? linkedin : `https://${linkedin}`;
    linkedinLink = `<a href="${fullLink}" target="_blank" rel="noopener noreferrer" class="card-social-btn linkedin" title="LinkedIn"><i class="bi bi-linkedin"></i></a>`;
  }

  return `
    <div class="card-visita">
      <!-- ÁREA DE PERFIL (ESQUERDA: IDENTIDADE) -->
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
            <span>${cidade}</span>
            <span class="separador-bullet">•</span>
            <span>${idade} anos</span>
          </div>
        </div>
      </div>

      <!-- ÁREA DE AÇÃO (DIREITA: CONVERSÃO DIRETA COM REVELAÇÃO) -->
      <div class="card-conversao-col">
        <div class="card-contatos-lista">
          <!-- Telefone Mascarado -->
          <button type="button" 
                  class="btn-revelar-contato zap-revelar" 
                  data-real="${telefone}" 
                  data-link="${zapLink}" 
                  title="Clique para ver o telefone e chamar no WhatsApp">
            <i class="bi bi-whatsapp"></i>
            <span class="contato-texto">${telMascara}</span>
            <span class="tag-olx-ver">Ver</span>
          </button>

          <!-- E-mail Mascarado -->
          <button type="button" 
                  class="btn-revelar-contato mail-revelar" 
                  data-real="${email}" 
                  data-link="${mailLink}" 
                  title="Clique para ver o e-mail completo">
            <i class="bi bi-envelope-fill"></i>
            <span class="contato-texto">${emailMascara}</span>
            <span class="tag-olx-ver">Ver</span>
          </button>
        </div>

        <div class="card-rodape-social">
          ${instaLink}
          ${linkedinLink}
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
carregarCardsSalvos();

// --- ENVIO DO FORMULÁRIO COM PERSISTÊNCIA NO LOCALSTORAGE ---
publishForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const fotoArquivo = document.getElementById("fotoInput").files[0];
  const nome = document.getElementById("nomeInput").value.trim();
  const idade = document.getElementById("idadeInput").value.trim();
  const cidade = document.getElementById("cidadeInput").value.trim();
  const profissao = document.getElementById("profissaoInput").value.trim();
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
      idade,
      cidade,
      profissao,
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
function filtrarCardsVitrine() {
  // 1. Obtém o que o usuário digitou e limpa acentos e letras maiúsculas
  const termo = normalizarTexto(filtroProfissaoInput?.value || "");
  
  // 2. Seleciona todos os cards presentes na grade
  const todosCards = cardsGrid?.querySelectorAll(".card-visita");

  // 3. Exibe ou oculta o botão "X" para limpar busca
  if (limparBuscaBtn) {
    limparBuscaBtn.style.display = termo.length > 0 ? "grid" : "none";
  }

  let encontrados = 0;

  // 4. Percorre cada cartão na vitrine para comparar profissão e cidade
  todosCards?.forEach((card) => {
    // Captura o texto do item de profissão através do ícone da maleta/trabalho
    const itemProfissao = card.querySelector(".bi-person-workspace")?.parentElement;
    const profissaoTexto = itemProfissao ? itemProfissao.textContent : "";

    // Captura o texto do item de cidade através do ícone de localização geográfica
    const itemCidade = card.querySelector(".bi-geo-alt-fill")?.parentElement;
    const cidadeTexto = itemCidade ? itemCidade.textContent : "";

    // Valida se o termo digitado está presente na Profissão OU na Cidade do DF
    const bateuProfissao = normalizarTexto(profissaoTexto).includes(termo);
    const bateuCidade = normalizarTexto(cidadeTexto).includes(termo);

    // Se o termo digitado casar com qualquer um dos dois, o card continua visível
    if (bateuProfissao || bateuCidade) {
      card.style.display = "flex";
      encontrados++;
    } else {
      card.style.display = "none";
    }
  });

  // 5. Feedback visual amigável quando nenhum resultado bate com os termos pesquisados
  let feedbackVazio = document.getElementById("buscaSemResultados");
  if (encontrados === 0) {
    if (!feedbackVazio && cardsGrid) {
      feedbackVazio = document.createElement("p");
      feedbackVazio.id = "buscaSemResultados";
      feedbackVazio.style.cssText = "grid-column: 1 / -1; text-align: center; color: #64748b; font-size: 1.05rem; padding: 40px 0;";
      feedbackVazio.textContent = "Nenhum profissional encontrado para esta profissão ou região.";
      cardsGrid.appendChild(feedbackVazio);
    }
  } else if (feedbackVazio) {
    feedbackVazio.remove();
  }
}


// Filtra automaticamente conforme o usuário digita
filtroProfissaoInput?.addEventListener("input", filtrarCardsVitrine);



// Limpa a busca e restaura todos os cards
limparBuscaBtn?.addEventListener("click", () => {
  if (filtroProfissaoInput) {
    filtroProfissaoInput.value = "";
    filtrarCardsVitrine();
    filtroProfissaoInput.focus();
  }
});

// --- EVENTO DE REVELAÇÃO DE CONTATO ESTILO OLX / MERCADO LIVRE ---
cardsGrid?.addEventListener("click", (e) => {
  const btnRevelar = e.target.closest(".btn-revelar-contato");
  if (!btnRevelar) return;

  const jaRevelado = btnRevelar.classList.contains("revelado");
  const dadoReal = btnRevelar.getAttribute("data-real");
  const linkReal = btnRevelar.getAttribute("data-link");

  if (!jaRevelado) {
    // 1º Clique: Revela o dado real e muda o estilo visual
    btnRevelar.classList.add("revelado");
    const spanTexto = btnRevelar.querySelector(".contato-texto");
    if (spanTexto) spanTexto.textContent = dadoReal;

    // Remove a etiquetinha "Ver"
    const tagVer = btnRevelar.querySelector(".tag-olx-ver");
    if (tagVer) tagVer.remove();
  } else {
    // 2º Clique: Redireciona diretamente para o WhatsApp ou abre o cliente de E-mail
    if (linkReal) {
      window.open(linkReal, "_blank");
    }
  }
});