/* ============================
   BEYOND‑OS — OPERATOR LOOP
   ============================ */

let operatorInterval = null;

/* ============================
   MAIN LOOP
   ============================ */

function operatorLoop() {
  const state = getState();

  // Prevent double loops
  if (state.flags.busy) return;

  state.flags.busy = true;

  try {
    runSystems(state);
    runAdaptive(state);
    runPredictive(state);
    runRecovery(state);
    runDrift(state);
    runTrainingLoad(state);
    runFatigue(state);
    runHydration(state);
    runWeekly(state);
    runTrends(state);
    runReports(state);
  } catch (err) {
    console.error("Operator Loop Error:", err);
    setFlag("error", err.message);
  }

  state.flags.busy = false;
  render();
}

/* ============================
   LOOP CONTROL
   ============================ */

function startOperatorLoop() {
  if (operatorInterval) return; // already running
  operatorInterval = setInterval(operatorLoop, 1000); // 1 second cycle
}

function stopOperatorLoop() {
  clearInterval(operatorInterval);
  operatorInterval = null;
}

/* ============================
   ENGINE WRAPPERS
   ============================ */

function runSystems(state) {
  if (typeof systemsEngine === "function") systemsEngine(state);
}

function runAdaptive(state) {
  if (typeof adaptiveProtocolsEngine === "function") adaptiveProtocolsEngine(state);
}

function runPredictive(state) {
  if (typeof predictiveEngine === "function") predictiveEngine(state);
}

function runRecovery(state) {
  if (typeof recoveryEngine === "function") recoveryEngine(state);
}

function runDrift(state) {
  if (typeof driftEngine === "function") driftEngine(state);
}

function runTrainingLoad(state) {
  if (typeof trainingLoadEngine === "function") trainingLoadEngine(state);
}

function runFatigue(state) {
  if (typeof fatigueEngine === "function") fatigueEngine(state);
}

function runHydration(state) {
  if (typeof hydrationCurveEngine === "function") hydrationCurveEngine(state);
}

function runWeekly(state) {
  if (typeof weeklyEngine === "function") weeklyEngine(state);
}

function runTrends(state) {
  if (typeof trendsEngine === "function") trendsEngine(state);
}

function runReports(state) {
  if (typeof reportsEngine === "function") reportsEngine(state);
}

/* ============================
   AUTO‑START AFTER BOOT
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  startOperatorLoop();
});

