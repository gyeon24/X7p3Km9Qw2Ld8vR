const SECRET_HASH = "bf5af61f788f718da34d404f5f3f127cce5140beef2b7662a9bd9955b6908002";
const ACCESS_KEY = "lifeSpikeAccessGranted";

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

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

async function handleLogin(event) {
  event.preventDefault();
  const input = document.getElementById("password");
  const password = input.value;

  if (!password) {
    showLoginMessage("비밀번호를 입력해 주세요.");
    return;
  }

  const hash = await sha256(password);
  if (hash !== SECRET_HASH) {
    showLoginMessage("비밀번호가 맞지 않습니다.");
    input.select();
    return;
  }

  sessionStorage.setItem(ACCESS_KEY, "true");
  window.location.replace("secret.html");
}

function initLogin() {
  if (hasAccess()) {
    window.location.replace("secret.html");
    return;
  }

  const form = document.getElementById("password-form");
  if (form) form.addEventListener("submit", handleLogin);
}

function protectSecret() {
  if (!hasAccess()) window.location.replace("index.html");
}

if (document.body.dataset.page === "login") initLogin();
if (document.body.dataset.page === "secret") protectSecret();
