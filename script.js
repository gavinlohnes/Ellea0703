// BEYOND v1 – Training + Nutrition HUD (Phase 3)

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

// Load anchors or default
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

function updateNutritionHUD() {
  const caloriesDisplay = document.getElementById("caloriesDisplay");
  const proteinDisplay = document.getElementById("proteinDisplay");
  const modeDisplay = document.getElementById("modeDisplay");
  const anchorStatus = document.getElementById("anchorStatus");

  caloriesDisplay.textContent = `${currentCalories} / ${TARGET_CALORIES}`;
  proteinDisplay.textContent = `${currentProtein} / ${TARGET_PROTEIN} g`;

  const calRatio = currentCalories / TARGET_CALORIES;
  const proteinRatio = currentProtein / TARGET_PROTEIN;

  let mode = "BALANCED";

  if (calRatio <= 0.8 && proteinRatio >= 0.8) {
    mode = "FAST";
  } else if (calRatio >= 1.1 || proteinRatio <= 0.5) {
    mode = "CHILL";
  }

  modeDisplay.textContent = mode;

  const aMark = anchorALogged ? "☑" : "☐";
  const bMark = anchorBLogged ? "☑" : "☐";
  anchorStatus.textContent = `A: ${aMark}  B: ${bMark}`;
}

function logAnchor(anchor) {
  const meal = anchors[anchor];

  if (anchor === "A" && !anchorALogged) {
    currentCalories += meal.calories;
    currentProtein += meal.protein;
    anchorALogged = true;
  } else if (anchor === "B" && !anchorBLogged) {
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

  const calories = parseInt(prompt("Calories:", meal.calories));
  if (isNaN(calories)) return;

  const protein = parseInt(prompt("Protein (g):", meal.protein));
  if (isNaN(protein)) return;

  anchors[anchorKey] = { name, calories, protein };
  saveAnchors();
  updateAnchorUI();
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

  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editAnchor(btn.dataset.anchor));
  });

  updateAnchorUI();
  updateNutritionHUD();
});
