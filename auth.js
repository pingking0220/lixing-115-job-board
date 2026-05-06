(() => {
  const DEFAULT_PASSWORD = "力行國小哈哈哈";
  const FALLBACK_PASSWORD = "lsps115";
  const PASSWORD_KEY = "lixing-115-admin-password";
  const SESSION_KEY = "lixing-115-admin-auth";

  function getPassword() {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  }

  function normalizePassword(value) {
    return String(value ?? "").normalize("NFKC").trim();
  }

  function isPasswordValid(value) {
    const normalized = normalizePassword(value);
    return normalized === normalizePassword(getPassword()) || normalized === FALLBACK_PASSWORD;
  }

  function changePassword() {
    const current = window.prompt("請輸入目前密碼");
    if (!isPasswordValid(current)) {
      window.alert("目前密碼錯誤，未修改。");
      return false;
    }

    const next = normalizePassword(window.prompt("請輸入新密碼"));
    if (!next) {
      window.alert("新密碼不可空白。");
      return false;
    }

    const confirmNext = normalizePassword(window.prompt("請再次輸入新密碼"));
    if (next !== confirmNext) {
      window.alert("兩次輸入不一致，未修改。");
      return false;
    }

    localStorage.setItem(PASSWORD_KEY, next);
    sessionStorage.setItem(SESSION_KEY, "ok");
    window.alert("密碼已修改。");
    return true;
  }

  window.LIXING_AUTH = {
    changePassword,
    resetPasswordForThisBrowser: () => {
      localStorage.removeItem(PASSWORD_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  document.addEventListener("click", (event) => {
    if (event.target?.id !== "changePasswordButton") return;
    changePassword();
  });

  if (sessionStorage.getItem(SESSION_KEY) === "ok") return;

  const input = window.prompt("請輸入管理密碼");
  if (isPasswordValid(input)) {
    sessionStorage.setItem(SESSION_KEY, "ok");
    return;
  }

  document.body.innerHTML = `
    <main class="access-denied">
      <h1>無法進入</h1>
      <p>密碼錯誤，請重新整理後再輸入。</p>
      <a class="ghost-link" href="./viewer.html">前往觀看版</a>
    </main>
  `;
  throw new Error("Unauthorized");
})();
