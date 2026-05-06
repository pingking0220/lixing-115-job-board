(() => {
  const PASSWORD = "力行國小哈哈哈";
  const SESSION_KEY = "lixing-115-admin-auth";

  if (sessionStorage.getItem(SESSION_KEY) === "ok") return;

  const input = window.prompt("請輸入管理密碼");
  if (input === PASSWORD) {
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
