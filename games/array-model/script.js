/* =========================
   Kid-friendly bilingual UI
   English (UK) + 简体中文
   ========================= */

const I18N = {
  en: {
    title: "Multiplication Array Model",
    subtitle: "Build arrays, tap squares, and learn what rows × columns really means.",
    learnTitle: "Learn",
    practiceTitle: "Practise",

    selectRows: "Select rows",
    selectCols: "Select columns",
    generate: "Generate array",
    practiseMode: "Practise mode",
    backToLearn: "Back to Learn",

    practiceTableLabel: "Times table",
    practiceAnyTable: "Any",

    rowArrow: "Row →",
    colArrow: "↓ Column",

    tapHint: "Tip: Tap squares to count. You can tap again to unselect.",
    concept: "{rows} × {cols} means {rows} rows of {cols}.",
    equation: "{rows} × {cols} = {product}",

    selectedCount: "Selected count: {count}",

    question: "Look at the array. Choose the correct equation.",
    questionHint: "Tip: Rows first, columns second.",
    chooseEquation: "Choose the correct equation:",
    blankEquation: "____ × ____ = ____",
    blankAddition: "____ + ____ + … = ____",
    repeatedAdditionLabel: "Repeated addition:",
    multiplicationLabel: "Multiplication:",
    practiceExplain: "This array shows {rows} rows of {cols}.",
    practiceCorrectIs: "Correct: {eq}",
    practiceWrongIs: "Correct answer: {eq}",
    eqOption: "{a} × {b} = {product}",
    practiceCorrectChoice: "Correct! This array shows {rows} rows of {cols}. So {rows} × {cols} = {product}.",
    practiceWrongChoice: "Oops! This array shows {rows} rows of {cols}. The correct equation is {rows} × {cols} = {product}.",
    enterRows: "Enter rows",
    enterCols: "Enter columns",
    buildArray: "Build my array",
    totalSquares: "Total squares",
    submit: "Submit",
    newQuestion: "New question",

    alertInvalid: "Please enter valid row and column values.",
    correct: "✅ Correct! Well done!",
    incorrect: "❌ Not yet. Try again!",
    scoreboard: "Score: {correct}/{attempts}",
  },
  zh: {
    title: "乘法阵列模型",
    subtitle: "做阵列，点方格，真正理解「行 × 列」是什么意思。",
    learnTitle: "学习",
    practiceTitle: "练习",

    selectRows: "选择行数",
    selectCols: "选择列数",
    generate: "生成阵列",
    practiseMode: "练习模式",
    backToLearn: "回到学习",

    practiceTableLabel: "选择乘法表",
    practiceAnyTable: "不限",

    rowArrow: "行 →",
    colArrow: "↓ 列",

    tapHint: "提示：点击方格来计数，再点一次可以取消选择。",
    concept: "{rows} × {cols} 表示「{rows} 行，每行 {cols} 个」。",
    equation: "{rows} × {cols} = {product}",

    selectedCount: "已选数量：{count}",

    question: "看阵列，选出正确算式。",
    questionHint: "提示：先行，再列。",
    chooseEquation: "请选择正确的算式：",
    blankEquation: "____ × ____ = ____",
    blankAddition: "____ + ____ + … = ____",
    repeatedAdditionLabel: "重复加法：",
    multiplicationLabel: "乘法：",
    practiceExplain: "这个阵列是{rows}行，每行{cols}个。",
    practiceCorrectIs: "正确：{eq}",
    practiceWrongIs: "正确答案：{eq}",
    eqOption: "{a} × {b} = {product}",
    practiceCorrectChoice: "正确！这个阵列是{rows}行，每行{cols}个，所以 {rows} × {cols} = {product}。",
    practiceWrongChoice: "再想想！这个阵列是{rows}行，每行{cols}个。正确算式是 {rows} × {cols} = {product}。",
    enterRows: "输入行数",
    enterCols: "输入列数",
    buildArray: "生成我的阵列",
    totalSquares: "方格总数",
    submit: "提交",
    newQuestion: "新题目",

    alertInvalid: "请输入正确的行数和列数。",
    correct: "✅ 答对了！做得好！",
    incorrect: "❌ 还差一点，再试一次！",
    scoreboard: "得分：{correct}/{attempts}",
  }
};

let CURRENT_LANG = "en";

// Some browsers / embedded viewers block localStorage for file:// pages.
// If we don't guard it, the game crashes and nothing becomes clickable.
function safeGet(key){
  try { return window.localStorage.getItem(key); } catch(e) { return null; }
}

function safeSet(key, val){
  try { window.localStorage.setItem(key, val); } catch(e) { /* ignore */ }
}

function getSelectedTable(){
  const sel = document.getElementById("tableSelect");
  if (!sel) return null;
  const v = String(sel.value || "any");
  if (v === "any") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? clamp(n, 2, 10) : null;
}

function applySelectedTable(resetScore = true){
  PRACTICE_TABLE = getSelectedTable();
  safeSet("mmq_table", PRACTICE_TABLE === null ? "any" : String(PRACTICE_TABLE));

  if (resetScore){
    PRACTICE_SCORE = { correct: 0, attempts: 0 };
    PRACTICE_ANSWERED = false;
    updateScoreboard();
  }
}

// Practice state (quiz)
let PRACTICE_STATE = { rows: 0, cols: 0, mode: 'mul', order: [] };

// If set, practise questions will always include this times table (2–10).
// null means "any".
let PRACTICE_TABLE = null;

let LEARN_STATE = { rows: 0, cols: 0 };

let PRACTICE_SCORE = { correct: 0, attempts: 0 };
let PRACTICE_ANSWERED = false;

function updateScoreboard(){
  const el = document.getElementById("scoreboard");
  if (!el) return;
  el.innerText = t("scoreboard", { correct: PRACTICE_SCORE.correct, attempts: PRACTICE_SCORE.attempts });
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// Fit a grid with a left label column and top label row into its container (no page scrolling)
function fitGridWithLabels(gridEl, containerEl, rows, cols){
  if (!gridEl || !containerEl) return;
  const pad = 12;
  const availW = Math.max(0, containerEl.clientWidth - pad*2);
  const availH = Math.max(0, containerEl.clientHeight - pad*2);
  if (availW === 0 || availH === 0) return;

  const gap = 6;
  const maxCell = 110;
  const minCell = 14; // allow tiny cells on very small screens so the full array stays visible

  // Start with a reasonable label width, then shrink it if needed to fit
  const desiredLabel = clamp(availW * 0.22, 64, 140);

  const totalRows = rows + 1; // includes top label row
  // First pass: estimate cell size using desired label width
  const cellW0 = (availW - desiredLabel - gap * cols) / cols;
  const cellH0 = (availH - gap * (totalRows - 1)) / totalRows;
  let cell = Math.floor(Math.min(cellW0, cellH0, maxCell));
  cell = Math.max(minCell, cell); // do NOT clamp upwards (that causes clipping)

  // Now compute the largest label width that still fits with this cell size
  const labelMax = Math.max(40, Math.floor(availW - cols * cell - gap * cols));
  let label = Math.floor(Math.min(desiredLabel, labelMax));
  label = Math.max(40, label);

  gridEl.style.setProperty("--cell-size", `${cell}px`);
  gridEl.style.setProperty("--label-size", `${label}px`);
  gridEl.style.setProperty("--grid-gap", `${gap}px`);
  gridEl.style.gridTemplateColumns = `var(--label-size) repeat(${cols}, var(--cell-size))`;
}

// Fit a plain grid (no label row/col)
function fitGridPlain(gridEl, containerEl, rows, cols){
  if (!gridEl || !containerEl) return;
  const pad = 12;
  const availW = Math.max(0, containerEl.clientWidth - pad*2);
  const availH = Math.max(0, containerEl.clientHeight - pad*2);
  if (availW === 0 || availH === 0) return;

  const gap = 6;
  const minCell = 14;
  const maxCell = 140; // allow bigger practice boxes when space is available

  const cellW = (availW - gap * (cols - 1)) / cols;
  const cellH = (availH - gap * (rows - 1)) / rows;
  let cell = Math.floor(Math.min(cellW, cellH, maxCell));
  cell = Math.max(minCell, cell); // allow smaller if needed to prevent clipping

  gridEl.style.setProperty("--cell-size", `${cell}px`);
  gridEl.style.setProperty("--grid-gap", `${gap}px`);
  gridEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
}



function t(key, vars = {}) {
  const pack = I18N[CURRENT_LANG] || I18N.en;
  let s = pack[key] ?? I18N.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

function setLanguage(lang) {
  CURRENT_LANG = (lang === "zh") ? "zh" : "en";
  safeSet("mmq_lang", CURRENT_LANG);
  document.documentElement.lang = CURRENT_LANG === "zh" ? "zh-Hans" : "en-GB";
  if (document.body) document.body.dataset.lang = CURRENT_LANG;

  // Toggle chip active state
  const enBtn = document.getElementById("langEnBtn");
  const zhBtn = document.getElementById("langZhBtn");
  if (enBtn && zhBtn) {
    enBtn.classList.toggle("active", CURRENT_LANG === "en");
    zhBtn.classList.toggle("active", CURRENT_LANG === "zh");
  }

  applyTranslations();

  // Refresh dynamic texts so the current screen updates instantly
  refreshDynamicText();

  // Rebuild the learning grid so Row/Column stickers + row buttons update in the new language
  // (Yes, this resets selected squares — that's fine for kids' use.)
  try { generateArray(); } catch(e) {}

  // Refit practice grid and re-render model/options in the new language if needed
  const practiceScreen = document.getElementById("practiceScreen");
  const isPracticeVisible = practiceScreen && !practiceScreen.classList.contains("hidden");
  if (isPracticeVisible && PRACTICE_STATE.rows && PRACTICE_STATE.cols) {
    try { renderPracticeModel(PRACTICE_STATE.rows, PRACTICE_STATE.cols); } catch(e) {}
    try { renderPracticeOptions(false); } catch(e) {}
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerText = t(key);
  });
}

function refreshDynamicText() {
  // Learning screen dynamic
  const f1 = parseInt(document.getElementById("factor1")?.value || "0");
  const f2 = parseInt(document.getElementById("factor2")?.value || "0");

  if (!isNaN(f1) && !isNaN(f2) && f1 > 0 && f2 > 0) {
    const conceptNote = document.getElementById("conceptNote");
    if (conceptNote) conceptNote.innerText = t("concept", { rows: f1, cols: f2 });

    const eq = document.getElementById("multiplicationEquation");
    if (eq) eq.innerText = t("equation", { rows: f1, cols: f2, product: f1 * f2 });

    const rep = document.getElementById("repeatedAddition");
    if (rep) rep.innerText = formatRepeatedAdditionEq(f1, f2);
  }

  // Selected count labels
  const selectedCountEl = document.getElementById("selectedCount");
  if (selectedCountEl) {
    const count = extractCountNumber(selectedCountEl.innerText);
    selectedCountEl.innerText = t("selectedCount", { count });
  }

  const practiceSelectedEl = document.getElementById("practiceSelectedCount");
  if (practiceSelectedEl) {
    const count = extractCountNumber(practiceSelectedEl.innerText);
    practiceSelectedEl.innerText = t("selectedCount", { count });
  }

  // Practice question / hint + option text
  const qEl = document.getElementById("question");
  const qHint = document.getElementById("questionHint");
  const r = PRACTICE_STATE.rows;
  const c = PRACTICE_STATE.cols;
  if (qEl && r > 0 && c > 0) qEl.innerText = t("question", { rows: r, cols: c });
  if (qHint && r > 0 && c > 0) qHint.innerText = t("questionHint", { rows: r, cols: c });

  // If we're on practice screen, re-render options in the current language
  const practiceScreen = document.getElementById("practiceScreen");
  const isPracticeVisible = practiceScreen && !practiceScreen.classList.contains("hidden");
  if (isPracticeVisible && r > 0 && c > 0) {
    renderPracticeOptions(false);
  }
}


function extractCountNumber(text) {
  const m = String(text).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/* =========================
   Confetti (tiny celebration)
   ========================= */
function confetti() {
  const layer = document.getElementById("confettiLayer");
  if (!layer) return;

  // Slower, gentler celebration: falling stars + ribbons
  const emojis = ["⭐", "🌟", "✨", "🎀", "🎗️"];
  const n = 26;

  for (let i = 0; i < n; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    // position + motion
    const left = Math.random() * 100;
    const dur = 3.8 + Math.random() * 2.2; // 3.8s–6.0s
    const dx = (Math.random() * 160 - 80); // sway
    const size = 22 + Math.random() * 10;

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.setProperty("--dur", `${dur}s`);
    el.style.setProperty("--dx", `${dx}px`);

    layer.appendChild(el);

    setTimeout(() => el.remove(), (dur * 1000) + 300);
  }
}


function randomPraise() {
  const PRAISE = {
    en: ["Brilliant!", "Well done!", "Super!", "Amazing!", "Fantastic!", "Great job!"],
    zh: ["太棒了！", "真厉害！", "做得好！", "超级棒！", "非常好！"]
  };
  const arr = PRAISE[CURRENT_LANG] || PRAISE.en;
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSumString(addend, times) {
  if (!Number.isFinite(addend) || !Number.isFinite(times) || addend < 1 || times < 1) return "";
  if (times === 1) return String(addend);
  const maxExplicit = 6;
  if (times <= maxExplicit) {
    return Array.from({ length: times }, () => String(addend)).join(" + ");
  }
  // show first 3 terms then ellipsis
  return `${addend} + ${addend} + ${addend} + …`;
}

function formatMulEq(rows, cols) {
  const product = rows * cols;
  return `${rows} × ${cols} = ${product}`;
}

function formatRepeatedAdditionEq(rows, cols) {
  // rows × cols means rows groups of cols: cols + cols + ... (rows times)
  const sumStr = buildSumString(cols, rows);
  return `${rows} × ${cols} = ${sumStr}`;
}

/* =========================
   Core game functions
   ========================= */

// Array squares: default light grey, selected = light green
function paintCell(cell){
  // Ensure no per-cell colour; CSS handles default + selected states
  cell.style.removeProperty("--cell-bg");
}

function generateArray() {
  // Defensive parsing: if a kid deletes the number, we don't want the whole grid to break.
  const rowsRaw = parseInt(document.getElementById("factor1")?.value || "", 10);
  const colsRaw = parseInt(document.getElementById("factor2")?.value || "", 10);
  const rows = clamp(Number.isFinite(rowsRaw) ? rowsRaw : 2, 1, 10);
  const cols = clamp(Number.isFinite(colsRaw) ? colsRaw : 3, 1, 10);

  // Write back the cleaned values so the UI stays consistent.
  const rEl = document.getElementById("factor1");
  const cEl = document.getElementById("factor2");
  if (rEl) rEl.value = String(rows);
  if (cEl) cEl.value = String(cols);
  const grid = document.getElementById("arrayModel");
  const equationDisplay = document.getElementById("multiplicationEquation");
  const repeatedEl = document.getElementById("repeatedAddition");
  const conceptNote = document.getElementById("conceptNote");

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `var(--label-size) repeat(${cols}, var(--cell-size))`;

  // Top-left label cell
  const emptyCell = document.createElement("div");
  emptyCell.className = "label-cell corner-cell";
  // Show Row/Column guides (no more blank box)
  const axis = document.createElement("div");
  axis.className = "corner-axis";
  const rowS = document.createElement("div");
  rowS.className = "corner-sticker";
  rowS.innerText = t("rowArrow");
  const colS = document.createElement("div");
  colS.className = "corner-sticker";
  colS.innerText = t("colArrow");
  axis.appendChild(rowS);
  axis.appendChild(colS);
  emptyCell.appendChild(axis);
  grid.appendChild(emptyCell);

  // Column labels
  for (let c = 1; c <= cols; c++) {
    const colLabel = document.createElement("div");
    // Keep spacing but remove the 1,2,3... labels (kids don't need the numbers here)
    colLabel.className = "label-cell col-label-cell";
    colLabel.innerText = "";
    grid.appendChild(colLabel);
  }

  let selectedCount = 0;
  const countDisplay = document.getElementById("selectedCount");

  const updateCount = () => {
    countDisplay.innerText = t("selectedCount", { count: selectedCount });
  };

  const setCellSelected = (cell, shouldSelect) => {
    const isSelected = cell.dataset.selected === "true";
    if (shouldSelect && !isSelected) {
      cell.dataset.selected = "true";
      cell.classList.add("selected");
      selectedCount++;
    } else if (!shouldSelect && isSelected) {
      cell.dataset.selected = "false";
      cell.classList.remove("selected");
      selectedCount--;
    }
  };

  // Initialise count
  updateCount();

  // Remember and fit into viewport (no scrolling)
  LEARN_STATE = { rows, cols };
  const learnWrap = document.getElementById('arrayContainer');
  // defer one frame so layout is ready
  requestAnimationFrame(() => fitGridWithLabels(grid, learnWrap, rows, cols));

  // Grid cells (no Row 1/Row 2 buttons; only the corner stickers remain)
  for (let r = 1; r <= rows; r++) {
    // left spacer cell (keeps alignment but stays invisible)
    const rowSpacer = document.createElement("div");
    rowSpacer.className = "label-cell row-spacer";
    rowSpacer.innerText = "";
    grid.appendChild(rowSpacer);

    for (let c = 1; c <= cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      paintCell(cell, r, c);

      cell.dataset.selected = "false";
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);

      cell.addEventListener("click", function () {
        const shouldSelect = cell.dataset.selected === "false";
        setCellSelected(cell, shouldSelect);
        updateCount();
      });

      grid.appendChild(cell);
    }
  }

  // Text above the model
  conceptNote.innerText = t("concept", { rows, cols });
  equationDisplay.innerText = t("equation", { rows, cols, product: rows * cols });
  if (repeatedEl) repeatedEl.innerText = formatRepeatedAdditionEq(rows, cols);
}



// Switching between screens
function switchToPractice() {
  // reset score when starting a new practice set
  PRACTICE_SCORE = { correct: 0, attempts: 0 };
  PRACTICE_ANSWERED = false;
  updateScoreboard();
  document.getElementById("learningScreen").classList.add("hidden");
  document.getElementById("practiceScreen").classList.remove("hidden");
  newPracticeQuestion();
}

function getSelectedTable(){
  const sel = document.getElementById('tableSelect');
  if (!sel) return null;
  const v = String(sel.value || 'any');
  if (v === 'any') return null;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return clamp(n, 2, 10);
}

function setSelectedTable(n){
  const sel = document.getElementById('tableSelect');
  if (!sel) return;
  if (n === null) sel.value = 'any';
  else sel.value = String(clamp(n, 2, 10));
}

function switchToLearning() {
  document.getElementById("practiceScreen").classList.add("hidden");
  document.getElementById("learningScreen").classList.remove("hidden");
  // Keep things consistent after language switches
  refreshDynamicText();
}

// Practice mode: show the model, then choose the correct equation
function newPracticeQuestion() {
  PRACTICE_ANSWERED = false;
  updateScoreboard();

  // If a times table is selected, always include it in the question.
  // Keep arrays within 1..10 so they fit nicely on screen.
  let rows, cols;
  if (PRACTICE_TABLE !== null) {
    const other = Math.floor(Math.random() * 10) + 1; // 1..10
    // Randomise whether the chosen table appears as rows or columns
    if (Math.random() < 0.5) {
      rows = PRACTICE_TABLE;
      cols = other;
    } else {
      rows = other;
      cols = PRACTICE_TABLE;
    }
  } else {
    // "Any" mode: smaller arrays keep it quick
    rows = Math.floor(Math.random() * 5) + 1;
    cols = Math.floor(Math.random() * 5) + 1;
  }

  PRACTICE_STATE.rows = rows;
  PRACTICE_STATE.cols = cols;

  // Randomly choose the question type:
  // - 'mul' : choose between r×c and c×r
  // - 'add' : choose between (c+c+...) and (r+r+...)
  PRACTICE_STATE.mode = (Math.random() < 0.5) ? "mul" : "add";

  const q = document.getElementById("question");
  const qHint = document.getElementById("questionHint");
  if (q) q.innerText = t("question", { rows, cols });
  if (qHint) qHint.innerText = t("questionHint", { rows, cols });

  const feedback = document.getElementById("feedback");
  if (feedback) {
    feedback.classList.remove("ok", "bad");
    feedback.innerText = "";
  }

  const rep = document.getElementById("practiceRepresentation");
  if (rep) { rep.classList.add("hidden"); rep.innerText = ""; }

  renderPracticeModel(rows, cols);
  renderPracticeOptions(true);
}

// Show the array model already "revealed" (filled boxes)
function renderPracticeModel(rows, cols) {
  const arrayContainer = document.getElementById("practiceArrayModel");
  if (!arrayContainer) return;

  arrayContainer.innerHTML = "";
  arrayContainer.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell selected locked";
      cell.dataset.selected = "true";
      paintCell(cell, r, c);
      arrayContainer.appendChild(cell);
    }
  }

  // Fit into the available viewport area (no scrolling)
  const pWrap = document.getElementById("practiceArrayContainer");
  requestAnimationFrame(() => fitGridPlain(arrayContainer, pWrap, rows, cols));
}

function optionLabel(opt, product) {
  if (opt.kind === "mul") {
    return t("eqOption", { a: opt.a, b: opt.b, product });
  }
  // add
  return `${opt.sum} = ${product}`;
}

// Build 2 options.
// mode 'mul': rows×cols (correct) vs cols×rows (wrong concept for this array)
// mode 'add': cols+cols+... (rows times) (correct) vs rows+rows+... (cols times) (wrong concept)
function renderPracticeOptions(reshuffle = false) {
  const rows = PRACTICE_STATE.rows;
  const cols = PRACTICE_STATE.cols;
  const product = rows * cols;

  const container = document.getElementById("practiceOptions");
  const blank = document.getElementById("practiceEquationBlank");
  if (!container) return;

  // Keep the same order on language switch; reshuffle only for new question
  let order = PRACTICE_STATE.order;
  if (reshuffle || !Array.isArray(order) || order.length !== 2) {
    if (PRACTICE_STATE.mode === "add") {
      const correctSum = buildSumString(cols, rows); // rows groups of cols
      const wrongSum = buildSumString(rows, cols);   // cols groups of rows (wrong meaning)
      order = [
        { kind: "add", sum: correctSum, correct: true },
        { kind: "add", sum: wrongSum, correct: false }
      ];
    } else {
      order = [
        { kind: "mul", a: rows, b: cols, correct: true },
        { kind: "mul", a: cols, b: rows, correct: false }
      ];
    }
    if (Math.random() < 0.5) order.reverse();
    PRACTICE_STATE.order = order;
  }

  // Update the blank template depending on the mode
  if (blank) {
    blank.innerText = (PRACTICE_STATE.mode === "add") ? t("blankAddition") : t("blankEquation");
  }

  container.innerHTML = "";
  order.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn option-btn";
    btn.innerText = optionLabel(opt, product);

    btn.dataset.correct = opt.correct ? "true" : "false";
    btn.dataset.kind = opt.kind;

    // Store extra data for feedback
    if (opt.kind === "mul") {
      btn.dataset.a = String(opt.a);
      btn.dataset.b = String(opt.b);
    } else {
      btn.dataset.sum = opt.sum;
    }

    btn.addEventListener("click", () => handlePracticeChoice(btn));
    container.appendChild(btn);
  });
}

function handlePracticeChoice(clickedBtn) {
  if (PRACTICE_ANSWERED) return;
  PRACTICE_ANSWERED = true;

  const rows = PRACTICE_STATE.rows;
  const cols = PRACTICE_STATE.cols;
  const product = rows * cols;

  const container = document.getElementById("practiceOptions");
  const feedback = document.getElementById("feedback");
  const rep = document.getElementById("practiceRepresentation");
  if (!container || !feedback) return;

  // Disable buttons after choosing
  const buttons = Array.from(container.querySelectorAll("button"));
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("disabled");
    btn.classList.remove("correct", "wrong");
  });

  const isCorrect = clickedBtn.dataset.correct === "true";

  PRACTICE_SCORE.attempts += 1;
  if (isCorrect) PRACTICE_SCORE.correct += 1;
  updateScoreboard();

  // Always show which one is correct (green), and if wrong chosen, mark it red
  const correctBtn = buttons.find((btn) => btn.dataset.correct === "true");
  if (correctBtn) correctBtn.classList.add("correct");
  if (!isCorrect) clickedBtn.classList.add("wrong");

  // Build correct equation string based on the mode
  const correctEq = (PRACTICE_STATE.mode === "add")
    ? `${buildSumString(cols, rows)} = ${product}`
    : formatMulEq(rows, cols);

  if (isCorrect) {
    feedback.classList.remove("bad");
    feedback.classList.add("ok");
    feedback.innerText = `${randomPraise()} ${t("practiceExplain", { rows, cols })} ${t("practiceCorrectIs", { eq: correctEq })}`;
    confetti();
  } else {
    feedback.classList.remove("ok");
    feedback.classList.add("bad");
    feedback.innerText = `${t("practiceExplain", { rows, cols })} ${t("practiceWrongIs", { eq: correctEq })}`;
  }

  // After answering, show the other representation (so kids connect the ideas)
  if (rep) {
    if (PRACTICE_STATE.mode === "add") {
      rep.innerText = `${t("multiplicationLabel")} ${formatMulEq(rows, cols)}`;
    } else {
      rep.innerText = `${t("repeatedAdditionLabel")} ${formatRepeatedAdditionEq(rows, cols)}`;
    }
    rep.classList.remove("hidden");
  }
}

function generatePracticeArray() { newPracticeQuestion(); }
function checkPracticeAnswer() { return; }

/* =========================
   Boot
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const urlLangRaw = (params.get("lang") || "").toLowerCase();
  const urlLang = ["zh", "zh-cn", "zh-hans"].includes(urlLangRaw) ? "zh" : (["en", "en-gb", "en-us"].includes(urlLangRaw) ? "en" : "");
  const saved = safeGet("mmq_lang");
  const initial = urlLang || ((saved === "zh" || saved === "en") ? saved : (navigator.language || "").toLowerCase().includes("zh") ? "zh" : "en");

  // Restore table selection
  const tableSaved = safeGet("mmq_table");
  const tableSel = document.getElementById("tableSelect");
  if (tableSel) {
    tableSel.value = (tableSaved === "2" || tableSaved === "3" || tableSaved === "4" || tableSaved === "5" || tableSaved === "6" || tableSaved === "7" || tableSaved === "8" || tableSaved === "9" || tableSaved === "10")
      ? tableSaved
      : "any";
    tableSel.addEventListener("change", () => {
      applySelectedTable(true);
      // If already in practice screen, start a fresh question for the new table
      const practiceScreen = document.getElementById("practiceScreen");
      const isPracticeVisible = practiceScreen && !practiceScreen.classList.contains("hidden");
      if (isPracticeVisible) newPracticeQuestion();
    });
  }
  applySelectedTable(false);

  // Hook up language buttons
  const enBtn = document.getElementById("langEnBtn");
  const zhBtn = document.getElementById("langZhBtn");
  if (enBtn) enBtn.addEventListener("click", () => setLanguage("en"));
  if (zhBtn) zhBtn.addEventListener("click", () => setLanguage("zh"));

  setLanguage(initial);
  generateArray();
  updateScoreboard();

  const learnWrap = document.getElementById('arrayContainer');
  const learnGrid = document.getElementById('arrayModel');
  const pWrap = document.getElementById('practiceArrayContainer');
  const pGrid = document.getElementById('practiceArrayModel');

  const refitAll = () => {
    if (LEARN_STATE.rows && learnWrap && learnGrid) fitGridWithLabels(learnGrid, learnWrap, LEARN_STATE.rows, LEARN_STATE.cols);
    if (PRACTICE_STATE.rows && pWrap && pGrid) fitGridPlain(pGrid, pWrap, PRACTICE_STATE.rows, PRACTICE_STATE.cols);
  };

  // ResizeObserver catches layout changes without page scroll
  if (window.ResizeObserver){
    const ro = new ResizeObserver(() => refitAll());
    if (learnWrap) ro.observe(learnWrap);
    if (pWrap) ro.observe(pWrap);
  }
  window.addEventListener('resize', refitAll);
});
