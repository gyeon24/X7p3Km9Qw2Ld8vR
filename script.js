import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
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
  "42thgoldenleaf@gmail.com",
  "rosesunny91@gmail.com",
  "leejiwon8090@gmail.com"
];

const ACCESS_KEY = "lifeSpikeAccessGranted";
const isPlaceholderConfig = Object.values(firebaseConfig).some(value => value.includes("여기에"));
const app = isPlaceholderConfig ? null : initializeApp(firebaseConfig);
const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();

function hasAccess() {
  try {
    return sessionStorage.getItem(ACCESS_KEY) === "true" || localStorage.getItem(ACCESS_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function saveAccess() {
  try {
    sessionStorage.setItem(ACCESS_KEY, "true");
    localStorage.setItem(ACCESS_KEY, "true");
  } catch (error) {
    console.error("Unable to save login state:", error);
  }
}

function showLoginMessage(message) {
  const messageElement = document.getElementById("login-message");
  if (messageElement) messageElement.textContent = message;
}

function showAuthError(error) {
  const code = error?.code || "unknown-error";
  const messages = {
    "auth/unauthorized-domain": "Firebase에 이 사이트 도메인이 등록되지 않았습니다.",
    "auth/popup-blocked": "팝업이 차단되어 Safari에서 다시 시도해 주세요.",
    "auth/popup-closed-by-user": "Google 로그인 창이 닫혔습니다.",
    "auth/operation-not-supported-in-this-environment": "텔레그램 브라우저에서는 지원되지 않습니다. Safari에서 열어 주세요.",
    "auth/network-request-failed": "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요."
  };
  showLoginMessage(`${messages[code] || "Google 로그인에 실패했습니다."} [${code}]`);
  console.error("Firebase authentication error:", error);
}

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function finishLogin(result) {
  if (!result || !result.user) return;

  const email = (result.user.email || "").trim().toLowerCase();
  const normalizedAllowedUsers = allowedUsers.map(value => value.trim().toLowerCase());

  if (!normalizedAllowedUsers.includes(email)) {
    showLoginMessage("허용되지 않은 Google 계정입니다.");
    await signOut(auth);
    return;
  }

  saveAccess();
  window.location.replace("secret.html");
}

async function handleGoogleLogin() {
  if (!auth) {
    showLoginMessage("Firebase 웹 설정을 먼저 입력해 주세요.");
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    if (isMobileBrowser()) {
      await signInWithRedirect(auth, provider);
    } else {
      await finishLogin(await signInWithPopup(auth, provider));
    }
  } catch (error) {
    if (error.code === "auth/popup-blocked" || error.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return;
    }
    showAuthError(error);
  }
}

async function initLogin() {
  if (hasAccess()) {
    window.location.replace("secret.html");
    return;
  }

  if (auth) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await finishLogin(await getRedirectResult(auth));
    } catch (error) {
      showAuthError(error);
    }
  }

  const button = document.getElementById("google-login");
  if (button) button.addEventListener("click", handleGoogleLogin);
}

async function protectSecret() {
  if (hasAccess()) return;
  if (!auth) {
    window.location.replace("index.html");
    return;
  }

  await setPersistence(auth, browserLocalPersistence);
  const currentUser = await new Promise(resolve => {
    let settled = false;
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(user);
    });
  });

  if (currentUser) {
    const email = (currentUser.email || "").trim().toLowerCase();
    const normalizedAllowedUsers = allowedUsers.map(value => value.trim().toLowerCase());
    if (normalizedAllowedUsers.includes(email)) {
      saveAccess();
      return;
    }
  }

  window.location.replace("index.html");
}

if (document.body.dataset.page === "login") initLogin();
if (document.body.dataset.page === "secret") protectSecret();
