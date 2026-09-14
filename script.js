import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBK7BTggvKhVqlJJn0eP7dyqejq8g3vCEU",
    authDomain: "life-f3119.firebaseapp.com",
    projectId: "life-f3119",
    storageBucket: "life-f3119.firebasestorage.app",
    messagingSenderId: "214892394679",
    appId: "1:214892394679:web:77691f030b4b3f3e313532"
};

const allowedUsers = [
  "42thgoldenleaf@gmail.com"
];

const ACCESS_KEY = "lifeSpikeAccessGranted";
const isPlaceholderConfig = Object.values(firebaseConfig).some(value => value.includes("여기에"));
const app = isPlaceholderConfig ? null : initializeApp(firebaseConfig);
const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();

function hasAccess() {
  try {
    return sessionStorage.getItem(ACCESS_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function showLoginMessage(message) {
  const messageElement = document.getElementById("login-message");
  if (messageElement) messageElement.textContent = message;
}

async function handleGoogleLogin() {
  if (!auth) {
    showLoginMessage("Firebase 웹 설정을 먼저 입력해 주세요.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const email = (result.user.email || "").trim().toLowerCase();

    const normalizedAllowedUsers = allowedUsers.map(value => value.trim().toLowerCase());
    if (!normalizedAllowedUsers.includes(email)) {
      showLoginMessage("허용되지 않은 Google 계정입니다.");
      await signOut(auth);
      return;
    }

    sessionStorage.setItem(ACCESS_KEY, "true");
    window.location.replace("secret.html");
  } catch (error) {
    showLoginMessage("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
    console.error(error);
  }
}

function initLogin() {
  if (hasAccess()) {
    window.location.replace("secret.html");
    return;
  }

  const button = document.getElementById("google-login");
  if (button) button.addEventListener("click", handleGoogleLogin);
}

function protectSecret() {
  if (!hasAccess()) window.location.replace("index.html");
}

if (document.body.dataset.page === "login") initLogin();
if (document.body.dataset.page === "secret") protectSecret();
