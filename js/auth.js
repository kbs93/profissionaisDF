/* =========================================================================
   AUTH SERVICE - MÓDULO DE AUTENTICAÇÃO COM GOOGLE
   ========================================================================= */
import { auth, googleProvider } from "./firebaseConfig.js";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Função para abrir o popup de login com Google
export async function loginComGoogle() {
  try {
    const resultado = await signInWithPopup(auth, googleProvider);
    const user = resultado.user;
    return {
      nome: user.displayName,
      email: user.email,
      foto: user.photoURL,
      uid: user.uid
    };
  } catch (erro) {
    console.error("Erro ao autenticar com o Google:", erro);
    throw erro;
  }
}

// Função para encerrar a sessão
export async function logoutUsuario() {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error("Erro ao sair da conta:", erro);
    throw erro;
  }
}

// Observador de estado de autenticação em tempo real
export function vigiarSessao(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        nome: user.displayName,
        email: user.email,
        foto: user.photoURL,
        uid: user.uid
      });
    } else {
      callback(null);
    }
  });
}