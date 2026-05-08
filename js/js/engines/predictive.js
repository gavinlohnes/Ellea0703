/* ============================
   BEYOND‑OS — PREDICTIVE ENGINE
   ============================ */

/* ============================
   BEYOND‑OS — PREDICTIVE ENGINE
   ============================ */

function predictiveEngine(state) {
  if (!state.booted) return;

  generatePredictions(state);
}

/* ============================
   PREDICTION LOGIC
   ============================ */

function generatePredictions(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  const fatigue = state.memory.fatigue || 0;
  const hydration = state.memory.hydration || 0;
  const load = state.memory.trainingLoad || 0;

  // Initialize prediction store
  if (!state.memory.predictions) {
    state.memory.predictions = {
      fatigueRisk: 0,
      hydrationRisk: 0,
      overloadRisk: 0,
      protocolFailures: 0
    };
  }

  const predictions = state.memory.predictions;

  /* ============================
     1. FATIGUE RISK
     ============================ */
  if (fatigue >= 6) predictions.fatigueRisk = 2;
  else if (fatigue >= 4) predictions.fatigueRisk = 1;
  else predictions.fatigueRisk = 0;

  /* ============================
     2. HYDRATION RISK
     ============================ */
  if (hydration <= 1) predictions.hydrationRisk = 2;
  else if (hydration <= 3) predictions.hydrationRisk = 1;
  else predictions.hydrationRisk = 0;

  /* ============================
     3. TRAINING LOAD RISK
     ============================ */
  if (load >= 8) predictions.overloadRisk = 2;
  else if (load >= 5) predictions.overloadRisk = 1;
  else predictions.overloadRisk = 0;

  /* ============================
     4. PROTOCOL FAILURE RISK
     ============================ */
  let failureCount = 0;

  protocols.forEach(p => {
    if (p.expired) return;

    const interruptions = p.interruptions || 0;
    const progress = p.progress || 0;

    // High interruptions + low progress = failure risk
    if (interruptions >= 3 && progress === 0) {
      failureCount++;
    }
  });

  predictions.protocolFailures = failureCount;

  /* ============================
     5. STORE PREDICTIONS
     ============================ */
  state.memory.predictions = predictions;
}

/* ============================
   EXPORT
   ============================ */

window.predictiveEngine = predictiveEngine;
