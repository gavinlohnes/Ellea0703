// BEYOND v1 – Training + Nutrition HUD

// ----------------------
// TRAINING ENGINE
// ----------------------

// Core state logic (calibrated)
function getCoreMarkState(fatigueScore, recoveryScore, trainingLoadIndex) {
  if (fatigueScore >= 63 && trainingLoadIndex >= 78) {
    return "OVERLOAD";
  } else if (fatigueScore >= 40 || recoveryScore <= 55) {
    return "RECOVERY";
  } else {
    return "ACTIVE";
  }
}

// Demo datasets
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
// NUTRITION HUD – PHASE 1
// ----------------------

// Targets (you can tweak these later)
const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 160;

// Anchor macros (example values)
const ANCHOR_A = { calories: 700, protein: 45 };
const ANCHOR_B = { calories: 700, protein: 45 };

// State
let currentCalories = 0;
let currentProtein = 0;
let anchorALogged = false;
let anchorBLogged = false;

function updateNutritionHUD() {
  const caloriesDisplay = document.getElementById("caloriesDisplay");
  const proteinDisplay = document.getElementById("proteinDisplay");
  const modeDisplay = document.getElementById("modeDisplay");
  const anchorStatus = document.getElementById("anchorStatus");

  if (!caloriesDisplay || !proteinDisplay || !modeDisplay || !anchorStatus) return;

  caloriesDisplay.textContent = `${currentCalories} / ${TARGET_CALORIES}`;
  proteinDisplay.textContent = `${currentProtein} / ${TARGET_PROTEIN} g`;

  // Mode logic
  const calRatio = currentCalories / TARGET_CALORIES;
  const proteinRatio = currentProtein / TARGET_PROTEIN;

  let mode = "BALANCED";

  if (calRatio <= 0.8 && proteinRatio >= 0.8) {
    mode = "FAST";
  } else if (calRatio >= 1.1 || proteinRatio <= 0.5) {
    mode = "CHILL";
  } else {
    mode = "BALANCED";
  }

  modeDisplay.textContent = mode;

  // Anchors
  const aMark = anchorALogged ? "☑" : "☐";
  const bMark = anchorBLogged ? "☑" : "☐";
  anchorStatus.textContent = `A: ${aMark}  B: ${bMark}`;
}

function logAnchor(anchor) {
  if (anchor === "A" && !anchorALogged) {
    currentCalories += ANCHOR_A.calories;
    currentProtein += ANCHOR_A.protein;
    anchorALogged = true;
  } else if (anchor === "B" && !anchorBLogged) {
    currentCalories += ANCHOR_B.calories;
    currentProtein += ANCHOR_B.protein;
    anchorBLogged = true;
  }
  updateNutritionHUD();
}

function resetNutrition() {
  currentCalories = 0;
  currentProtein = 0;
  anchorALogged = false;
  anchorBLogged = false;
  updateNutritionHUD();
}

// ----------------------
// WIRE UP UI
// ----------------------

window.addEventListener("DOMContentLoaded", () => {
  // Training buttons
  const btnA = document.getElementById("runDatasetA");
  const btnB = document.getElementById("runDatasetB");

  if (btnA) {
    btnA.addEventListener("click", () => renderOutput(datasetA));
  }
  if (btnB) {
    btnB.addEventListener("click", () => renderOutput(datasetB));
  }

  // Show Dataset A by default
  renderOutput(datasetA);

  // Nutrition buttons
  const logAnchorAButton = document.getElementById("logAnchorA");
  const logAnchorBButton = document.getElementById("logAnchorB");
  const resetNutritionButton = document.getElementById("resetNutrition");

  if (logAnchorAButton) {
    logAnchorAButton.addEventListener("click", () => logAnchor("A"));
  }
  if (logAnchorBButton) {
    logAnchorBButton.addEventListener("click", () => logAnchor("B"));
  }
  if (resetNutritionButton) {
    resetNutritionButton.addEventListener("click", resetNutrition);
  }

  // Initialize HUD
  updateNutritionHUD();
});
