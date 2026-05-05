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
      ["英語科任 1", ""], ["英語科任 2", ""], ["英語科任 3", ""], ["英語科任 4", ""], ["英語科任 5", ""]
    ]
  },
  {
    title: "藝能、專輔與資源班",
    jobs: [
      ["音樂科任 1", ""], ["音樂科任 2", ""], ["體育科任 1", ""], ["體育科任 2", ""], ["體育科任 3", ""],
      ["社會科任", ""], ["美勞科任", ""], ["專輔教師 1", "林宜姍"], ["專輔教師 2", "黃怡嫣"],
      ["資源班 1", "吳佩雯"], ["資源班 2", "邱秋君"], ["資源班 3", ""], ["資源班 4", "潘淑姿"], ["資源班 5", "王涓"], ["資源班 6", "王文伶"]
    ]
  }
];

const teacherPoints = {
  徐蕙美: 73,
  謝英玲: 68,
  沈佩芳: 64,
  蔡瓊慧: 56,
  楊從玓: 52,
  楊兆琪: 52,
  蘇靖閔: 48,
  方盈予: 46,
  陳祈宏: 45,
  潘佳玲: 41,
  吳宜津: 40,
  曾鈺臻: 40,
  莊美雅: 38,
  林怡伶: 35,
  劉佩怡: 35,
  吳玲玲: 35,
  粘依婷: 34.25,
  鄭琇穗: 34,
  牟嘉瑩: 34,
  呂倩如: 33,
  林怡君: 31.5,
  吳沛珊: 31.35,
  陳鈺雯: 31,
  陳怜蓁: 30.83,
  徐靜敏: 26,
  林亮均: 26,
  張瑜珊: 24,
  倪晨茹: 21.33,
  蔡昀倢: 20.83,
  邱筠芝: 20.5,
  韓家柔: 12
};

const STORAGE_KEY = "lixing-115-job-board";
const CHANNEL_KEY = "lixing-115-job-board-updates";
const updateChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_KEY) : null;
const remoteSync = {
  ref: null,
  ready: false
};
const originalJobs = groups.flatMap((group, groupIndex) =>
  group.jobs.map(([title, name], jobIndex) => ({
    id: `${groupIndex}-${jobIndex}`,
    group: group.title,
    title,
    name,
    locked: Boolean(name)
  }))
);

const viewerBoard = document.querySelector("#viewerBoard");
const pickedCount = document.querySelector("#pickedCount");
const openCount = document.querySelector("#openCount");
const lastUpdated = document.querySelector("#lastUpdated");
let lastPayload = "";

function loadJobs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(originalJobs);
  try {
    const parsed = JSON.parse(saved);
    return originalJobs.map((job) => ({ ...job, ...(parsed[job.id] || {}) }));
  } catch {
    return structuredClone(originalJobs);
  }
}

function formatName(name) {
  if (!name) return "";
  return Object.hasOwn(teacherPoints, name) ? `${name}（${teacherPoints[name]}）` : name;
}

function isFirebaseConfigured() {
  const config = window.LIXING_FIREBASE_CONFIG;
  return Boolean(config?.apiKey && config?.databaseURL && window.firebase?.database);
}

function initRemoteSync() {
  if (!isFirebaseConfigured()) return;
  try {
    firebase.apps.length ? firebase.app() : firebase.initializeApp(window.LIXING_FIREBASE_CONFIG);
    remoteSync.ref = firebase.database().ref(window.LIXING_DATABASE_PATH || "boards/lixing-115/jobs");
    remoteSync.ready = true;
    remoteSync.ref.on("value", (snapshot) => {
      const remotePayload = snapshot.val();
      if (!remotePayload) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remotePayload));
      lastPayload = "";
      render();
    });
  } catch (error) {
    console.warn("Firebase sync unavailable:", error);
  }
}

function render() {
  const currentPayload = localStorage.getItem(STORAGE_KEY) || "";
  if (currentPayload === lastPayload && viewerBoard.childElementCount) return;
  lastPayload = currentPayload;
  const jobs = loadJobs();

  viewerBoard.innerHTML = "";
  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "job-group";
    section.innerHTML = `<h2>${group.title}</h2>`;
    const grid = document.createElement("div");
    grid.className = "job-grid";

    jobs.filter((job) => job.group === group.title).forEach((job) => {
      const cell = document.createElement("div");
      cell.className = "job";
      if (job.locked) cell.classList.add("locked");
      if (job.name && !job.locked) cell.classList.add("chosen");
      if (!job.name) cell.classList.add("empty");
      cell.innerHTML = `
        <span class="job-title">${job.title}</span>
        <span class="job-name ${job.name ? "" : "empty-name"}">${formatName(job.name) || "待選填"}</span>
        <span class="job-note">${job.locked ? "已確認" : job.name ? "已選填" : ""}</span>
      `;
      grid.appendChild(cell);
    });

    section.appendChild(grid);
    viewerBoard.appendChild(section);
  });

  pickedCount.textContent = jobs.filter((job) => !job.locked && job.name).length;
  openCount.textContent = jobs.filter((job) => !job.locked && !job.name).length;
  lastUpdated.textContent = `最後更新：${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) render();
});

updateChannel?.addEventListener("message", render);
setInterval(render, 1000);
initRemoteSync();
render();
