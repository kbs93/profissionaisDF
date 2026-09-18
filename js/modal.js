/* =========================================================================
   MODAL CONTROLLER - GERENCIAMENTO CENTRALIZADO DE MODAIS COM FIRESTORE
   ========================================================================= */

import { showToast, criarCardVisitaElemento, filtrarCardsVitrine } from "./main.js";
import { db } from "./firebaseConfig.js";
import { doc, getDocs, setDoc, deleteDoc, collection, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// --- 1. SELEÇÃO DOS MODAIS E BOTÕES DE FECHAR ---
export const authModal = document.getElementById("authModal");
export const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");

export const dashboardModal = document.getElementById("dashboardModal");
export const closeDashboardModalBtn = document.getElementById("closeDashboardModalBtn");

export const publishModal = document.getElementById("publishModal");
export const closePublishModalBtn = document.getElementById("closePublishModalBtn");

export const cartaoModal = document.getElementById("cartaoModal");
export const closeCartaoModalBtn = document.getElementById("closeCartaoModalBtn");

// --- 2. ELEMENTOS DO MODAL PAINEL (DASHBOARD) ---
const dashUserName = document.getElementById("dashUserName");
const dashUserEmail = document.getElementById("dashUserEmail");
const dashUserAvatar = document.getElementById("dashUserAvatar");
const dashCardViewBlock = document.getElementById("dashCardViewBlock");
const dashNoCardBlock = document.getElementById("dashNoCardBlock");
const btnToggleStatus = document.getElementById("btnToggleStatus");
const toggleStatusLabel = document.getElementById("toggleStatusLabel");
const btnEditarMeuCartao = document.getElementById("btnEditarMeuCartao");
const btnExcluirMeuCartao = document.getElementById("btnExcluirMeuCartao");
const btnCriarPrimeiroCartao = document.getElementById("btnCriarPrimeiroCartao");

// --- 3. ELEMENTOS DO MODAL FORMULÁRIO (CRIAÇÃO / EDIÇÃO) ---
const publishForm = document.getElementById("publishForm");
const formModalTitle = document.getElementById("formModalTitle");
const formModalSub = document.getElementById("formModalSub");
const fotoInput = document.getElementById("fotoInput");
const uploadPreviewImg = document.getElementById("uploadPreviewImg");
const uploadPlaceholderIcon = document.getElementById("uploadPlaceholderIcon");
const telefoneInput = document.getElementById("telefoneInput");
const experienciaInput = document.getElementById("experienciaInput");

// Garante o prefixo fixo ao focar no campo
telefoneInput?.addEventListener("focus", (e) => {
  if (!e.target.value) {
    e.target.value = "(61) ";
  }
});

// Se o usuário sair sem digitar nada além do prefixo, limpa o campo
telefoneInput?.addEventListener("blur", (e) => {
  if (e.target.value === "(61) ") {
    e.target.value = "";
  }
});

// Máscara com o 61 travado à mostra
telefoneInput?.addEventListener("input", (e) => {
  let nums = e.target.value.replace(/\D/g, "");

  if (nums.startsWith("61")) {
    nums = nums.slice(2);
  }

  nums = nums.slice(0, 9);

  if (nums.length === 0) {
    e.target.value = "(61) ";
    return;
  }

  if (nums.length <= 5) {
    e.target.value = `(61) ${nums}`;
  } else {
    e.target.value = `(61) ${nums.slice(0, 5)}-${nums.slice(5)}`;
  }
});

experienciaInput?.addEventListener("input", (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 2) val = val.slice(0, 2);
  if (Number(val) > 50) val = "50";
  e.target.value = val;
});

// --- FUNÇÃO BASE UNIVERSAL ---
export function toggleModal(modalElement, isOpen) {
  if (!modalElement) return;
  modalElement.classList.toggle("open", isOpen);
  const algumModalAberto = document.querySelector(".modal-overlay.open");
  document.body.style.overflow = algumModalAberto ? "hidden" : "";
}

export function toggleAuthModal(isOpen) {
  toggleModal(authModal, isOpen);
}

export function toggleDashboardModal(isOpen) {
  toggleModal(dashboardModal, isOpen);
}

export function togglePublishModal(isOpen) {
  toggleModal(publishModal, isOpen);
}

export function toggleCartaoModal(isOpen) {
  toggleModal(cartaoModal, isOpen);
}

// --- AUXILIARES DO USUÁRIO E CARTÃO (FIRESTORE) ---
export function getUsuarioLogado() {
  const dados = localStorage.getItem("profissionaisDF_usuario");
  return dados ? JSON.parse(dados) : null;
}

export async function getMeuCartao() {
  const usuario = getUsuarioLogado();
  if (!usuario || !usuario.uid) return null;
  try {
    const q = query(collection(db, "cartoes"), where("uid", "==", usuario.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar cartão:", error);
    return null;
  }
}

// --- LÓGICA DO MODAL PAINEL DO USUÁRIO ---
const dashStatusBadge = document.getElementById("dashStatusBadge");
const dashStatusBadgeIcon = document.getElementById("dashStatusBadgeIcon");
const dashStatusBadgeText = document.getElementById("dashStatusBadgeText");
const dashCardPreviewSlot = document.getElementById("dashCardPreviewSlot");

export async function abrirPainelUsuario() {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    toggleAuthModal(true);
    return;
  }

  if (dashUserName) dashUserName.textContent = usuario.nome;
  if (dashUserEmail) dashUserEmail.textContent = usuario.email;
  if (dashUserAvatar) dashUserAvatar.src = usuario.foto;

  const meuCartao = await getMeuCartao();

  if (meuCartao) {
    if (dashCardViewBlock) dashCardViewBlock.style.display = "block";
    if (dashNoCardBlock) dashNoCardBlock.style.display = "none";

    const isPublicado = meuCartao.status === "publicado";

    if (dashStatusBadge) {
      dashStatusBadge.className = isPublicado ? "status-badge published" : "status-badge paused";
    }
    if (dashStatusBadgeIcon) {
      dashStatusBadgeIcon.className = isPublicado ? "bi bi-check-circle-fill" : "bi bi-pause-circle-fill";
    }
    if (dashStatusBadgeText) {
      dashStatusBadgeText.textContent = isPublicado ? "Publicado na Vitrine" : "Cartão Pausado (Oculto)";
    }

    if (dashCardPreviewSlot) {
      dashCardPreviewSlot.replaceChildren(criarCardVisitaElemento(meuCartao));
    }

    if (isPublicado) {
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

// Alternar Status do Cartao no Firestore / firebase
btnExcluirMeuCartao?.addEventListener("click", async () => {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const cartaoExistente = await getMeuCartao();
  if (!cartaoExistente) return;

  if (confirm("Tem certeza que deseja excluir seu cartão de visita?")) {
    try {
      await deleteDoc(doc(db, "cartoes", cartaoExistente.id));
      showToast("Cartão excluído com sucesso.");
      await abrirPainelUsuario();
      await filtrarCardsVitrine(true);
    } catch (err) {
      showToast("Erro ao excluir o cartão.");
    }
  }
});

// Excluir Cartão do Firestore
btnExcluirMeuCartao?.addEventListener("click", async () => {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  if (confirm("Tem certeza que deseja excluir seu cartão de visita?")) {
    try {
      await deleteDoc(doc(db, "cartoes", usuario.uid));
      showToast("Cartão excluído com sucesso.");
      await abrirPainelUsuario();
      await filtrarCardsVitrine(true);
    } catch (err) {
      showToast("Erro ao excluir o cartão.");
    }
  }
});

// --- LÓGICA DO FORMULÁRIO DO CARTÃO ---
export async function prepararFormularioCartao() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const meuCartao = await getMeuCartao();
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
    document.getElementById("telefoneInput").value = meuCartao.telefone || "";
    document.getElementById("instagramInput").value = meuCartao.instagram || "";
    document.getElementById("linkedinInput").value = meuCartao.linkedin || "";
    document.getElementById("bioInput").value = meuCartao.bio || "";
    document.getElementById("cidadeInput").value = meuCartao.cidade || "";

    const profValor = meuCartao.profissao || "";
    const inputProf = document.getElementById("profissaoInput");
    if (inputProf) {
      inputProf.value = profValor;
      inputProf.rows = profValor ? profValor.split("\n").length : 1;
    }

    const fotoExibir = meuCartao.fotoUrl || usuario.foto || "";
    if (uploadPreviewImg && fotoExibir) {
      uploadPreviewImg.src = fotoExibir;
      uploadPreviewImg.style.display = "block";
    }
    if (uploadPlaceholderIcon) {
      uploadPlaceholderIcon.style.display = fotoExibir ? "none" : "block";
    }
  } else {
    if (formModalTitle) formModalTitle.textContent = "Criar Meu Cartão";
    if (formModalSub) formModalSub.textContent = "Preencha seus dados para publicar seu cartão no DF.";

    document.getElementById("nomeInput").value = usuario.nome || "";
    document.getElementById("profissaoInput").value = "";

    const fotoGoogle = usuario.foto || "";
    if (uploadPreviewImg && fotoGoogle) {
      uploadPreviewImg.src = fotoGoogle;
      uploadPreviewImg.style.display = "block";
    }
    if (uploadPlaceholderIcon) {
      uploadPlaceholderIcon.style.display = fotoGoogle ? "none" : "block";
    }
  }

  // Sincroniza os botões visuais das profissões selecionadas
  const listaSalva = (document.getElementById("profissaoInput")?.value || "")
    .split("\n")
    .map((p) => p.trim());
  document.querySelectorAll("#profissaoListWrapper .city-option").forEach((btn) => {
    btn.classList.toggle("selected", listaSalva.includes(btn.textContent.trim()));
  });

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

publishForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const fotoArquivo = document.getElementById("fotoInput").files[0];
  const nome = document.getElementById("nomeInput").value.trim();
  const experiencia = document.getElementById("experienciaInput").value.trim();
  const cnh = document.getElementById("cnhInput")?.value.trim() || "";
  const cidade = document.getElementById("cidadeInput").value.trim();
  const profissao = document.getElementById("profissaoInput")?.value.trim() || "";
  const bio = document.getElementById("bioInput")?.value.trim() || "";
  const email = usuario.email;
  const telefone = document.getElementById("telefoneInput").value.trim();
  const instagram = document.getElementById("instagramInput")?.value.trim() || "";
  const linkedin = document.getElementById("linkedinInput")?.value.trim() || "";

  if (!profissao) {
    showToast("Por favor, selecione ao menos uma profissão.");
    return;
  }

  const expNum = Number(experiencia);
  if (isNaN(expNum) || expNum < 0 || expNum > 50) {
    showToast("Informe um tempo de experiência válido entre 0 e 50 anos.");
    experienciaInput?.focus();
    return;
  }

  const cartaoExistente = await getMeuCartao();

  const fotoPadraoDisponivel = cartaoExistente?.fotoUrl || usuario.foto;
  if (!fotoArquivo && !fotoPadraoDisponivel) {
    showToast("Por favor, selecione uma foto para o seu cartão.");
    return;
  }

  const numerosTelefone = telefone.replace(/\D/g, "");
  if (numerosTelefone.length !== 11 || !numerosTelefone.startsWith("61")) {
    showToast("Digite os 11 dígitos do seu telefone do DF começando com 61 9.");
    telefoneInput?.focus();
    return;
  }

 const salvarCardFinal = async (fotoUrlFinal) => {
    // Limpa caracteres especiais do nome para gerar um ID limpo
    const nomeLimpo = nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 20);

    // Obtém os últimos 6 caracteres do UID
    const sufixoUid = usuario.uid.slice(-6);

    // Formato final do ID: Nome_Sobrenome_Ultimos6Digitos
    const novoDocId = `${nomeLimpo}_${sufixoUid}`;
    const docIdFinal = cartaoExistente ? cartaoExistente.id : novoDocId;

    const dadosCard = {
      uid: usuario.uid,
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
      status: cartaoExistente ? cartaoExistente.status : "publicado",
      atualizadoEm: new Date().toISOString()
    };

    try {
      // Se for uma edição e o nome tiver mudado, remove o registo com o ID antigo
      if (cartaoExistente && cartaoExistente.id !== novoDocId) {
        await deleteDoc(doc(db, "cartoes", cartaoExistente.id));
      }

      await setDoc(doc(db, "cartoes", novoDocId), dadosCard, { merge: true });
      showToast(cartaoExistente ? "Cartão atualizado com sucesso!" : "Cartão criado e publicado na vitrine!");
      togglePublishModal(false);
      await abrirPainelUsuario();
      await filtrarCardsVitrine(true);
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
      showToast("Erro ao salvar no banco de dados.");
    }
  };

  if (fotoArquivo) {
    redimensionarFoto(fotoArquivo, (novaFotoUrl) => {
      salvarCardFinal(novaFotoUrl);
    });
  } else {
    const fotoFinal = cartaoExistente?.fotoUrl || usuario.foto || "";
    salvarCardFinal(fotoFinal);
  }
});

// --- LÓGICA DO MODAL DETALHES DO CARTÃO (PÚBLICO) ---
export function abrirModalDetalhesCartao(btn) {
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
  document.getElementById("modalCidade").textContent = cidade;

  const profissoesArray = profissao
    ? profissao.split("\n").map((p) => p.trim()).filter(Boolean)
    : [];
  const linha1 = document.getElementById("modalProfissaoLinha1");
  const linha2 = document.getElementById("modalProfissaoLinha2");
  const linha3 = document.getElementById("modalProfissaoLinha3");

  const texto1 = document.getElementById("modalProfissao1");
  const texto2 = document.getElementById("modalProfissao2");
  const texto3 = document.getElementById("modalProfissao3");

  if (linha1 && texto1) {
    texto1.textContent = profissoesArray[0] || profissao;
    linha1.style.display = profissoesArray[0] || profissao ? "flex" : "none";
  }

  if (linha2 && texto2) {
    texto2.textContent = profissoesArray[1] || "";
    linha2.style.display = profissoesArray[1] ? "flex" : "none";
  }

  if (linha3 && texto3) {
    texto3.textContent = profissoesArray[2] || "";
    linha3.style.display = profissoesArray[2] ? "flex" : "none";
  }

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
}

// Inicializa todos os ouvintes de fechamento
export function initModalListeners() {
  const modais = [
    { modal: authModal, closeBtn: closeAuthModalBtn },
    { modal: dashboardModal, closeBtn: closeDashboardModalBtn },
    { modal: publishModal, closeBtn: closePublishModalBtn },
    { modal: cartaoModal, closeBtn: closeCartaoModalBtn }
  ];

  modais.forEach(({ modal, closeBtn }) => {
    if (!modal) return;
    closeBtn?.addEventListener("click", () => toggleModal(modal, false));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) toggleModal(modal, false);
    });
  });
}