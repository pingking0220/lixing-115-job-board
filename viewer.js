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
  張瑜珊: 23,
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
  [...new Set(jobs.map((job) => job.group))].forEach((groupTitle) => {
    const section = document.createElement("section");
    section.className = "job-group";
    section.innerHTML = `<h2>${groupTitle}</h2>`;
    renderJobSubgroups(section, jobs.filter((job) => job.group === groupTitle), createJobCell);
    viewerBoard.appendChild(section);
  });

  pickedCount.textContent = jobs.filter((job) => !job.locked && job.name).length;
  openCount.textContent = jobs.filter((job) => !job.locked && !job.unavailable && !job.name).length;
  lastUpdated.textContent = `最後更新：${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function renderJobSubgroups(container, groupJobs, createCell) {
  const buckets = new Map();
  groupJobs.forEach((job) => {
    const sectionTitle = getJobSection(job);
    if (!buckets.has(sectionTitle)) buckets.set(sectionTitle, []);
    buckets.get(sectionTitle).push(job);
  });

  buckets.forEach((sectionJobs, sectionTitle) => {
    const subgroup = document.createElement("div");
    subgroup.className = "job-subgroup";
    subgroup.innerHTML = `<h3>${sectionTitle}</h3>`;
    const grid = document.createElement("div");
    grid.className = "job-grid";
    sectionJobs.forEach((job) => grid.appendChild(createCell(job)));
    subgroup.appendChild(grid);
    container.appendChild(subgroup);
  });
}

function getJobSection(job) {
  const title = job.title;
  if (["教務主任", "教學組長", "註冊組長", "設備組長", "資訊組長"].includes(title)) return "教務處";
  if (["學務主任", "生教組長", "訓育組長", "體育組長", "衛生組長"].includes(title)) return "學務處";
  if (title === "總務主任") return "總務處";
  if (["輔導主任", "輔導組長", "特教組長", "資料組長"].includes(title)) return "輔導室";
  if (/^1\d導師$/.test(title)) return "一年級";
  if (/^2\d導師$/.test(title)) return "二年級";
  if (/^3\d導師$/.test(title)) return "三年級";
  if (/^4\d導師$/.test(title)) return "四年級";
  if (/^5\d導師$/.test(title)) return "五年級";
  if (/^6\d導師$/.test(title)) return "六年級";
  if (title.startsWith("自然科任")) return "自然科任";
  if (title.startsWith("英語科任")) return "英語科任";
  if (title.startsWith("音樂科任")) return "音樂科任";
  if (title.startsWith("體育科任")) return "體育科任";
  if (title.startsWith("資源班")) return "資源班";
  if (title.startsWith("專輔教師")) return "專輔教師";
  if (title.includes("科任")) return "其他科任";
  return "其他";
}

function createJobCell(job) {
  const cell = document.createElement("div");
  cell.className = "job";
  if (job.locked) cell.classList.add("locked");
  if (job.unavailable) cell.classList.add("unavailable");
  if (job.name && !job.locked) cell.classList.add("chosen");
  if (!job.name) cell.classList.add("empty");
  cell.innerHTML = `
    <span class="job-title">${job.title}</span>
    <span class="job-name ${job.name ? "" : "empty-name"}">${formatName(job.name) || "待選填"}</span>
    <span class="job-note">${job.unavailable ? "暫停選填" : job.locked ? "已確認" : job.name ? "已選填" : ""}</span>
  `;
  return cell;
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) render();
});

updateChannel?.addEventListener("message", render);
setInterval(render, 1000);
initRemoteSync();
render();
