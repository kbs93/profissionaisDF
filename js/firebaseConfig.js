/* =========================================================================
   FIREBASE CONFIGURATION & INITIALIZATION
   ========================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAigW4B605VjE5uCVEJGkvv9CQlTxR3Bvw",
  authDomain: "profissionaisdf1.firebaseapp.com",
  projectId: "profissionaisdf1",
  storageBucket: "profissionaisdf1.firebasestorage.app",
  messagingSenderId: "891560274248",
  appId: "1:891560274248:web:9accc9c1d92d8b480bab7d"
};

// Inicializa a aplicação
export const app = initializeApp(firebaseConfig);

// Inicializa o serviço de autenticação e o provedor Google
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();