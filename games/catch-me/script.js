const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 500;

// Stop page scrolling when playing with arrow keys
window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowDown"].includes(e.key)) e.preventDefault();
}, { passive: false });

// ---------- Language ----------
let lang = "en"; // "en" | "zh"

// Play mode
let timingMode = "untimed"; // "untimed" | "timed"

// Allow START_HERE.html to open this game directly as timed/untimed.
// Example: index.html?timing=timed&lockTiming=1
const launchParams = new URLSearchParams(window.location.search);
const requestedLang = (launchParams.get("lang") || "").toLowerCase();
if (["zh", "zh-cn", "zh-hans"].includes(requestedLang)) {
  lang = "zh";
} else if (["en", "en-gb", "en-us"].includes(requestedLang)) {
  lang = "en";
}
const requestedTiming = launchParams.get("timing") || launchParams.get("mode");
if (requestedTiming === "timed" || requestedTiming === "untimed") {
  timingMode = requestedTiming;
}
const lockTiming = launchParams.get("lockTiming") === "1" || launchParams.get("slot") === "competency" || launchParams.get("slot") === "procedural";

const TIME_LIMIT_SEC = 60;

const I18N = {
  en: {
    appTitle: "Catch Me!Game",
    langTitle: "Choose Language",
    langHint: "You can change language before starting the game.",
    rulesTitle: "Game Rules:",
    timingTitle: "Choose Play Mode",
    timingUntimed: "⌛ Untimed",
    timingTimed: "⏱ Timed (1 min)",
    timingHint: "Timed mode lasts 1 minute. Untimed mode can be ended after 10 attempts.",
    rules: [
      "1️⃣ Select a times table (or 🎲 Mixed x3).",
      "2️⃣ Choose play mode: ⌛ Untimed or ⏱ Timed (1 minute).",
      "3️⃣ Choose a speed: 🐢 Slow, 🐇 Moderate, or 🚀 Fast.",
      "4️⃣ Move the basket left/right. Press Down Arrow to drop faster.",
      "5️⃣ Catch the apple with the correct answer.",
      "6️⃣ Untimed: after 10 attempts, click End Game. Timed: ends automatically after 1 minute. Results show fluency, accuracy, and speed."
    ],
    chooseTableTitle: "Choose Your Times Table",
    mixedBtn: "🎲 Mixed x3",
    mixedHint: "Mixed Mode: Choose exactly 3 times tables.",
    mixedSelected: "Selected",
    modeTitle: "Choose Your Game Mode",
    modeSlow: "🐢 Slow",
    modeModerate: "🐇 Moderate",
    modeFast: "🚀 Fast",
    endGame: "End Game",
    stats: {
      time: "Time",
      timeLeft: "Time Left",
      sec: "sec",
      attempts: "Attempts",
      correct: "Correct",
      speed: "Speed",
      perMin: "per min",
      accuracy: "Accuracy",
      fluency: "Fluency Rate"
    },
    alerts: {
      mixedNeed3: "Mixed Mode: Please choose exactly 3 times tables first.",
      endNeed10: "Untimed mode: you need at least 10 attempts before ending the game!"
    },
    msg: {
      good: "✅ Good job!",
      oops: (a, b, ans) => `❌ Oops, ${a} x ${b} = ${ans}`,
      missed: (a, b, ans) => `⚠️ You missed! ${a} x ${b} = ${ans}`
    },
    end: {
      title: "Game Over",
      timeSpent: "⏱ Time Spent",
      totalAttempts: "🎯 Total Attempts",
      correct: "✅ Correct Responses",
      speedRate: "⚡ Speed Rate",
      accuracyRate: "📊 Accuracy Rate",
      fluencyRate: "💡 Fluency Rate",
      playAgain: "Play Again"
    }
  },
  zh: {
    appTitle: "接住我！游戏",
    langTitle: "选择语言",
    langHint: "开始游戏前都可以切换语言。",
    rulesTitle: "游戏规则：",
    timingTitle: "选择玩法",
    timingUntimed: "⌛ 不限时",
    timingTimed: "⏱ 限时（1 分钟）",
    timingHint: "限时模式为 1 分钟。不限时模式做满 10 次后可结束。",
    rules: [
      "1️⃣ 选择要练习的乘法表（或 🎲 混合 x3 选 3 个）。",
      "2️⃣ 选择玩法：⌛ 不限时 或 ⏱ 限时（1 分钟）。",
      "3️⃣ 选择速度：🐢 慢、🐇 中、🚀 快。",
      "4️⃣ 用左右方向键移动篮子，按下方向键让苹果掉得更快。",
      "5️⃣ 接住写着正确答案的苹果。",
      "6️⃣ 不限时：做满 10 次后可按“结束游戏”。限时：1 分钟后自动结束。成绩显示流畅度、正确率和速度。"
    ],
    chooseTableTitle: "选择乘法表",
    mixedBtn: "🎲 混合 x3",
    mixedHint: "混合模式：必须选 3 个乘法表。",
    mixedSelected: "已选择",
    modeTitle: "选择速度模式",
    modeSlow: "🐢 慢",
    modeModerate: "🐇 中",
    modeFast: "🚀 快",
    endGame: "结束游戏",
    stats: {
      time: "时间",
      timeLeft: "剩余时间",
      sec: "秒",
      attempts: "尝试次数",
      correct: "答对次数",
      speed: "速度",
      perMin: "每分钟",
      accuracy: "正确率",
      fluency: "流畅度"
    },
    alerts: {
      mixedNeed3: "混合模式：请先选满 3 个乘法表。",
      endNeed10: "不限时模式：至少做满 10 次才可以结束游戏！"
    },
    msg: {
      good: "✅ 很好！",
      oops: (a, b, ans) => `❌ 哎呀，${a} x ${b} = ${ans}`,
      missed: (a, b, ans) => `⚠️ 没接到！${a} x ${b} = ${ans}`
    },
    end: {
      title: "游戏结束",
      timeSpent: "⏱ 用时",
      totalAttempts: "🎯 尝试次数",
      correct: "✅ 答对次数",
      speedRate: "⚡ 速度",
      accuracyRate: "📊 正确率",
      fluencyRate: "💡 流畅度",
      playAgain: "再玩一次"
    }
  }
};

function t() { return I18N[lang]; }

function applyLanguage() {
  const tr = t();
  document.documentElement.lang = (lang === "zh") ? "zh-Hans" : "en";

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setText("app-title", tr.appTitle);
  setText("lang-title", tr.langTitle);
  setText("lang-hint", tr.langHint);
  setText("rules-title", tr.rulesTitle);
  setText("timing-title", tr.timingTitle);
  setText("timing-untimed", tr.timingUntimed);
  setText("timing-timed", tr.timingTimed);
  setText("timing-hint", tr.timingHint);


  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`rule-${i}`);
    if (!el) continue;
    el.innerText = tr.rules[i - 1];
  }

setText("choose-table-title", tr.chooseTableTitle);

  const mixedBtn = document.getElementById("mixed-btn");
  if (mixedBtn) mixedBtn.innerText = tr.mixedBtn;

  setText("mixed-hint", tr.mixedHint);

  const mixedCountLine = document.getElementById("mixed-count-line");
  const countSpan = document.getElementById("mixed-count");
  if (mixedCountLine && countSpan) {
    mixedCountLine.innerHTML = `${tr.mixedSelected}: <span id="mixed-count">${countSpan.innerText}</span>/3`;
  }

  setText("mode-title", tr.modeTitle);
  setText("mode-slow", tr.modeSlow);
  setText("mode-moderate", tr.modeModerate);
  setText("mode-fast", tr.modeFast);

  const endBtn = document.getElementById("endGame");
  if (endBtn) endBtn.innerText = tr.endGame;

  setText("lbl-time", (timingMode === "timed") ? tr.stats.timeLeft : tr.stats.time);
  setText("lbl-sec", tr.stats.sec);
  setText("lbl-attempts", tr.stats.attempts);
  setText("lbl-correct", tr.stats.correct);
  setText("lbl-speed", tr.stats.speed);
  setText("lbl-permin", tr.stats.perMin);
  setText("lbl-accuracy", tr.stats.accuracy);
  setText("lbl-fluency", tr.stats.fluency);
}

// Language buttons
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    lang = btn.getAttribute("data-lang") || "en";
    document.querySelectorAll(".lang-btn").forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    applyLanguage();
  });
});

function applyTimingLaunchState() {
  document.querySelectorAll(".timing-btn").forEach((btn) => {
    const btnTiming = btn.getAttribute("data-timing");
    btn.setAttribute("aria-pressed", btnTiming === timingMode ? "true" : "false");
    if (lockTiming) btn.disabled = btnTiming !== timingMode;
  });

  const hint = document.getElementById("timing-hint");
  if (hint && lockTiming) {
    hint.innerText = timingMode === "timed"
      ? "Fluency Competency Slot: timed mode is fixed at 1 minute."
      : "Procedural Practice Slot: untimed mode is fixed for practice.";
  }
}

// Apply default language and URL-launched timing state on load
applyLanguage();
applyTimingLaunchState();

// Timing buttons (Timed / Untimed)
document.querySelectorAll(".timing-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const chosenTiming = btn.getAttribute("data-timing") || "untimed";
    if (lockTiming && chosenTiming !== timingMode) return;
    timingMode = chosenTiming;
    document.querySelectorAll(".timing-btn").forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    applyLanguage(); // refresh labels/hint (esp. Time vs Time Left)
    applyTimingLaunchState();
  });
});


// ---------- Assets ----------
const basketImg = new Image();
basketImg.src = "basket.png";

const appleImg = new Image();
appleImg.src = "apple.png";

// ---------- Game State ----------
const basket = { x: 140, y: 410, width: 120, height: 80 };
const appleSize = 70;

const answers = [];
let baseSpeed = 1.6;
let speed = baseSpeed;

let correctAnswer = 0;
let selectedTable = 2;

let isMixedMode = false;
let selectedTables = [];

let currentQ = { num: 1, table: 2 };

let gameMode = "moderate"; // slow | moderate | fast
let totalAttempts = 0;
let correctResponses = 0;
let startTime = 0;
let timeElapsed = 0;
let gameRunning = false;
let message = "";
// Feedback stays for 3 seconds
const FEEDBACK_MS = 3000;
let messageUntil = 0;

function triggerFeedback(msg) {
  message = msg;
  messageUntil = Date.now() + FEEDBACK_MS;
}


// ---------- UI Helpers ----------
const modeTitle = document.getElementById("mode-title");
const modeSelection = document.getElementById("mode-selection");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");

const mixedPanel = document.getElementById("mixed-panel");
const mixedCountEl = document.getElementById("mixed-count");
const mixedCheckboxesWrap = document.getElementById("mixed-checkboxes");

function showModes() {
  modeTitle.style.display = "block";
  modeSelection.style.display = "block";
}

function hideModes() {
  modeTitle.style.display = "none";
  modeSelection.style.display = "none";
}

function setBaseSpeedFromMode() {
  // Slower overall for young kids (more reaction time)
  if (gameMode === "slow") baseSpeed = 0.85;
  else if (gameMode === "fast") baseSpeed = 1.55;
  else baseSpeed = 1.10;
  speed = baseSpeed;
}

// ---------- Times Table Selection ----------
document.querySelectorAll(".board-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const choice = btn.getAttribute("data-table");

// Visual "selected" state for times table buttons
document.querySelectorAll(".board-btn").forEach(b => b.setAttribute("aria-pressed", "false"));
btn.setAttribute("aria-pressed", "true");


    if (choice === "mixed") {
      isMixedMode = true;
      mixedPanel.classList.add("show");
      updateMixedSelected();
      showModes();
      return;
    }

    isMixedMode = false;
    mixedPanel.classList.remove("show");

    if (mixedCheckboxesWrap) {
      mixedCheckboxesWrap.querySelectorAll("input[type='checkbox']").forEach((c) => (c.checked = false));
    }
    selectedTables = [];
    if (mixedCountEl) mixedCountEl.textContent = "0";

    selectedTable = parseInt(choice, 10);
    showModes();
  });
});

// Mixed mode checkbox logic (choose exactly 3)
function updateMixedSelected() {
  if (!mixedCheckboxesWrap) return;

  const checked = [...mixedCheckboxesWrap.querySelectorAll("input[type='checkbox']:checked")];
  if (checked.length > 3) checked[checked.length - 1].checked = false;

  const finalChecked = [...mixedCheckboxesWrap.querySelectorAll("input[type='checkbox']:checked")];
  selectedTables = finalChecked.map((c) => parseInt(c.value, 10));
  if (mixedCountEl) mixedCountEl.textContent = String(selectedTables.length);
}

if (mixedCheckboxesWrap) {
  mixedCheckboxesWrap.addEventListener("change", updateMixedSelected);
}

// ---------- Mode Buttons ----------
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    gameMode = btn.getAttribute("data-mode");
    setBaseSpeedFromMode();

    if (isMixedMode && selectedTables.length !== 3) {
      alert(t().alerts.mixedNeed3);
      return;
    }

    menu.style.display = "none";
    hideModes();
    gameContainer.style.display = "block";
    startGame();
  });
});

// ---------- Controls ----------
document.addEventListener("keydown", (event) => {
  if (!gameRunning) return;

  if (event.key === "ArrowLeft" && basket.x > 0) basket.x -= 22;
  if (event.key === "ArrowRight" && basket.x < canvas.width - basket.width) basket.x += 22;

  // Speed-up is still faster, but not crazy fast
  if (event.key === "ArrowDown") speed = baseSpeed * 4.5;
});

document.addEventListener("keyup", (event) => {
  if (!gameRunning) return;
  if (event.key === "ArrowDown") speed = baseSpeed;
});

document.getElementById("endGame").addEventListener("click", () => {
  if (!gameRunning) return;

  // Timed mode: allow ending anytime (it also auto-ends at 60s)
  if (timingMode === "timed") {
    gameRunning = false;
    displayEndScreen();
    return;
  }

  // Untimed mode: require at least 10 attempts
  if (totalAttempts >= 10) {
    gameRunning = false;
    displayEndScreen();
  } else {
    alert(t().alerts.endNeed10);
  }
});
// ---------- Game Logic ----------
function startGame() {
  startTime = Date.now();
  totalAttempts = 0;
  correctResponses = 0;
  message = "";
  basket.x = (canvas.width - basket.width) / 2;
  basket.y = canvas.height - basket.height - 10;

  generateQuestion();
  gameRunning = true;
  requestAnimationFrame(updateGame);
  window.focus();
}

function pickTableForQuestion() {
  if (!isMixedMode) return selectedTable;
  const idx = Math.floor(Math.random() * selectedTables.length);
  return selectedTables[idx];
}

function setQuestionText(num, table) {
  // Must stay as "a x b = ?" format in BOTH languages
  document.getElementById("question").innerText = `${num} x ${table} = ?`;
}

function generateQuestion() {
  const num = Math.floor(Math.random() * 9) + 1;
  const table = pickTableForQuestion();

  currentQ = { num, table };
  correctAnswer = num * table;

  setQuestionText(num, table);

  answers.length = 0;
  const correctIndex = Math.floor(Math.random() * 3);

  for (let i = 0; i < 3; i++) {
    let ans;
    do {
      if (i === correctIndex) {
        ans = correctAnswer;
      } else {
        const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? -1 : 1);
        ans = Math.max(1, correctAnswer + delta);
      }
    } while (answers.some((a) => a.value === ans));

    answers.push({
      x: 100 + i * 100,
      y: 50,
      value: ans,
      num,
      table
    });
  }
}

function isCaught(answer) {
  const left = basket.x + 8;
  const right = basket.x + basket.width - 8;

  const appleBottom = answer.y + appleSize / 2;
  const appleTop = answer.y - appleSize / 2;

  const basketTop = basket.y + 10;
  const basketBottom = basket.y + basket.height;

  const withinX = answer.x >= left && answer.x <= right;
  const touchingY = appleBottom >= basketTop && appleTop <= basketBottom;

  return withinX && touchingY;
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  if (basketImg.complete && basketImg.naturalWidth) {
    ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);
  } else {
    ctx.fillStyle = "#7a4b2a";
    ctx.fillRect(basket.x, basket.y + basket.height - 18, basket.width, 18);
  }

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    answer.y += speed;

    drawApple(answer);

    if (isCaught(answer)) {
      totalAttempts++;

      if (answer.value === correctAnswer) {
        correctResponses++;
        triggerFeedback(t().msg.good);
      } else {
        triggerFeedback(t().msg.oops(answer.num, answer.table, correctAnswer));

      }

      generateQuestion();
      break;
    }

    if (answer.y - appleSize / 2 > canvas.height) {
      totalAttempts++;
      triggerFeedback(t().msg.missed(answer.num, answer.table, correctAnswer));
      generateQuestion();
      break;
    }
  }

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
 if (message && Date.now() < messageUntil) {
  ctx.fillText(message, canvas.width / 2, 30);
} else if (message && Date.now() >= messageUntil) {
  message = "";
}



  timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  updateStats();

  // Auto-end for timed mode
  if (timingMode === "timed" && timeElapsed >= TIME_LIMIT_SEC) {
    gameRunning = false;
    displayEndScreen();
    return;
  }


  if (gameRunning) requestAnimationFrame(updateGame);
}

function drawApple(answer) {
  const x = answer.x - appleSize / 2;
  const y = answer.y - appleSize / 2;

  if (appleImg.complete && appleImg.naturalWidth) {
    ctx.drawImage(appleImg, x, y, appleSize, appleSize);
  } else {
    ctx.fillStyle = "#ff3b3b";
    ctx.beginPath();
    ctx.arc(answer.x, answer.y, appleSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.strokeText(String(answer.value), answer.x, answer.y + 10);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(answer.value), answer.x, answer.y + 10);
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#7bdff2");
  g.addColorStop(0.65, "#b2f7ef");
  g.addColorStop(1, "#e8f7ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCloud(70, 70, 1);
  drawCloud(280, 55, 0.9);
  drawCloud(210, 120, 0.8);

  ctx.fillStyle = "rgba(46, 204, 113, 0.55)";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
}

function drawCloud(cx, cy, s) {
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2);
  ctx.arc(cx + 25 * s, cy + 4 * s, 18 * s, 0, Math.PI * 2);
  ctx.arc(cx - 25 * s, cy + 6 * s, 16 * s, 0, Math.PI * 2);
  ctx.arc(cx + 5 * s, cy + 12 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updateStats() {
  const tSec = Math.max(timeElapsed, 1);
  const speedRate = totalAttempts / (tSec / 60);
  const accuracyRate = totalAttempts === 0 ? 0 : (correctResponses / totalAttempts) * 100;
  const fluencyRate = speedRate * (accuracyRate / 100);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  set("time", String((timingMode === "timed") ? Math.max(0, TIME_LIMIT_SEC - timeElapsed) : timeElapsed));
  set("attempts", String(totalAttempts));
  set("correct", String(correctResponses));
  set("speed", isFinite(speedRate) ? speedRate.toFixed(2) : "0.00");
  set("accuracy", `${accuracyRate.toFixed(2)}%`);
  set("fluency", isFinite(fluencyRate) ? fluencyRate.toFixed(2) : "0.00");
}

function displayEndScreen() {
  const tSec = Math.max(timeElapsed, 1);
  const speedRate = totalAttempts / (tSec / 60);
  const accuracyRate = totalAttempts === 0 ? 0 : (correctResponses / totalAttempts) * 100;
  const fluencyRate = speedRate * (accuracyRate / 100);

  const tr = t();

  document.getElementById("game-container").innerHTML = `
    <div id="end-screen">
      <h1>${tr.end.title}</h1>
      <p>${tr.end.timeSpent}: ${timeElapsed} ${tr.stats.sec}</p>
      <p>${tr.end.totalAttempts}: ${totalAttempts}</p>
      <p>${tr.end.correct}: ${correctResponses}</p>
      <p>${tr.end.speedRate}: ${speedRate.toFixed(2)} ${tr.stats.perMin}</p>
      <p>${tr.end.accuracyRate}: ${accuracyRate.toFixed(2)}%</p>
      <p>${tr.end.fluencyRate}: ${fluencyRate.toFixed(2)}</p>
      <button onclick="location.reload()">${tr.end.playAgain}</button>
    </div>
  `;
}
