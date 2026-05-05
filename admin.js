const teachers = [
  "徐蕙美", "謝英玲", "沈佩芳", "蔡瓊慧", "楊從玓", "楊兆琪", "蘇靖閔", "方盈予",
  "陳祈宏", "潘佳玲", "吳宜津", "曾鈺臻", "莊美雅", "林怡伶", "劉佩怡", "吳玲玲",
  "粘依婷", "鄭琇穗", "牟嘉瑩", "呂倩如", "林怡君", "吳沛珊", "陳鈺雯", "陳怜蓁",
  "徐靜敏", "林亮均", "張瑜珊", "倪晨茹", "蔡昀倢", "邱筠芝", "韓家柔"
];

const groups = [
  {
    title: "行政與一至三年級",
    jobs: [
      ["教務主任", "羅元希"], ["教學組長", "高于婷"], ["註冊組長", "吳雅齡"], ["設備組長", "鄭雅心"], ["資訊組長", "周向麟"],
      ["學務主任", "邱華鑫"], ["生教組長", "蔡松峰"], ["訓育組長", "蔣仲昂"], ["體育組長", "翁鈺婷"], ["衛生組長", "孫錦梅"],
      ["總務主任", "鄭博文"], ["輔導主任", "林妍伶"], ["輔導組長", "柯懷淨"], ["特教組長", "許美玲"], ["資料組長", "黃舒榆"],
      ["11導師", ""], ["12導師", ""], ["13導師", ""], ["14導師", ""], ["15導師", ""],
      ["21導師", "馬嘉鴻"], ["22導師", "洪玉卿"], ["23導師", "梁芳庭"], ["24導師", "簡心慧"], ["25導師", "藍梅瑛"],
      ["31導師", ""], ["32導師", ""], ["33導師", ""], ["34導師", ""], ["35導師", ""]
    ]
  },
  {
    title: "四至六年級與科任",
    jobs: [
      ["41導師", "卓享意"], ["42導師", "陳芸安"], ["43導師", "郭少芸"], ["44導師", "王廷嘉"], ["45導師", "黃芷寧"], ["46導師", "林智賢"], ["47導師", ""],
      ["51導師", ""], ["52導師", ""], ["53導師", ""], ["54導師", ""], ["55導師", ""], ["56導師", ""], ["57導師", ""],
      ["61導師", "孟繁迪"], ["62導師", "梁昕卉"], ["63導師", "胡正仁"], ["64導師", "張庭嘉"], ["65導師", ""], ["66導師", "陳凱筌"],
      ["系管師", "楊明祥"], ["自然科任 1", ""], ["自然科任 2", ""], ["自然科任 3", ""],
      ["英語科任 1", ""], ["英語科任 2", ""], ["英語科任 3", ""], ["英語科任 4", ""], ["英語科任 5", ""], ["自然科任 4", ""]
    ]
  },
  {
    title: "藝能、專輔與資源班",
    jobs: [
      ["音樂科任 1", ""], ["音樂科任 2", ""], ["體育科任 1", ""], ["體育科任 2", ""], ["體育科任 3", ""],
      ["社會科任", ""], ["美勞科任", ""], ["專輔教師 1", "林宜姍"], ["專輔教師 2", "黃怡嫣"],
      ["資源班 1", "吳佩雯"], ["資源班 2", "邱秋君"], ["資源班 3", "", { unavailable: true }], ["資源班 4", "潘淑姿"], ["資源班 5", "王涓"], ["資源班 6", "王文伶"]
    ]
  }
];

const STORAGE_KEY = "lixing-115-job-board";
const CHANNEL_KEY = "lixing-115-job-board-updates";
const updateChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_KEY) : null;
const originalJobs = groups.flatMap((group, groupIndex) =>
  group.jobs.map(([title, name, options = {}], jobIndex) => ({
    id: `${groupIndex}-${jobIndex}`,
    group: group.title,
    title,
    name,
    locked: Boolean(name),
    unavailable: Boolean(options.unavailable),
    custom: false,
    deleted: false,
    order: groupIndex * 1000 + jobIndex
  }))
);

let jobs = loadJobs();
let remoteRef = null;
let remoteReady = false;

const adminRows = document.querySelector("#adminRows");
const adminStatus = document.querySelector("#adminStatus");
const newGroup = document.querySelector("#newGroup");
const newTitle = document.querySelector("#newTitle");
const newName = document.querySelector("#newName");
const newSelectable = document.querySelector("#newSelectable");
const addJobForm = document.querySelector("#addJobForm");
const saveAllButton = document.querySelector("#saveAllButton");
const reloadButton = document.querySelector("#reloadButton");
const resetDefaultButton = document.querySelector("#resetDefaultButton");
const teacherNames = document.querySelector("#teacherNames");

function loadJobs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(originalJobs);
  try {
    const parsed = JSON.parse(saved);
    const originalIds = new Set(originalJobs.map((job) => job.id));
    const mergedOriginals = originalJobs
      .map((job) => ({ ...job, ...(parsed[job.id] || {}) }))
      .filter((job) => !job.deleted);
    const customJobs = Object.entries(parsed)
      .filter(([id, value]) => !originalIds.has(id) && value && typeof value === "object" && value.custom && !value.deleted)
      .map(([id, value]) => ({
        id,
        group: value.group || "其他",
        title: value.title || "未命名職務",
        name: value.name || "",
        locked: Boolean(value.locked && value.name),
        unavailable: Boolean(value.unavailable),
        custom: true,
        deleted: false,
        order: Number(value.order) || Date.now()
      }));
    return [...mergedOriginals, ...customJobs].sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return structuredClone(originalJobs);
  }
}

function serializeJobs() {
  const existing = getStoredPayload();
  const payload = Object.fromEntries(Object.entries(existing).filter(([, value]) => value?.deleted));
  jobs.forEach((job) => {
    payload[job.id] = {
      group: job.group,
      title: job.title,
      name: job.name,
      locked: Boolean(job.locked && job.name),
      unavailable: Boolean(job.unavailable),
      custom: Boolean(job.custom),
      deleted: Boolean(job.deleted),
      order: job.order || 0
    };
  });
  return payload;
}

function getStoredPayload() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveJobs() {
  const payload = serializeJobs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  updateChannel?.postMessage({ type: "jobs-updated", savedAt: Date.now() });
  if (remoteReady) {
    remoteRef.set(payload).catch((error) => console.warn("Firebase publish failed:", error));
  }
  adminStatus.textContent = `已儲存：${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function render() {
  populateGroups();
  adminRows.innerHTML = "";
  jobs.forEach((job) => {
    const row = document.createElement("tr");
    row.dataset.id = job.id;
    row.innerHTML = `
      <td><input class="group-input" type="text" value="${escapeAttribute(job.group)}" /></td>
      <td><input class="title-input" type="text" value="${escapeAttribute(job.title)}" /></td>
      <td><input class="name-input" type="text" value="${escapeAttribute(job.name)}" list="teacherNames" /></td>
      <td><input class="locked-input" type="checkbox" ${job.locked ? "checked" : ""} /></td>
      <td><input class="selectable-input" type="checkbox" ${job.unavailable ? "" : "checked"} /></td>
      <td><button class="danger-button compact-button delete-job" type="button">刪除</button></td>
    `;
    adminRows.appendChild(row);
  });
  adminStatus.textContent = "可編輯後按「儲存變更」";
}

function collectRows() {
  adminRows.querySelectorAll("tr").forEach((row) => {
    const job = jobs.find((item) => item.id === row.dataset.id);
    if (!job) return;
    job.group = row.querySelector(".group-input").value.trim() || "其他";
    job.title = row.querySelector(".title-input").value.trim() || "未命名職務";
    job.name = row.querySelector(".name-input").value.trim();
    job.locked = row.querySelector(".locked-input").checked && Boolean(job.name);
    job.unavailable = !row.querySelector(".selectable-input").checked;
  });
}

function populateGroups() {
  const groupTitles = [...new Set([...groups.map((group) => group.title), ...jobs.map((job) => job.group)])];
  newGroup.innerHTML = groupTitles.map((title) => `<option value="${escapeAttribute(title)}">${title}</option>`).join("");
  teacherNames.innerHTML = teachers.map((name) => `<option value="${escapeAttribute(name)}"></option>`).join("");
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isFirebaseConfigured() {
  const config = window.LIXING_FIREBASE_CONFIG;
  return Boolean(config?.apiKey && config?.databaseURL && window.firebase?.database);
}

function initRemoteSync() {
  if (!isFirebaseConfigured()) return;
  try {
    firebase.apps.length ? firebase.app() : firebase.initializeApp(window.LIXING_FIREBASE_CONFIG);
    remoteRef = firebase.database().ref(window.LIXING_DATABASE_PATH || "boards/lixing-115/jobs");
    remoteReady = true;
    remoteRef.on("value", (snapshot) => {
      const remotePayload = snapshot.val();
      if (!remotePayload) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remotePayload));
      jobs = loadJobs();
      render();
    });
  } catch (error) {
    console.warn("Firebase sync unavailable:", error);
  }
}

addJobForm.addEventListener("submit", (event) => {
  event.preventDefault();
  collectRows();
  jobs.push({
    id: `custom-${Date.now()}`,
    group: newGroup.value,
    title: newTitle.value.trim(),
    name: newName.value.trim(),
    locked: Boolean(newName.value.trim()),
    unavailable: !newSelectable.checked,
    custom: true,
    deleted: false,
    order: Date.now()
  });
  newTitle.value = "";
  newName.value = "";
  newSelectable.checked = true;
  saveJobs();
  jobs = loadJobs();
  render();
});

adminRows.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-job")) return;
  collectRows();
  const row = event.target.closest("tr");
  const job = jobs.find((item) => item.id === row.dataset.id);
  if (!job) return;
  if (!confirm(`確定刪除「${job.title}」這個名額？`)) return;
  job.deleted = true;
  saveJobs();
  jobs = loadJobs();
  render();
});

saveAllButton.addEventListener("click", () => {
  collectRows();
  saveJobs();
  jobs = loadJobs();
  render();
});

reloadButton.addEventListener("click", () => {
  jobs = loadJobs();
  render();
});

resetDefaultButton.addEventListener("click", () => {
  if (!confirm("確定還原預設名額？這會清除新增名額與手動修改。")) return;
  jobs = structuredClone(originalJobs);
  localStorage.removeItem(STORAGE_KEY);
  saveJobs();
  render();
});

initRemoteSync();
render();
