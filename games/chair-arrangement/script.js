// Chair Array Adventure (Kid-friendly) — bilingual EN-UK + 简体中文

let correctRows = 0;
let correctCols = 0;

let stars = 0;
let streak = 0;

const COLS_IN_GRID = 10;

function $(id){ return document.getElementById(id); }

// ----------------------
// i18n (EN-UK + Simplified Chinese)
// ----------------------
const LANG_MAP = {
  "en-GB": "en",
  "zh-CN": "zh"
};

let currentLang = (function(){
  const params = new URLSearchParams(window.location.search);
  const urlLangRaw = (params.get("lang") || "").toLowerCase();
  if (["zh", "zh-cn", "zh-hans"].includes(urlLangRaw)) return "zh-CN";
  if (["en", "en-gb", "en-us"].includes(urlLangRaw)) return "en-GB";
  const saved = localStorage.getItem("caa_lang");
  if (saved && LANG_MAP[saved]) return saved;
  const nav = (navigator.language || "en-GB");
  return LANG_MAP[nav] ? nav : "en-GB";
})();

const I18N = {
  en: {
    docTitle: "Chair Arrangement Game",
    title: "Chair Arrangement Game 🪑✨",
    subtitle: "Build arrays with chairs. Learn rows × columns the fun way!",

    languageLabel: "Language",
    hudAria: "Game progress",
    starsLabel: "Stars",
    streakLabel: "Streak",
    starsTitle: "Stars earned",
    streakTitle: "Your streak of correct answers",

    modeLabel: "Mode",
    learningModeOption: "Learning Mode",
    practiceModeOption: "Practice Mode",

    learningModeHeading: "Learning Mode",
    learningHelp: "Pick rows and columns, then generate the chair array.",
    rowsLabel: "Rows",
    columnsLabel: "Columns",
    timesTableLabel: "Times Table",
    generateBtn: "Generate",

    practiceModeHeading: "Practice Mode",
    practiceBubble: "Hi! Press <b>Start</b> and build the array.",
    startBtn: "Start",
    newQuestionBtn: "New Question",
    checkBtn: "Check",
    showAnswerBtn: "Show Answer",

    yourGridTitle: "Your Classroom Grid",
    trayTitle: "Chair Tray (drag from here)",
    gridHint: "Tip: make a tidy rectangle. No floating chairs!",
    trayHint: "You can drag chairs back here too.",
    trayAria: "Drag chairs from here",

    footerText: "Made for young learners • Drag, build, and learn ✨",

    // dynamic strings
    mascotReady: "Ready? Press Start and build the array 🪑",
    learningEquation: "<b>{rows}</b> rows of <b>{cols}</b> → {rows} × {cols} = <span style=\"font-size: 22px;\">{total}</span>",
    practiceBuildStatement: "Question: <b>{rows} × {cols}</b>. Build <b>{rows}</b> rows of <b>{cols}</b> chairs (total <b>{total}</b>).",

    mascotMakeRectangle: "Alright! Make <b>{rows}</b> rows of <b>{cols}</b> 🧠",

    fbNeedMoreOrLess: "Oops! You placed {placed} chairs. You need {needed}.",
    mascotCountCarefully: "Try again. Count the chairs carefully 🧮",

    fbCorrectDirect: "Yay! Correct: {rows} rows of {cols} ({rows} × {cols} = {total}) 🎉",
    fbSwappedDifferent: "Close! You made {rows} rows of {cols}. But the question is {needRows} rows of {needCols}. Same total ({total}), different idea 😉",
    mascotSwappedDifferent: "Rows first, then columns. Read the question carefully 👀",

    fbCorrectSwapped: "Nice work! You made {rows} rows of {cols}. (We’re checking the exact rows × columns asked.)",
    mascotGreatNewQuestion: "Legend. Want a new question? Press New Question ✨",

    fbNoGaps: "Almost! Make a full rectangle with no gaps.",
    mascotNoHoles: "Keep it tidy: a rectangle with no holes 🟦",

    fbWrongDims: "Not quite. You built {rows} rows of {cols}. Try {needRows} rows of {needCols}.",
    mascotSwapIfNeed: "Rows first, columns next. You’ve got this 💪",

    answerStatement: "Answer: <b>{rows} rows of {cols} ({rows} × {cols} = {total})</b>",
    fbReveal: "Here’s one correct example. Press New Question to try again!",
    mascotLookThenTry: "Look at the rows and columns, then try a new one 👀"
  },

  zh: {
    docTitle: "椅子阵列游戏",
    title: "椅子阵列游戏 🪑✨",
    subtitle: "用椅子搭阵列，轻松学会“行 × 列”！",

    languageLabel: "语言",
    hudAria: "游戏进度",
    starsLabel: "星星",
    streakLabel: "连对",
    starsTitle: "获得的星星",
    streakTitle: "连续答对次数",

    modeLabel: "模式",
    learningModeOption: "学习模式",
    practiceModeOption: "练习模式",

    learningModeHeading: "学习模式",
    learningHelp: "选择行数和列数，然后生成椅子阵列。",
    rowsLabel: "行",
    columnsLabel: "列",
    timesTableLabel: "练习的乘法表",
    generateBtn: "生成",

    practiceModeHeading: "练习模式",
    practiceBubble: "嗨！按下<b>开始</b>，来搭阵列吧。",
    startBtn: "开始",
    newQuestionBtn: "新题目",
    checkBtn: "检查",
    showAnswerBtn: "显示答案",

    yourGridTitle: "你的教室网格",
    trayTitle: "椅子托盘（从这里拖）",
    gridHint: "小提示：摆成整齐的长方形，别让椅子“飘”着！",
    trayHint: "也可以把椅子拖回这里。",
    trayAria: "从这里拖椅子",

    footerText: "为小朋友设计 • 拖一拖、摆一摆、学一学 ✨",

    // dynamic strings
    mascotReady: "准备好了吗？按下开始来搭阵列 🪑",
    learningEquation: "<b>{rows}</b>行，每行<b>{cols}</b> → {rows} × {cols} = <span style=\"font-size: 22px;\">{total}</span>",
    practiceBuildStatement: "题目：<b>{rows} × {cols}</b>。摆出<b>{rows}</b>行，每行<b>{cols}</b>把椅子（共<b>{total}</b>把）。",

    mascotMakeRectangle: "好啦！摆出<b>{rows}</b>行，每行<b>{cols}</b> 🧠",

    fbNeedMoreOrLess: "哎呀！你放了{placed}把椅子，需要{needed}把。",
    mascotCountCarefully: "再试一次，认真数一数椅子 🧮",

    fbCorrectDirect: "耶！正确：{rows}行，每行{cols}（{rows} × {cols} = {total}）🎉",
    fbSwappedDifferent: "快对了！你摆的是{rows}行，每行{cols}。但题目要{needRows}行，每行{needCols}。总数一样（{total}），概念不同 😉",
    mascotSwappedDifferent: "先看行数，再看每行多少。认真读题 👀",

    fbCorrectSwapped: "不错！你摆出了{rows}行，每行{cols}。（但这里要对准题目指定的行×列。）",
    mascotGreatNewQuestion: "太厉害了！想换一题？按“新题目”✨",

    fbNoGaps: "差一点！要摆成没有空格的完整长方形。",
    mascotNoHoles: "摆整齐：长方形里不要有洞 🟦",

    fbWrongDims: "还差一点。你摆的是{rows}行，每行{cols}。试试{needRows}行，每行{needCols}。",
    mascotSwapIfNeed: "先看行数，再看列数。你可以的 💪",

    answerStatement: "答案：<b>{rows}行，每行{cols}（{rows} × {cols} = {total}）</b>",
    fbReveal: "这是一个正确示例。按“新题目”再试一次！",
    mascotLookThenTry: "先看清行和列，然后再来一题 👀"
  }
};

function langKey(){
  return LANG_MAP[currentLang] || "en";
}

function fmt(template, vars){
  let s = template;
  if (vars){
    for (const [k,v] of Object.entries(vars)){
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

function t(key, vars){
  const pack = I18N[langKey()] || I18N.en;
  const fallback = I18N.en[key] || key;
  const template = pack[key] || fallback;
  return fmt(template, vars);
}

function applyI18n(){
  // document-level
  document.documentElement.lang = currentLang;
  document.title = t("docTitle");

  // innerHTML targets
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });

  // titles
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  // aria-labels
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  // gentle reset of mascot bubble when language changes
  const mode = $("mode") ? $("mode").value : "learning";
  if (mode === "practice"){
    setMascot(t("mascotReady"));
  }
}

function setLanguage(lang){
  if (!LANG_MAP[lang]) lang = "en-GB";
  currentLang = lang;
  localStorage.setItem("caa_lang", currentLang);
  const sel = $("langSelect");
  if (sel) sel.value = currentLang;
  applyI18n();
}

// ----------------------
// UI helpers
// ----------------------
function updateHUD(){
  $("starsCount").textContent = String(stars);
  $("streakCount").textContent = String(streak);
}

function setMascot(html){
  const el = $("mascotBubble");
  if (!el) return;
  el.innerHTML = html;
}

// ----------------------
// Times table chooser (Practice Mode)
// ----------------------
function getSelectedTimesTable(){
  const sel = $("timesTableSelect");
  const v = sel ? parseInt(sel.value, 10) : NaN;
  return Number.isFinite(v) ? Math.min(9, Math.max(2, v)) : 2;
}

// In practice mode, selecting “n” means pupils practise:
// 1×n, 2×n, 3×n ... 9×n
let practiceQueue = [];
let practicePos = 0;
let lastSelectedTable = null;

function shuffleInPlace(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function resetPracticeQueue(){
  practiceQueue = [1,2,3,4,5,6,7,8,9];
  shuffleInPlace(practiceQueue);
  practicePos = 0;
}

function setNextPracticeQuestion(){
  const n = getSelectedTimesTable();

  // If teacher/pupil changes the times table, restart the 1..9 run.
  if (n !== lastSelectedTable){
    resetPracticeQueue();
    lastSelectedTable = n;
  }

  if (practiceQueue.length === 0 || practicePos >= practiceQueue.length){
    resetPracticeQueue();
  }

  const a = practiceQueue[practicePos++];
  correctRows = a; // 1..9
  correctCols = n; // chosen times table (2..9)
}

function playTone(type){
  // No external files: simple Web Audio “bling” and “oops”
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    const now = ctx.currentTime;

    if (type === "correct"){
      o.frequency.setValueAtTime(660, now);
      o.frequency.exponentialRampToValueAtTime(990, now + 0.12);
      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else {
      o.frequency.setValueAtTime(220, now);
      o.frequency.exponentialRampToValueAtTime(160, now + 0.16);
      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
    }

    o.connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.22);

    setTimeout(() => ctx.close(), 350);
  }catch(e){
    // If autoplay is blocked, just skip sound silently.
  }
}

function confettiBurst(){
  const layer = $("confettiLayer");
  if (!layer) return;

  const pieces = 36;
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

  for (let i = 0; i < pieces; i++){
    const c = document.createElement("div");
    c.className = "confetti";

    // random bright color without hardcoding a “theme”
    const hue = Math.floor(Math.random() * 360);
    c.style.background = `hsl(${hue} 90% 55%)`;

    const left = Math.random() * vw;
    c.style.left = left + "px";
    c.style.top = (-20 - Math.random()*80) + "px";
    c.style.transform = `rotate(${Math.random()*360}deg)`;

    const delay = Math.random() * 120;
    c.style.animationDelay = delay + "ms";

    layer.appendChild(c);

    setTimeout(() => c.remove(), 1400);
  }
}

// ----------------------
// MODE SWITCH
// ----------------------
function switchMode() {
  const mode = $("mode").value;
  $("learningMode").style.display = mode === "learning" ? "block" : "none";
  $("practiceMode").style.display = mode === "practice" ? "block" : "none";

  // Friendly nudge
  if (mode === "practice") {
    setMascot(t("mascotReady"));
  }
}

// ----------------------
// LEARNING MODE
// ----------------------
function generateLearningMode() {
  const rows = parseInt($("rows").value, 10);
  const columns = parseInt($("columns").value, 10);
  const grid = $("arrayGridLearning");

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${columns}, 58px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 58px)`;

  for (let i = 0; i < rows * columns; i++) {
    const chair = document.createElement("div");
    chair.className = "chair";
    grid.appendChild(chair);
  }

  const total = rows * columns;
  $("multiplicationStatementLearning").innerHTML = t("learningEquation", { rows, cols: columns, total });

  playTone("correct");
}

// ----------------------
// PRACTICE MODE
// ----------------------
function generatePracticeMode() {
  // “Times table n” here means: 1×n, 2×n, ... 9×n
  setNextPracticeQuestion();
  const numChairs = correctRows * correctCols;

  const grid = $("arrayGridPractice");
  const dragArea = $("dragArea");

  grid.innerHTML = "";
  dragArea.innerHTML = "";

  $("multiplicationStatementPractice").innerHTML = t("practiceBuildStatement", {
    total: numChairs,
    rows: correctRows,
    cols: correctCols
  });

  grid.style.gridTemplateColumns = `repeat(${COLS_IN_GRID}, 58px)`;
  grid.style.gridTemplateRows = `repeat(${COLS_IN_GRID}, 58px)`;

  // Create a 10×10 drop grid
  for (let i = 0; i < COLS_IN_GRID * COLS_IN_GRID; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.ondrop = drop;
    cell.ondragover = allowDrop;
    cell.ondragenter = () => cell.classList.add("hover");
    cell.ondragleave = () => cell.classList.remove("hover");
    grid.appendChild(cell);
  }

  // Make the tray droppable too (so kids can “undo” by dragging back)
  dragArea.ondrop = drop;
  dragArea.ondragover = allowDrop;
  dragArea.ondragenter = () => dragArea.classList.add("hover");
  dragArea.ondragleave = () => dragArea.classList.remove("hover");

  // Create draggable chairs
  for (let i = 0; i < numChairs; i++) {
    const chair = document.createElement("div");
    chair.className = "chair";
    chair.draggable = true;
    chair.id = `chair-${Date.now()}-${i}`;
    chair.ondragstart = dragStart;
    chair.ondragend = dragEnd;
    dragArea.appendChild(chair);
  }

  $("revealAnswer").style.display = "none";
  showFeedback("", true, true);
  setMascot(t("mascotMakeRectangle", { rows: correctRows, cols: correctCols }));
}

function allowDrop(event) {
  event.preventDefault();
}

function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
  event.target.classList.add("dragging");
}

function dragEnd(event){
  event.target.classList.remove("dragging");
  // clear hover outlines
  document.querySelectorAll(".grid-cell.hover").forEach(el => el.classList.remove("hover"));
  $("dragArea").classList.remove("hover");
}

function drop(event) {
  event.preventDefault();

  const id = event.dataTransfer.getData("text/plain");
  const dragged = document.getElementById(id);
  if (!dragged) return;

  // if user drops on the chair image itself, use the parent
  const cell = event.target.closest(".grid-cell");
  const tray = event.target.closest("#dragArea");

  if (cell){
    cell.classList.remove("hover");
    if (cell.children.length === 0){
      cell.appendChild(dragged);
    }
    return;
  }

  if (tray){
    tray.classList.remove("hover");
    tray.appendChild(dragged);
  }
}

function showFeedback(message, isCorrect, silent=false) {
  const feedbackDiv = $("feedbackMessage");
  if (!feedbackDiv) return;

  if (!message){
    feedbackDiv.style.display = "none";
    feedbackDiv.textContent = "";
    feedbackDiv.className = "feedback-message";
    return;
  }

  feedbackDiv.textContent = message;
  feedbackDiv.className = `feedback-message ${isCorrect ? "correct" : "incorrect"}`;
  feedbackDiv.style.display = "block";

  if (!silent){
    setTimeout(() => {
      feedbackDiv.style.display = "none";
    }, 5200);
  }
}

function getOccupiedPositions(){
  const cells = Array.from($("arrayGridPractice").children);
  const occupied = [];

  for (let i = 0; i < cells.length; i++){
    if (cells[i].children.length > 0){
      const r = Math.floor(i / COLS_IN_GRID);
      const c = i % COLS_IN_GRID;
      occupied.push({ r, c });
    }
  }
  return occupied;
}

function validatePlacement() {
  const occupied = getOccupiedPositions();
  const needed = correctRows * correctCols;

  const gridEl = $("arrayGridPractice");
  gridEl.classList.remove("shake");

  if (occupied.length !== needed) {
    streak = 0;
    updateHUD();
    playTone("wrong");
    $("revealAnswer").style.display = "inline-block";
    gridEl.classList.add("shake");

    showFeedback(t("fbNeedMoreOrLess", { placed: occupied.length, needed }), false);
    setMascot(t("mascotCountCarefully"));
    return false;
  }

  // Check if chairs form a full rectangle (no gaps)
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  const set = new Set(occupied.map(p => `${p.r},${p.c}`));

  for (const p of occupied){
    minR = Math.min(minR, p.r);
    maxR = Math.max(maxR, p.r);
    minC = Math.min(minC, p.c);
    maxC = Math.max(maxC, p.c);
  }

  const rowCount = (maxR - minR + 1);
  const colCount = (maxC - minC + 1);

  let isRectangle = true;
  for (let r = minR; r <= maxR; r++){
    for (let c = minC; c <= maxC; c++){
      if (!set.has(`${r},${c}`)){
        isRectangle = false;
        break;
      }
    }
    if (!isRectangle) break;
  }

  const direct = (rowCount === correctRows && colCount === correctCols);
  const swapped = (rowCount === correctCols && colCount === correctRows);

  if (isRectangle && direct) {
    streak += 1;
    stars += 1;
    updateHUD();

    playTone("correct");
    confettiBurst();

    const msg = t("fbCorrectDirect", { rows: rowCount, cols: colCount, total: needed });

    showFeedback(msg, true);
    setMascot(t("mascotGreatNewQuestion"));
    $("revealAnswer").style.display = "none";
    return true;
  }

  // Same total, but different meaning: rows × columns matters here (e.g., 5×4 ≠ 4×5 in array language)
  if (isRectangle && swapped) {
    streak = 0;
    updateHUD();
    playTone("wrong");
    $("revealAnswer").style.display = "inline-block";
    gridEl.classList.add("shake");

    showFeedback(t("fbSwappedDifferent", {
      rows: rowCount,
      cols: colCount,
      needRows: correctRows,
      needCols: correctCols,
      total: needed
    }), false);
    setMascot(t("mascotSwappedDifferent"));
    return false;
  }

streak = 0;
  updateHUD();

  playTone("wrong");
  $("revealAnswer").style.display = "inline-block";
  gridEl.classList.add("shake");

  if (!isRectangle){
    showFeedback(t("fbNoGaps"), false);
    setMascot(t("mascotNoHoles"));
  } else {
    showFeedback(t("fbWrongDims", { rows: rowCount, cols: colCount, needRows: correctRows, needCols: correctCols }), false);
    setMascot(t("mascotSwapIfNeed"));
  }

  return false;
}

function generateEquation() {
  validatePlacement();
}

function revealAnswer() {
  const grid = $("arrayGridPractice");
  const dragArea = $("dragArea");

  // pull all chairs back first
  Array.from(grid.querySelectorAll(".chair")).forEach(ch => dragArea.appendChild(ch));
  Array.from(dragArea.querySelectorAll(".chair")).forEach(ch => ch.remove());

  // rebuild a clean example
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${COLS_IN_GRID}, 58px)`;
  grid.style.gridTemplateRows = `repeat(${COLS_IN_GRID}, 58px)`;

  for (let i = 0; i < COLS_IN_GRID * COLS_IN_GRID; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }

  // Fill top-left rectangle
  for (let r = 0; r < correctRows; r++){
    for (let c = 0; c < correctCols; c++){
      const idx = r * COLS_IN_GRID + c;
      const chair = document.createElement("div");
      chair.className = "chair";
      grid.children[idx].appendChild(chair);
    }
  }

  $("multiplicationStatementPractice").innerHTML = t("answerStatement", {
    rows: correctRows,
    cols: correctCols,
    total: correctRows * correctCols
  });

  $("revealAnswer").style.display = "none";
  showFeedback(t("fbReveal"), true);
  setMascot(t("mascotLookThenTry"));
}

document.addEventListener("DOMContentLoaded", () => {
  updateHUD();
  switchMode();

  const langSelect = $("langSelect");
  if (langSelect){
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => setLanguage(e.target.value));
  }

  applyI18n();

  // Times table selection (remember choice)
  const tableSelect = $("timesTableSelect");
  if (tableSelect){
    const saved = parseInt(localStorage.getItem("caa_times_table") || "", 10);
    if (Number.isFinite(saved) && saved >= 2 && saved <= 9){
      tableSelect.value = String(saved);
    } else {
      tableSelect.value = "2";
    }
    tableSelect.addEventListener("change", (e) => {
      localStorage.setItem("caa_times_table", String(getSelectedTimesTable()));
      // Restart the 1..9 × n cycle next time Start/New Question is pressed.
      lastSelectedTable = null;
      practiceQueue = [];
      practicePos = 0;
    });
  }

  const startBtn = $("generateChairs");
  const newBtn = $("resetButton");
  const checkBtn = $("generateEquation");
  const revealBtn = $("revealAnswer");

  if (startBtn) startBtn.addEventListener("click", generatePracticeMode);
  if (newBtn) newBtn.addEventListener("click", generatePracticeMode);
  if (checkBtn) checkBtn.addEventListener("click", generateEquation);
  if (revealBtn) revealBtn.addEventListener("click", revealAnswer);
});
