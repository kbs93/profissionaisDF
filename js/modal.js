/* =========================================================================
   MODAL CONTROLLER - GERENCIAMENTO CENTRALIZADO DE MODAIS
   ========================================================================= */

// Seleção dos elementos do DOM
export const authModal = document.getElementById("authModal");
export const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");

export const dashboardModal = document.getElementById("dashboardModal");
export const closeDashboardModalBtn = document.getElementById("closeDashboardModalBtn");

export const publishModal = document.getElementById("publishModal");
export const closePublishModalBtn = document.getElementById("closePublishModalBtn");

export const cartaoModal = document.getElementById("cartaoModal");
export const closeCartaoModalBtn = document.getElementById("closeCartaoModalBtn");

// Função base universal para abrir/fechar qualquer modal
export function toggleModal(modalElement, isOpen) {
  if (!modalElement) return;
  modalElement.classList.toggle("open", isOpen);

  // Mantém a trava de rolagem no body se houver pelo menos um modal aberto
  const algumModalAberto = document.querySelector(".modal-overlay.open");
  document.body.style.overflow = algumModalAberto ? "hidden" : "";
}

// Métodos específicos exportados para o main.js
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

// Inicializa todos os ouvintes de fechamento (Botão 'X' e clique fora na máscara)
export function initModalListeners() {
  const modais = [
    { modal: authModal, closeBtn: closeAuthModalBtn },
    { modal: dashboardModal, closeBtn: closeDashboardModalBtn },
    { modal: publishModal, closeBtn: closePublishModalBtn },
    { modal: cartaoModal, closeBtn: closeCartaoModalBtn }
  ];

  modais.forEach(({ modal, closeBtn }) => {
    if (!modal) return;

    // Fechar ao clicar no botão 'X'
    closeBtn?.addEventListener("click", () => toggleModal(modal, false));

    // Fechar ao clicar no fundo escuro (backdrop)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) toggleModal(modal, false);
    });
  });
}