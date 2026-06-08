
let selectedTable = 2;
let selectedTables = [2];
let mode = "single"; // "single" | "mixed"

let score = 0, attempts = 0, correctCount = 0, startTime;
let gameTimer;

let questionLocked = false;
let questionTimeoutId = null;

const TOTAL_ATTEMPTS = 20;

// keep last question so language switching won't feel weird mid-game
let currentNum = null;
let currentTable = null;

let lang = "en";

// Gameplay speed
let speedMode = "moderate"; // "slow" | "moderate" (Medium) | "fast"

// Time mode
let timeMode = "untimed"; // "timed" | "untimed"

// Allow START_HERE.html to open this game directly as timed/untimed.
// Example: index.html?mode=untimed&lockTiming=1
const launchParams = new URLSearchParams(window.location.search);
const requestedLang = (launchParams.get("lang") || "").toLowerCase();
if (["zh", "zh-cn", "zh-hans"].includes(requestedLang)) {
  lang = "zh";
} else if (["en", "en-gb", "en-us"].includes(requestedLang)) {
  lang = "en";
}
const requestedTimeMode = launchParams.get("mode") || launchParams.get("timing");
if (requestedTimeMode === "timed" || requestedTimeMode === "untimed") {
  timeMode = requestedTimeMode;
}
const lockTiming = launchParams.get("lockTiming") === "1" || launchParams.get("slot") === "procedural" || launchParams.get("slot") === "competency";

// Timed mode = whole-game countdown
const TIME_LIMIT_SEC = 60;
let elapsedSec = 0;
let remainingSec = TIME_LIMIT_SEC;

// Player can only end the game after this many attempts
const MIN_END_ATTEMPTS = 10;

const speedConfig = {
  slow:     { floatSec: 13.0, timeoutMs: 12000 },
  moderate: { floatSec: 10.0, timeoutMs:  9000 },
  fast:     { floatSec:  7.6, timeoutMs:  7500 }
};

const i18n = {
  en: {
    mainTitle: "Popubbles!",
    mainSubtitle: "Pick a times table, then pop the correct answer balloon 🎈",
    speedTitle: "Choose game speed",
    speedNote: "Tip: Slow is best for beginners. Fast is for speed stars.",
    speedSlow: "Slow",
    speedModerate: "Medium",
    speedFast: "Fast",
    timeTitle: "Time mode",
    timeTimed: "Timed",
    timeUntimed: "Untimed",
    endGame: "End Game",
    endGameLocked: "Answer at least 10 questions first 😄",
    rulesTitle: "Game Rules",
    rule1: "Select a multiplication table to start the game.",
    rule2: "Click the correct balloon with the right answer.",
    rule3: "You have a total of <b>20 attempts</b>.",
    rule4: "Each correct answer earns you points.",
    rule5: "Try to be quick and accurate for a high score!",
    singlePickerTitle: "Choose your times table",
    mixedPickerTitle: "Mixed times tables",
    mixedExplain: "Choose exactly <b>3</b> times tables to mix. You will play 20 attempts.",
    startMixed: "Start Mixed Game",
    qLabel: "Question",
    labelScore: "Score",
    labelTime: "Time",
    seconds: "sec",
    labelAttempt: "Attempt",
    resultTitle: "Game Over!",
    resultSubtitle: "Nice work. Want to beat your score?",
    labelFinalTime: "Time Spent",
    labelCorrect: "Correct Responses",
    labelSpeed: "Speed Rate",
    labelAccuracy: "Accuracy Rate",
    labelFluency: "Frequency Rate",
    playAgain: "Play Again",
    timesTableBtn: (n) => `Times Table ${n}`,
    popupCorrect: "🎉 Well done!",
    popupHint: ({ q, ans }) => `💡 Hint: ${q} = ${ans}`,
    popupTimeUp: ({ q, ans }) => `⏰ Time\u2019s up! ${q} = ${ans}`,
    mixedCountLabel: (c) => `${c}/3`
  },
  zh: {
    mainTitle: "乘法气球乐园！",
    mainSubtitle: "选择乘法表，然后戳破写着正确答案的气球 🎈",
    speedTitle: "选择速度",
    speedNote: "小贴士：慢速适合新手，快速适合挑战高手。",
    speedSlow: "慢速",
    speedModerate: "中速",
    speedFast: "快速",
    timeTitle: "计时模式",
    timeTimed: "计时",
    timeUntimed: "不计时",
    endGame: "结束游戏",
    endGameLocked: "先完成至少 10 题才可以结束哦 😄",
    rulesTitle: "游戏规则",
    rule1: "选择一个乘法表开始游戏。",
    rule2: "点击写着正确答案的气球。",
    rule3: "你一共有 <b>20 次机会</b>。",
    rule4: "答对就得分。",
    rule5: "又快又准，分数更高！",
    singlePickerTitle: "选择乘法表",
    mixedPickerTitle: "混合乘法表",
    mixedExplain: "选择 <b>3 个</b>乘法表混合出题。共 20 题。",
    startMixed: "开始混合模式",
    qLabel: "题目",
    labelScore: "得分",
    labelTime: "时间",
    seconds: "秒",
    labelAttempt: "题号",
    resultTitle: "游戏结束！",
    resultSubtitle: "表现不错，要不要再挑战一次？",
    labelFinalTime: "用时",
    labelCorrect: "答对题数",
    labelSpeed: "速度",
    labelAccuracy: "正确率",
    labelFluency: "流畅度",
    playAgain: "再玩一次",
    timesTableBtn: (n) => `${n} 的乘法表`,
    popupCorrect: "🎉 太棒了！",
    popupHint: ({ q, ans }) => `💡 提示：${q} = ${ans}`,
    popupTimeUp: ({ q, ans }) => `⏰ 时间到！${q} = ${ans}`,
    mixedCountLabel: (c) => `${c}/3`
  }
};

const balloonThemes = [
  { bg: "linear-gradient(180deg, #ffe66d, #ff9f1c)", color: "#0b1633" },
  { bg: "linear-gradient(180deg, #7cf2ff, #3a86ff)", color: "#06122a" },
  { bg: "linear-gradient(180deg, #ff4d6d, #ff9bd0)", color: "#240011" },
  { bg: "linear-gradient(180deg, #b8ff6a, #2ec4b6)", color: "#052022" },
  { bg: "linear-gradient(180deg, #c77dff, #7209b7)", color: "#ffffff" },
  { bg: "linear-gradient(180deg, #ffd6ff, #ff70a6)", color: "#2a0015" }
];

function t(key, vars) {
  const pack = i18n[lang] || i18n.en;
  const value = pack[key];
  if (typeof value === "function") return value(vars);
  return value ?? (i18n.en[key] ?? key);
}

function showScreen(screenId) {
  document.querySelectorAll(".menu, .game, .result").forEach(el => el.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");

  // Prevent page scroll during gameplay (fit-to-screen)
  document.body.classList.toggle("playing", screenId === "game");
}

function updateLangButtons() {
  const enBtn = document.getElementById("btn-en");
  const zhBtn = document.getElementById("btn-zh");
  if (!enBtn || !zhBtn) return;

  enBtn.classList.toggle("active", lang === "en");
  zhBtn.classList.toggle("active", lang === "zh");
}

function applyTranslations() {
  // menu
  const setText = (id, value, isHtml = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (isHtml) el.innerHTML = value;
    else el.textContent = value;
  };

  setText("main-title", t("mainTitle"));
  setText("main-subtitle", t("mainSubtitle"));

  // brand + browser title
  setText("brand", t("mainTitle"));
  document.title = t("mainTitle");

  // speed picker
  setText("speed-title", t("speedTitle"));
  setText("speed-note", t("speedNote"));
  setText("speed-slow", t("speedSlow"));
  setText("speed-moderate", t("speedModerate"));
  setText("speed-fast", t("speedFast"));

  // time mode picker
  setText("time-title", lockTiming
    ? (timeMode === "timed"
        ? (lang === "zh" ? "流畅度测评模式（限时）" : "Fluency Competency Mode (Timed)")
        : (lang === "zh" ? "程序练习模式（不限时）" : "Procedural Practice Mode (Untimed)"))
    : t("timeTitle"));
  setText("time-timed", t("timeTimed"));
  setText("time-untimed", t("timeUntimed"));

  // in-game speed control
  setText("label-speed-mode", lang === "zh" ? "速度" : "Speed");
  setText("in-speed-slow", t("speedSlow"));
  setText("in-speed-moderate", t("speedModerate"));
  setText("in-speed-fast", t("speedFast"));

  // in-game time control
  setText("label-time-mode", lang === "zh" ? "计时" : "Time" );
  setText("in-time-timed", t("timeTimed"));
  setText("in-time-untimed", t("timeUntimed"));
  setText("rules-title", t("rulesTitle"));
  setText("rule-1", t("rule1"));
  setText("rule-2", t("rule2"));
  const rule3 = (timeMode === "timed")
    ? (lang === "zh"
        ? "计时模式：在 <b>60 秒</b> 内尽量多答题（不限题数）。"
        : "Timed mode: pop as many as you can in <b>60 seconds</b> (no attempt limit).")
    : t("rule3");
  setText("rule-3", rule3, true);
  setText("rule-4", t("rule4"));
  setText("rule-5", t("rule5"));
  setText("single-picker-title", t("singlePickerTitle"));
  setText("mixed-picker-title", t("mixedPickerTitle"));
  const mixedExplain = (timeMode === "timed")
    ? (lang === "zh"
        ? "选择 <b>3 个</b>乘法表混合出题。在 <b>60 秒</b> 内尽量多答题（不限题数）。"
        : "Choose exactly <b>3</b> times tables to mix. You have <b>60 seconds</b> (no attempt limit).")
    : t("mixedExplain");
  setText("mixed-explain", mixedExplain, true);

  // game labels
  setText("q-label", t("qLabel"));
  setText("label-score", t("labelScore"));
  setText("label-time", t("labelTime"));
  setText("label-seconds", t("seconds"));
  setText("label-attempt", t("labelAttempt"));

  // result labels
  setText("result-title", t("resultTitle"));
  setText("result-subtitle", t("resultSubtitle"));
  setText("label-final-time", t("labelFinalTime"));
  setText("label-seconds-2", t("seconds"));
  setText("label-correct", t("labelCorrect"));
  setText("label-speed", t("labelSpeed"));
  setText("label-accuracy", t("labelAccuracy"));
  setText("label-fluency", t("labelFluency"));
  setText("btn-play-again", t("playAgain"));

  // rebuild buttons so labels match language
  generateTableButtons();
  generateMixedPicker();

  // keep the current question text consistent with active language (math stays same)
  if (currentNum !== null && currentTable !== null) {
    setQuestionText(currentNum, currentTable);
  }

  // mixed start button label
  const startMixedBtn = document.getElementById("start-mixed-btn");
  if (startMixedBtn) startMixedBtn.textContent = t("startMixed");

  const endBtn = document.getElementById("end-game-btn");
  if (endBtn) endBtn.textContent = t("endGame");
}

function updateSpeedUI() {
  const slowBtn = document.getElementById("speed-slow");
  const modBtn = document.getElementById("speed-moderate");
  const fastBtn = document.getElementById("speed-fast");
  if (!slowBtn || !modBtn || !fastBtn) return;

  slowBtn.classList.toggle("selected", speedMode === "slow");
  modBtn.classList.toggle("selected", speedMode === "moderate");
  fastBtn.classList.toggle("selected", speedMode === "fast");

  // mini controls (in-game)
  const inSlow = document.getElementById("in-speed-slow");
  const inMod = document.getElementById("in-speed-moderate");
  const inFast = document.getElementById("in-speed-fast");
  if (inSlow) inSlow.classList.toggle("selected", speedMode === "slow");
  if (inMod) inMod.classList.toggle("selected", speedMode === "moderate");
  if (inFast) inFast.classList.toggle("selected", speedMode === "fast");
}

function updateTimeUI() {
  const timedBtn = document.getElementById("time-timed");
  const untimedBtn = document.getElementById("time-untimed");
  if (timedBtn) {
    timedBtn.classList.toggle("selected", timeMode === "timed");
    if (lockTiming) timedBtn.disabled = timeMode !== "timed";
  }
  if (untimedBtn) {
    untimedBtn.classList.toggle("selected", timeMode === "untimed");
    if (lockTiming) untimedBtn.disabled = timeMode !== "untimed";
  }

  // in-game mini controls
  const inTimed = document.getElementById("in-time-timed");
  const inUntimed = document.getElementById("in-time-untimed");
  if (inTimed) {
    inTimed.classList.toggle("selected", timeMode === "timed");
    if (lockTiming) inTimed.disabled = timeMode !== "timed";
  }
  if (inUntimed) {
    inUntimed.classList.toggle("selected", timeMode === "untimed");
    if (lockTiming) inUntimed.disabled = timeMode !== "untimed";
  }
}

function setTimeMode(newMode) {
  const m = (newMode === "timed") ? "timed" : "untimed";
  if (lockTiming && m !== timeMode) return;
  timeMode = m;
  updateTimeUI();
  // Update rule text that depends on time mode.
  applyTranslations();
  updateAttemptUI();
  updateProgress();

  // If the player switches to untimed mid-question, kill the current timeout immediately
  if (m === "untimed" && questionTimeoutId) {
    clearTimeout(questionTimeoutId);
    questionTimeoutId = null;
  }

  // If user changes time mode mid-question, apply from next question
  if (document.getElementById("game")?.classList.contains("active") && !questionLocked) {
    showPopup(
      (lang === "zh")
        ? (m === "timed" ? "✅ 已切换为计时模式，将从下一题开始生效" : "✅ 已切换为不计时模式，将从下一题开始生效")
        : (m === "timed" ? "✅ Switched to timed mode. Applies from the next question." : "✅ Switched to untimed mode. Applies from the next question."),
      "green"
    );
  }
}

function setSpeedMode(newMode) {
  const m = (newMode === "slow" || newMode === "fast") ? newMode : "moderate";
  speedMode = m;
  updateSpeedUI();

  // If user changes speed mid-question, keep it simple: apply to next question
  if (document.getElementById("game")?.classList.contains("active") && !questionLocked) {
    showPopup(lang === "zh" ? "✅ 速度已设置，将从下一题开始生效" : "✅ Speed set. Applies from the next question.", "green");
  }
}

function updateEndGameButton() {
  const endBtn = document.getElementById("end-game-btn");
  if (!endBtn) return;
  endBtn.disabled = attempts < MIN_END_ATTEMPTS;
}

function updateAttemptUI() {
  const aEl = document.getElementById("attempt");
  const tEl = document.getElementById("attempt-total");
  const shown = (timeMode === "timed") ? (attempts + 1) : Math.min(TOTAL_ATTEMPTS, attempts + 1);
  if (aEl) aEl.innerText = shown;
  if (tEl) tEl.textContent = (timeMode === "timed") ? "" : `/${TOTAL_ATTEMPTS}`;
}


function setQuestionText(num, table) {
  const qEl = document.getElementById("question");
  if (!qEl) return;
  qEl.textContent = `${num} × ${table} = ?`;
}

function updateProgress() {
  const bar = document.getElementById("progress-bar");
  if (!bar) return;
  // Untimed: progress by attempts (20).
  // Timed: progress by time (60s).
  const pct = (timeMode === "timed")
    ? Math.min(100, Math.max(0, (elapsedSec / TIME_LIMIT_SEC) * 100))
    : Math.min(100, Math.max(0, (attempts / TOTAL_ATTEMPTS) * 100));
  bar.style.width = pct + "%";
}

function startGameCore() {
  score = 0;
  attempts = 0;
  correctCount = 0;

  document.getElementById("score").innerText = score;
  updateAttemptUI();
  // timer display: countdown for timed mode, stopwatch for untimed mode
  elapsedSec = 0;
  remainingSec = TIME_LIMIT_SEC;
  document.getElementById("timer").innerText = (timeMode === "timed") ? TIME_LIMIT_SEC : 0;

  updateProgress();
  updateEndGameButton();

  questionLocked = false;
  clearTimeout(questionTimeoutId);
  questionTimeoutId = null;

  startTime = Date.now();
  clearInterval(gameTimer);
  gameTimer = setInterval(updateTimer, 1000);

  showScreen("game");
  generateQuestion();
}

function startSingleGame(table) {
  mode = "single";
  selectedTable = table;
  selectedTables = [table];
  startGameCore();
}

function startMixedGame(tablesArr) {
  mode = "mixed";
  selectedTables = [...tablesArr];
  // keep selectedTable for safety
  selectedTable = selectedTables[0] || 2;
  startGameCore();
}

function updateTimer() {
  elapsedSec = Math.floor((Date.now() - startTime) / 1000);

  if (timeMode === "timed") {
    remainingSec = Math.max(0, TIME_LIMIT_SEC - elapsedSec);
    document.getElementById("timer").innerText = remainingSec;

    // time's up: end the game immediately
    if (remainingSec <= 0) {
      endGame();
    }
  } else {
    document.getElementById("timer").innerText = elapsedSec;
  }
}

function pickActiveTable() {
  if (mode === "mixed") {
    const idx = Math.floor(Math.random() * selectedTables.length);
    return selectedTables[idx];
  }
  return selectedTable;
}

function generateQuestion() {
  // new question, allow one answer only
  questionLocked = false;
  clearTimeout(questionTimeoutId);
  questionTimeoutId = null;

  // IMPORTANT:
  // - Untimed mode ends after TOTAL_ATTEMPTS.
  // - Timed mode ends ONLY when the 60s countdown hits 0 (no attempt limit).
  if (timeMode !== "timed" && attempts >= TOTAL_ATTEMPTS) {
    setTimeout(endGame, 400);
    return;
  }

  const table = pickActiveTable();
  const num = Math.floor(Math.random() * 9) + 1; // 1 to 9 only

  currentNum = num;
  currentTable = table;

  const correctAnswer = table * num;
  setQuestionText(num, table);
  const questionShort = `${num} × ${table}`;

  const incorrectAnswers = new Set();
  while (incorrectAnswers.size < 3) {
    const randomMultiplier = Math.floor(Math.random() * 9) + 1; // 1 to 9 only
    const wrongAnswer = table * randomMultiplier;
    if (wrongAnswer !== correctAnswer) incorrectAnswers.add(wrongAnswer);
  }

  const answers = [...incorrectAnswers, correctAnswer];
  answers.sort(() => Math.random() - 0.5);

  const balloonsDiv = document.getElementById("balloons");
  balloonsDiv.innerHTML = "";

  const usedPositions = [];


  const cfg = speedConfig[speedMode] || speedConfig.moderate;

  // If all balloons float away (off screen) and no answer was chosen,
  // move straight to the next question with new options (counts as an attempt).
  let remainingBalloons = answers.length;
  const autoSkipBecauseGone = () => {
    if (questionLocked) return;
    questionLocked = true;
    clearTimeout(questionTimeoutId);
    questionTimeoutId = null;

    const balloonsDiv2 = document.getElementById("balloons");
    if (balloonsDiv2) balloonsDiv2.innerHTML = "";

    attempts++;
    updateEndGameButton();
    document.getElementById("score").innerText = score;
    updateAttemptUI();
    updateProgress();

    setTimeout(generateQuestion, 140);
  };

  answers.forEach((answer, idx) => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.setAttribute("role", "button");
    balloon.setAttribute("aria-label", `Answer option ${answer}`);

    // CSS balloon theme (no image files needed)
    const theme = balloonThemes[(idx + Math.floor(Math.random() * balloonThemes.length)) % balloonThemes.length];
    balloon.style.setProperty('--balloon-bg', theme.bg);
    balloon.style.setProperty('--balloon-text', theme.color);

    const numSpan = document.createElement("span");
    numSpan.className = "balloon-num";
    numSpan.textContent = String(answer);

    // No external image assets: bubble is fully CSS-drawn (glass + shine)
    // So we only add the number label.
    balloon.appendChild(numSpan);

    // When a balloon finishes floating, remove it. If all float away and
    // the player hasn’t answered, jump to the next question immediately.
    balloon.addEventListener("animationend", (e) => {
      if (e.animationName !== "float") return;
      if (!balloon.isConnected) return;
      balloon.remove();
      remainingBalloons = Math.max(0, remainingBalloons - 1);
      if (remainingBalloons === 0) autoSkipBecauseGone();
    });

    // speed based on mode + a little randomness
    const dur = Math.max(4.8, cfg.floatSec + (Math.random() * 1.2 - 0.6));
    balloon.style.animationDuration = dur + "s";
    balloon.style.setProperty("--drift", `${(Math.random() * 2 - 1) * 60}px`);

    let leftPosition;
    do {
      leftPosition = Math.random() * 80 + 10;
    } while (usedPositions.some(pos => Math.abs(pos - leftPosition) < 15));

    usedPositions.push(leftPosition);
    balloon.style.left = `${leftPosition}%`;

    balloon.onclick = () => {
      if (questionLocked) return;
      questionLocked = true;
      clearTimeout(questionTimeoutId);
      questionTimeoutId = null;
      popBalloon(balloon, answer, correctAnswer, questionShort);
    };

    balloonsDiv.appendChild(balloon);
  });

  // NOTE:
  // Timed mode is a whole-game 60-second countdown (not per-question timeout).
}

function popBalloon(balloon, selected, correct, questionShort) {
  balloon.style.animation = "pop 0.3s forwards";

  setTimeout(() => {
    balloon.remove();
    const balloonsDiv = document.getElementById("balloons");
    if (balloonsDiv) balloonsDiv.innerHTML = "";

    if (selected === correct) {
      score += 10;
      correctCount++;
      showPopup(t("popupCorrect"), "green");
    } else {
      if (!document.getElementById("result").classList.contains("active")) {
        showPopup(t("popupHint", { q: questionShort, ans: correct }), "red");
      }
    }

    attempts++;
    updateEndGameButton();
    document.getElementById("score").innerText = score;
    updateAttemptUI();
    updateProgress();

    // short pause for feedback
    setTimeout(generateQuestion, 520);
  }, 220);
}

function showPopup(message, color) {
  const existingPopup = document.getElementById("popup-message");
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement("div");
  popup.className = "popup-message";
  popup.id = "popup-message";
  popup.innerText = message;

  popup.style.background =
    color === "green" ? "rgba(24, 175, 97, 0.92)" : "rgba(255, 77, 109, 0.92)";

  document.body.appendChild(popup);

  setTimeout(() => {
    if (popup && popup.parentNode) popup.remove();
  }, 1100);
}

function confettiBurst(pieces = 45, durationMs = 1300) {
  const colors = ["#ffe66d", "#ff9f1c", "#7cf2ff", "#50ffb1", "#ff4d6d", "#c77dff"];
  const endAt = Date.now() + durationMs;

  const spawn = () => {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = (Math.random() * 100) + "vw";
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.transform = `rotate(${Math.random() * 360}deg)`;
    conf.style.animationDuration = (0.9 + Math.random() * 0.7) + "s";
    conf.style.width = (7 + Math.random() * 8) + "px";
    conf.style.height = (10 + Math.random() * 10) + "px";
    document.body.appendChild(conf);

    setTimeout(() => conf.remove(), 2000);
  };

  const tick = () => {
    if (Date.now() > endAt) return;
    spawn();
    spawn();
    requestAnimationFrame(tick);
  };

  tick();
}

function endGame() {
  clearInterval(gameTimer);
  clearTimeout(questionTimeoutId);
  questionTimeoutId = null;
  questionLocked = true;

  // time reporting
  // - untimed: stopwatch (elapsedSec)
  // - timed: countdown (TIME_LIMIT_SEC - remainingSec)
  const elapsedTime = (timeMode === "timed")
    ? Math.min(TIME_LIMIT_SEC, Math.max(0, TIME_LIMIT_SEC - remainingSec))
    : elapsedSec;
  const elapsedMinutes = elapsedTime / 60;

  const speedRate = attempts / (elapsedMinutes > 0 ? elapsedMinutes : 1);
  const accuracyRate = (correctCount / (attempts > 0 ? attempts : 1));
  const fluencyRate = speedRate * accuracyRate;

  document.getElementById("final-time").innerText = elapsedTime;
  document.getElementById("correct-answers").innerText = correctCount;
  document.getElementById("speed-rate").innerText = speedRate.toFixed(2);
  document.getElementById("accuracy-rate").innerText = (accuracyRate * 100).toFixed(2) + "%";
  document.getElementById("frequency-rate").innerText = fluencyRate.toFixed(2);

  showScreen("result");
  const existingPopup = document.getElementById("popup-message");
  if (existingPopup) existingPopup.remove();

  confettiBurst();
}

function restartGame() {
  // return to menu safely
  clearInterval(gameTimer);
  clearTimeout(questionTimeoutId);
  questionTimeoutId = null;
  questionLocked = false;
  currentNum = null;
  currentTable = null;
  const balloonsDiv = document.getElementById("balloons");
  if (balloonsDiv) balloonsDiv.innerHTML = "";
  const existingPopup = document.getElementById("popup-message");
  if (existingPopup) existingPopup.remove();
  showScreen("menu");
}

/* ===== Menu UI builders ===== */
function generateTableButtons() {
  const tablesDiv = document.getElementById("tables");
  if (!tablesDiv) return;

  tablesDiv.innerHTML = "";
  for (let i = 2; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = t("timesTableBtn", i);
    btn.onclick = () => startSingleGame(i);
    tablesDiv.appendChild(btn);
  }
}

/* Mixed mode selection */
const mixedSelected = new Set();

function updateMixedUI() {
  const countEl = document.getElementById("mixed-count");
  const startBtn = document.getElementById("start-mixed-btn");
  if (countEl) countEl.textContent = mixedSelected.size;
  if (startBtn) startBtn.disabled = mixedSelected.size !== 3;

  // keep selected styling
  document.querySelectorAll("button.table-chip").forEach(btn => {
    const table = Number(btn.dataset.table);
    btn.classList.toggle("selected", mixedSelected.has(table));
  });
}

function generateMixedPicker() {
  const mixedDiv = document.getElementById("mixed-tables");
  const startBtn = document.getElementById("start-mixed-btn");
  if (!mixedDiv || !startBtn) return;

  mixedDiv.innerHTML = "";

  for (let i = 2; i <= 9; i++) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "table-chip";
    chip.dataset.table = String(i);
    chip.textContent = t("timesTableBtn", i);

    chip.onclick = () => {
      const table = i;

      if (mixedSelected.has(table)) {
        mixedSelected.delete(table);
      } else {
        // max 3 tables
        if (mixedSelected.size >= 3) {
          // tiny nudge popup instead of harsh block
          showPopup(lang === "zh" ? "最多选 3 个哦 😄" : "Pick up to 3 tables 😄", "red");
          return;
        }
        mixedSelected.add(table);
      }
      updateMixedUI();
    };

    mixedDiv.appendChild(chip);
  }

  startBtn.onclick = () => {
    if (mixedSelected.size !== 3) return;
    startMixedGame([...mixedSelected]);
  };

  updateMixedUI();
}

/* ===== Language ===== */
function setLanguage(newLang) {
  lang = newLang === "zh" ? "zh" : "en";
  document.documentElement.lang = (lang === "zh") ? "zh-Hans" : "en-GB";
  updateLangButtons();
  applyTranslations();
  updateAttemptUI();
  updateProgress();
}

/* ===== Init ===== */
updateLangButtons();
applyTranslations();
  updateAttemptUI();
  updateProgress();

// speed buttons
document.getElementById("speed-slow")?.addEventListener("click", () => setSpeedMode("slow"));
document.getElementById("speed-moderate")?.addEventListener("click", () => setSpeedMode("moderate"));
document.getElementById("speed-fast")?.addEventListener("click", () => setSpeedMode("fast"));

// time mode buttons
document.getElementById("time-timed")?.addEventListener("click", () => setTimeMode("timed"));
document.getElementById("time-untimed")?.addEventListener("click", () => setTimeMode("untimed"));

// in-game speed buttons
document.getElementById("in-speed-slow")?.addEventListener("click", () => setSpeedMode("slow"));
document.getElementById("in-speed-moderate")?.addEventListener("click", () => setSpeedMode("moderate"));
document.getElementById("in-speed-fast")?.addEventListener("click", () => setSpeedMode("fast"));

// in-game time mode buttons
document.getElementById("in-time-timed")?.addEventListener("click", () => setTimeMode("timed"));
document.getElementById("in-time-untimed")?.addEventListener("click", () => setTimeMode("untimed"));
updateSpeedUI();
updateTimeUI();

// end game button (enabled after 10 questions)
document.getElementById("end-game-btn")?.addEventListener("click", () => {
  if (attempts < MIN_END_ATTEMPTS) {
    showPopup(t("endGameLocked"), "red");
    return;
  }
  endGame();
});
