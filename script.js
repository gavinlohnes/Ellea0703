// BEYOND v1 – Training + Nutrition + Weekly (Phase 4)

// ----------------------
// TRAINING ENGINE
// ----------------------

function getCoreMarkState(fatigueScore, recoveryScore, trainingLoadIndex) {
  if (fatigueScore >= 63 && trainingLoadIndex >= 78) {
    return "OVERLOAD";
  } else if (fatigueScore >= 40 || recoveryScore <= 55) {
    return "RECOVERY";
  } else {
    return "ACTIVE";
  }
}

const datasetA = {
  label: "Dataset A – Stable Training (Expected ACTIVE)",
  fatigueScore: 26.4,
  recoveryScore: 83.3,
  trainingLoadIndex: 57.4,
  performanceDelta: 0.3
};

const datasetB = {
  label: "Dataset B – Accumulated Fatigue (Expected OVERLOAD)",
  fatigueScore: 67.6,
  recoveryScore: 44.6,
  trainingLoadIndex: 83.8,
  performanceDelta: -0.173
};

function renderOutput(dataset) {
  const coreMarkState = getCoreMarkState(
    dataset.fatigueScore,
    dataset.recoveryScore,
    dataset.trainingLoadIndex
  );

  const outputEl = document.getElementById("output");
  if (!outputEl) return;

  outputEl.innerText =
    `${dataset.label}\n\n` +
    `fatigueScore:      ${dataset.fatigueScore}\n` +
    `recoveryScore:     ${dataset.recoveryScore}\n` +
    `trainingLoadIndex: ${dataset.trainingLoadIndex}\n` +
    `performanceDelta:  ${dataset.performanceDelta}\n` +
    `coreMarkState:     ${coreMarkState}`;
}

// ----------------------
// NUTRITION HUD – STATE
// ----------------------

const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 160;

// Anchors (persistent)
let anchors = JSON.parse(localStorage.getItem("anchors")) || {
  A: { name: "Anchor A", calories: 700, protein: 45 },
  B: { name: "Anchor B", calories: 700, protein: 45 }
};

let currentCalories = 0;
let currentProtein = 0;
let anchorALogged = false;
let anchorBLogged = false;

function saveAnchors() {
  localStorage.setItem("anchors", JSON.stringify(anchors));
}

function updateAnchorUI() {
  document.getElementById("anchorAName").textContent = anchors.A.name;
  document.getElementById("anchorACals").textContent = `${anchors.A.calories} kcal`;
  document.getElementById("anchorAProtein").textContent = `${anchors.A.protein} g protein`;

  document.getElementById("anchorBName").textContent = anchors.B.name;
  document.getElementById("anchorBCals").textContent = `${anchors.B.calories} kcal`;
  document.getElementById("anchorBProtein").textContent = `${anchors.B.protein} g protein`;
}

function computeMode() {
  const calRatio = currentCalories / TARGET_CALORIES;
  const proteinRatio = currentProtein / TARGET_PROTEIN;

  if (calRatio <= 0.8 && proteinRatio >= 0.8) return "FAST";
  if (calRatio >= 1.1 || proteinRatio <= 0.5) return "CHILL";
  return "BALANCED";
}

function updateNutritionHUD() {
  const caloriesDisplay = document.getElementById("caloriesDisplay");
  const proteinDisplay = document.getElementById("proteinDisplay");
  const modeDisplay = document.getElementById("modeDisplay");
  const anchorStatus = document.getElementById("anchorStatus");

  caloriesDisplay.textContent = `${currentCalories} / ${TARGET_CALORIES}`;
  proteinDisplay.textContent = `${currentProtein} / ${TARGET_PROTEIN} g`;

  const mode = computeMode();
  modeDisplay.textContent = mode;

  const aMark = anchorALogged ? "☑" : "☐";
  const bMark = anchorBLogged ? "☑" : "☐";
  anchorStatus.textContent = `A: ${aMark}  B: ${bMark}`;
}

function logAnchor(anchorKey) {
  const meal = anchors[anchorKey];

  if (anchorKey === "A" && !anchorALogged) {
    currentCalories += meal.calories;
    currentProtein += meal.protein;
    anchorALogged = true;
  } else if (anchorKey === "B" && !anchorBLogged) {
    currentCalories += meal.calories;
    currentProtein += meal.protein;
    anchorBLogged = true;
  }

  updateNutritionHUD();
}

function quickAddProtein() {
  currentProtein += 25;
  updateNutritionHUD();
}

function quickAddCalories() {
  currentCalories += 250;
  updateNutritionHUD();
}

function resetNutrition() {
  currentCalories = 0;
  currentProtein = 0;
  anchorALogged = false;
  anchorBLogged = false;
  updateNutritionHUD();
}

function editAnchor(anchorKey) {
  const meal = anchors[anchorKey];

  const name = prompt("Meal name:", meal.name);
  if (!name) return;

  const calories = parseInt(prompt("Calories:", meal.calories), 10);
  if (isNaN(calories)) return;

  const protein = parseInt(prompt("Protein (g):", meal.protein), 10);
  if (isNaN(protein)) return;

  anchors[anchorKey] = { name, calories, protein };
  saveAnchors();
  updateAnchorUI();
}

// ----------------------
// WEEKLY NUTRITION – STATE
// ----------------------

let weekNutrition = JSON.parse(localStorage.getItem("weekNutrition")) || [];

function saveWeekNutrition() {
  localStorage.setItem("weekNutrition", JSON.stringify(weekNutrition));
}

function updateWeeklyUI() {
  const weeklyCaloriesEl = document.getElementById("weeklyCalories");
  const weeklyProteinEl = document.getElementById("weeklyProtein");
  const weeklyAnchorsEl = document.getElementById("weeklyAnchors");
  const weeklyModesEl = document.getElementById("weeklyModes");

  if (!weekNutrition.length) {
    weeklyCaloriesEl.textContent = "0";
    weeklyProteinEl.textContent = "0 g";
    weeklyAnchorsEl.textContent = "0%";
    weeklyModesEl.textContent = "–";
    return;
  }

  let totalCal = 0;
  let totalProt = 0;
  let totalAnchors = 0;
  let totalPossibleAnchors = weekNutrition.length * 2;
  const modeCounts = { FAST: 0, BALANCED: 0, CHILL: 0 };

  weekNutrition.forEach(day => {
    totalCal += day.calories;
    totalProt += day.protein;
    if (day.anchorA) totalAnchors += 1;
    if (day.anchorB) totalAnchors += 1;
    if (modeCounts[day.mode] !== undefined) {
      modeCounts[day.mode] += 1;
    }
  });

  const days = weekNutrition.length;
  const avgCal = Math.round(totalCal / days);
  const avgProt = Math.round(totalProt / days);
  const adherence = Math.round((totalAnchors / totalPossibleAnchors) * 100);

  weeklyCaloriesEl.textContent = `${avgCal}`;
  weeklyProteinEl.textContent = `${avgProt} g`;
  weeklyAnchorsEl.textContent = `${isNaN(adherence) ? 0 : adherence}%`;

  const modeParts = [];
  if (modeCounts.FAST) modeParts.push(`FAST ${modeCounts.FAST}`);
  if (modeCounts.BALANCED) modeParts.push(`BAL ${modeCounts.BALANCED}`);
  if (modeCounts.CHILL) modeParts.push(`CHILL ${modeCounts.CHILL}`);

  weeklyModesEl.textContent = modeParts.length ? modeParts.join(" · ") : "–";
}

function closeDayAndLog() {
  const mode = computeMode();

  const entry = {
    calories: currentCalories,
    protein: currentProtein,
    anchorA: anchorALogged,
    anchorB: anchorBLogged,
    mode
  };

  weekNutrition.push(entry);
  if (weekNutrition.length > 7) {
    weekNutrition = weekNutrition.slice(weekNutrition.length - 7);
  }

  saveWeekNutrition();
  updateWeeklyUI();
  resetNutrition();
}

// ----------------------
// WIRE UP UI
// ----------------------

window.addEventListener("DOMContentLoaded", () => {
  // Training
  document.getElementById("runDatasetA").addEventListener("click", () => renderOutput(datasetA));
  document.getElementById("runDatasetB").addEventListener("click", () => renderOutput(datasetB));
  renderOutput(datasetA);

  // Nutrition
  document.getElementById("logAnchorA").addEventListener("click", () => logAnchor("A"));
  document.getElementById("logAnchorB").addEventListener("click", () => logAnchor("B"));
  document.getElementById("quickAddProtein").addEventListener("click", quickAddProtein);
  document.getElementById("quickAddCalories").addEventListener("click", quickAddCalories);
  document.getElementById("resetNutrition").addEventListener("click", resetNutrition);

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editAnchor(btn.dataset.anchor));
  });

  // Weekly
  const closeDayBtn = document.getElementById("closeDay");
  if (closeDayBtn) {
    closeDayBtn.addEventListener("click", closeDayAndLog);
  }

  updateAnchorUI();
  updateNutritionHUD();
  updateWeeklyUI();
});
