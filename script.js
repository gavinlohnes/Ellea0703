// BEYOND v1 – Calibrated Engine Demo

// ---- CORE STATE LOGIC (CALIBRATED) ----
function getCoreMarkState(fatigueScore, recoveryScore, trainingLoadIndex) {
  if (fatigueScore >= 63 && trainingLoadIndex >= 78) {
    return "OVERLOAD";
  } else if (fatigueScore >= 40 || recoveryScore <= 55) {
    return "RECOVERY";
  } else {
    return "ACTIVE";
  }
}

// ---- DATASETS ----
const datasetA = {
  label: "Dataset A – Stable Training (Expected ACTIVE)",
  fatigueScore: 26.4,
  recoveryScore: 83.3,
  trainingLoadIndex: 57.4,
  performanceDelta: 0.3 // after formula correction this should trend closer to 0–0.1 in real use
};

const datasetB = {
  label: "Dataset B – Accumulated Fatigue (Expected OVERLOAD)",
  fatigueScore: 67.6,
  recoveryScore: 44.6,
  trainingLoadIndex: 83.8,
  performanceDelta: -0.173
};

// ---- RENDER FUNCTION ----
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

// ---- WIRE UP BUTTONS ----
window.addEventListener("DOMContentLoaded", () => {
  const btnA = document.getElementById("runDatasetA");
  const btnB = document.getElementById("runDatasetB");

  if (btnA) {
    btnA.addEventListener("click", () => renderOutput(datasetA));
  }

  if (btnB) {
    btnB.addEventListener("click", () => renderOutput(datasetB));
  }

  // Optional: show Dataset A by default on load
  renderOutput(datasetA);
});
