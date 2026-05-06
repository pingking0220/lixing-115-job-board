const teachers = [
  "徐蕙美", "謝英玲", "沈佩芳", "蔡瓊慧", "楊從玓", "楊兆琪", "蘇靖閔", "方盈予",
  "陳祈宏", "潘佳玲", "吳宜津", "曾鈺臻", "莊美雅", "林怡伶", "劉佩怡", "吳玲玲",
  "粘依婷", "鄭琇穗", "牟嘉瑩", "呂倩如", "林怡君", "吳沛珊", "陳鈺雯", "陳怜蓁",
  "徐靜敏", "林亮均", "張瑜珊", "倪晨茹", "蔡昀倢", "邱筠芝", "韓家柔"
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

const STORAGE_KEY = "lixing-115-practice-board";
const originalJobs = groups.flatMap((group, groupIndex) =>
  group.jobs.map(([title, name, options = {}], jobIndex) => ({
    id: `${groupIndex}-${jobIndex}`,
    group: group.title,
    title,
    name,
    locked: Boolean(name),
    unavailable: Boolean(options.unavailable),
    order: groupIndex * 1000 + jobIndex
  }))
);

let jobs = loadJobs();
let selectedTeacher = "";
let pending = null;

const teacherList = document.querySelector("#teacherList");
const jobBoard = document.querySelector("#jobBoard");
const currentAction = document.querySelector("#currentAction");
const confirmButton = document.querySelector("#confirmButton");
const cancelButton = document.querySelector("#cancelButton");
const clearSelection = document.querySelector("#clearSelection");
const resetButton = document.querySelector("#resetButton");

function loadJobs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(originalJobs);
  try {
    const parsed = JSON.parse(saved);
    return originalJobs.map((job) => ({ ...job, ...(parsed[job.id] || {}) })).sort((a, b) => a.order - b.order);
  } catch {
    return structuredClone(originalJobs);
  }
}

function saveJobs() {
  const payload = Object.fromEntries(jobs.map((job) => [job.id, {
    name: job.name,
    locked: Boolean(job.locked && job.name),
    unavailable: Boolean(job.unavailable),
    order: job.order
  }]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function formatName(name) {
  if (!name) return "";
  return Object.hasOwn(teacherPoints, name) ? `${name}（${teacherPoints[name]}）` : name;
}

function render() {
  renderTeachers();
  renderBoard();
  renderStatus();
}

function renderTeachers() {
  const assignedNames = new Set(jobs.filter((job) => !job.locked && job.name).map((job) => job.name));
  teacherList.innerHTML = "";
  teachers.forEach((name, index) => {
    const button = document.createElement("button");
    button.className = "teacher";
    button.type = "button";
    button.disabled = assignedNames.has(name);
    if (selectedTeacher === name) button.classList.add("selected");
    button.innerHTML = `<span class="order">${index + 1}</span><span class="teacher-name">${formatName(name)}</span><span class="teacher-state">${assignedNames.has(name) ? "已練習" : ""}</span>`;
    button.addEventListener("click", () => {
      selectedTeacher = selectedTeacher === name ? "" : name;
      pending = null;
      render();
    });
    teacherList.appendChild(button);
  });
}

function renderBoard() {
  jobBoard.innerHTML = "";
  [...new Set(jobs.map((job) => job.group))].forEach((groupTitle) => {
    const section = document.createElement("section");
    section.className = "job-group";
    section.innerHTML = `<h2>${groupTitle}</h2>`;
    const grid = document.createElement("div");
    grid.className = "job-grid";

    jobs.filter((job) => job.group === groupTitle).forEach((job) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "job";
      if (job.locked) cell.classList.add("locked");
      if (job.unavailable) cell.classList.add("unavailable");
      if (job.name && !job.locked) cell.classList.add("chosen");
      if (pending?.jobId === job.id) cell.classList.add("pending");
      cell.disabled = job.locked || job.unavailable || Boolean(job.name);
      cell.innerHTML = `
        <span class="job-title">${job.title}</span>
        <span class="job-name">${pending?.jobId === job.id ? formatName(pending.teacher) : (formatName(job.name) || "待選填")}</span>
        <span class="job-note">${job.unavailable ? "暫停選填" : job.locked ? "已確認" : pending?.jobId === job.id ? "待確認" : job.name ? "已練習" : ""}</span>
      `;
      cell.addEventListener("click", () => chooseJob(job.id));
      grid.appendChild(cell);
    });

    section.appendChild(grid);
    jobBoard.appendChild(section);
  });
}

function renderStatus() {
  const assignedNames = new Set(jobs.filter((job) => !job.locked && job.name).map((job) => job.name));
  document.querySelector("#availableCount").textContent = teachers.length - assignedNames.size;
  document.querySelector("#pickedCount").textContent = assignedNames.size;
  document.querySelector("#openCount").textContent = jobs.filter((job) => !job.locked && !job.unavailable && !job.name).length - (pending ? 1 : 0);
  confirmButton.disabled = !pending;
  cancelButton.disabled = !pending;

  if (pending) {
    const job = jobs.find((item) => item.id === pending.jobId);
    currentAction.textContent = `${formatName(pending.teacher)} 練習選填 ${job.title}，請按確認或取消`;
  } else if (selectedTeacher) {
    currentAction.textContent = `目前選取：${formatName(selectedTeacher)}，請點擊空白職務`;
  } else {
    currentAction.textContent = "請先點選教師姓名";
  }
}

function chooseJob(jobId) {
  if (!selectedTeacher) return;
  if (jobs.some((job) => !job.locked && job.name === selectedTeacher)) return;
  const job = jobs.find((item) => item.id === jobId);
  if (!job || job.locked || job.unavailable || job.name) return;
  pending = { teacher: selectedTeacher, jobId };
  render();
}

confirmButton.addEventListener("click", () => {
  if (!pending) return;
  const job = jobs.find((item) => item.id === pending.jobId);
  job.name = pending.teacher;
  job.locked = false;
  selectedTeacher = "";
  pending = null;
  saveJobs();
  render();
});

cancelButton.addEventListener("click", () => {
  pending = null;
  render();
});

clearSelection.addEventListener("click", () => {
  selectedTeacher = "";
  pending = null;
  render();
});

resetButton.addEventListener("click", () => {
  if (!confirm("確定重設這次練習？")) return;
  localStorage.removeItem(STORAGE_KEY);
  jobs = structuredClone(originalJobs);
  selectedTeacher = "";
  pending = null;
  render();
});

render();
