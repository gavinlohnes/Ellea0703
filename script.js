/* script.js */
// BEYOND v1 – DEBUG ENGINE
// Full deterministic metric engine + state machine + UI wiring
// Includes deep logging for every step of computation.

// ------------------------------------------------------------
// DATASETS
// ------------------------------------------------------------

const datasetA = {
  id: "A",
  label: "Dataset A – Stable Training (Expected ACTIVE)",
  sleepHours: 7.7,
  sleepQuality: 4.3,
  soreness: 2.5,
  volume: 4300,
  compliance: 0.95
};

const datasetB = {
  id: "B",
  label: "Dataset B – Accumulated Fatigue (Expected OVERLOAD)",
  sleepHours: 5.7,
  sleepQuality: 2.5,
  soreness: 6.5,
  volume: 6300,
  compliance: 0.9
};

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ------------------------------------------------------------
// METRIC FUNCTIONS (DEBUG)
// ------------------------------------------------------------

function computeFatigueScore(input) {
  console.log("---- FATIGUE SCORE ----");
  console.log("Input:", input);

  const sorenessNorm = clamp((input.soreness / 10) * 100, 0, 100);
  console.log("sorenessNorm:", sorenessNorm);

  const sleepHoursIdeal = 8;
  const sleepHoursMin = 4;
  const sleepHoursNorm = clamp(
    ((sleepHoursIdeal - clamp(input.sleepHours, sleepHoursMin, sleepHoursIdeal)) /
      (sleepHoursIdeal - sleepHoursMin)) * 100,
    0,
    100
  );
  console.log("sleepHoursNorm:", sleepHoursNorm);

  const sleepQualityNorm = clamp(((5 - input.sleepQuality) / 4) * 100, 0, 100);
  console.log("sleepQualityNorm:", sleepQualityNorm);

  const volumeNorm = clamp((input.volume / 7000) * 100, 0, 100);
  console.log("volumeNorm:", volumeNorm);

  const wSoreness = 0.35;
  const wSleepHours = 0.25;
  const wSleepQuality = 0.2;
  const wVolume = 0.2;

  const raw =
    sorenessNorm * wSoreness +
    sleepHoursNorm * wSleepHours +
    sleepQualityNorm * wSleepQuality +
    volumeNorm * wVolume;

  console.log("fatigueScoreRaw:", raw);

  return clamp(raw, 0, 100);
}

function computeRecoveryScore(input, fatigueScore) {
  console.log("---- RECOVERY SCORE ----");
  console.log("Input:", input);
  console.log("fatigueScore:", fatigueScore);

  const sleepHoursIdeal = 8;
  const sleepHoursMin = 4;
  const sleepHoursPos = clamp(
    ((clamp(input.sleepHours, sleepHoursMin, sleepHoursIdeal) - sleepHoursMin) /
      (sleepHoursIdeal - sleepHoursMin)) * 100,
    0,
    100
  );
  console.log("sleepHoursPos:", sleepHoursPos);

  const sleepQualityPos = clamp(((input.sleepQuality - 1) / 4) * 100, 0, 100);
  console.log("sleepQualityPos:", sleepQualityPos);

  const compliancePos = clamp(input.compliance * 100, 0, 100);
  console.log("compliancePos:", compliancePos);

  const fatigueInverse = 100 - fatigueScore;
  console.log("fatigueInverse:", fatigueInverse);

  const wFatigueInv = 0.4;
  const wSleepHours = 0.25;
  const wSleepQuality = 0.2;
  const wCompliance = 0.15;

  const raw =
    fatigueInverse * wFatigueInv +
    sleepHoursPos * wSleepHours +
    sleepQualityPos * wSleepQuality +
    compliancePos * wCompliance;

  console.log("recoveryScoreRaw:", raw);

  return clamp(raw, 0, 100);
}

function computeTrainingLoadIndex(input) {
  console.log("---- TRAINING LOAD INDEX ----");
  console.log("Input:", input);

  const volumeNorm = clamp((input.volume / 7000) * 100, 0, 100);
  console.log("volumeNorm:", volumeNorm);

  const sorenessNorm = clamp((input.soreness / 10) * 100, 0, 100);
  console.log("sorenessNorm:", sorenessNorm);

  const complianceNorm = clamp(input.compliance * 100, 0, 100);
  console.log("complianceNorm:", complianceNorm);

  const wVolume = 0.6;
  const wSoreness = 0.25;
  const wCompliance = 0.15;

  const raw =
    volumeNorm * wVolume +
    sorenessNorm * wSoreness +
    complianceNorm * wCompliance;

  console.log("trainingLoadIndexRaw:", raw);

  return clamp(raw, 0, 100);
}

function computePerformanceDelta(fatigueScore, recoveryScore) {
  console.log("---- PERFORMANCE DELTA ----");
  console.log("fatigueScore:", fatigueScore);
  console.log("recoveryScore:", recoveryScore);

  const balance = recoveryScore - fatigueScore;
  console.log("balance:", balance);

  const scaled = clamp(balance, -40, 40) / 40;
  console.log("scaled:", scaled);

  const gain = 0.3;
  const result = clamp(scaled * gain, -1, 1);

  console.log("performanceDeltaRaw:", result);

  return result;
}

// ------------------------------------------------------------
// SMOOTHING
// ------------------------------------------------------------

function smoothMetric(prev, current, alpha = 0.4) {
  console.log("---- SMOOTHING ----");
  console.log("prev:", prev, "current:", current, "alpha:", alpha);

  if (prev == null || isNaN(prev)) {
    console.log("No previous value — using current.");
    return current;
  }

  const smoothed = lerp(prev, current, alpha);
  console.log("smoothed:", smoothed);

  return smoothed;
}

// ------------------------------------------------------------
// STATE MACHINE
// ------------------------------------------------------------

const CORE_MARK_STATES = {
  ACTIVE: "ACTIVE",
  OVERLOAD: "OVERLOAD",
  RECOVERY: "RECOVERY"
};

function resolveCoreMarkState(metrics) {
  console.log("---- STATE MACHINE ----");
  console.log("metrics:", metrics);

  const fatigue = metrics.fatigueScore;
  const recovery = metrics.recoveryScore;
  const load = metrics.trainingLoadIndex;

  const fatigueOverloadThreshold = 70;
  const recoveryLowThreshold = 45;
  const loadOverloadThreshold = 85;

  const fatigueActiveCeiling = 60;
  const recoveryActiveFloor = 55;

  let overloadTriggers = 0;
  if (fatigue >= fatigueOverloadThreshold) overloadTriggers++;
  if (recovery <= recoveryLowThreshold) overloadTriggers++;
  if (load >= loadOverloadThreshold) overloadTriggers++;

  console.log("overloadTriggers:", overloadTriggers);

  if (overloadTriggers >= 2) {
    console.log("STATE → OVERLOAD");
    return CORE_MARK_STATES.OVERLOAD;
  }

  if (recovery >= recoveryActiveFloor && fatigue < fatigueActiveCeiling) {
    console.log("STATE → ACTIVE");
    return CORE_MARK_STATES.ACTIVE;
  }

  console.log("STATE → RECOVERY");
  return CORE_MARK_STATES.RECOVERY;
}

// ------------------------------------------------------------
// MAIN EXECUTION PIPELINE
// ------------------------------------------------------------

function runSessionAndRecomputeDaily(input, prevSnapshot = null) {
  console.log("====================================================");
  console.log("RUNNING DATASET:", input.label);
  console.log("====================================================");

  const fatigueScoreRaw = computeFatigueScore(input);
  const recoveryScoreRaw = computeRecoveryScore(input, fatigueScoreRaw);
  const trainingLoadIndexRaw = computeTrainingLoadIndex(input);
  const performanceDeltaRaw = computePerformanceDelta(
    fatigueScoreRaw,
    recoveryScoreRaw
  );

  const fatigueScore = smoothMetric(prevSnapshot?.fatigueScore, fatigueScoreRaw);
  const recoveryScore = smoothMetric(prevSnapshot?.recoveryScore, recoveryScoreRaw);
  const trainingLoadIndex = smoothMetric(prevSnapshot?.trainingLoadIndex, trainingLoadIndexRaw);
  const performanceDelta = smoothMetric(prevSnapshot?.performanceDelta, performanceDeltaRaw, 0.5);

  const metrics = {
    fatigueScore: Number(fatigueScore.toFixed(1)),
    recoveryScore: Number(recoveryScore.toFixed(1)),
    trainingLoadIndex: Number(trainingLoadIndex.toFixed(1)),
    performanceDelta: Number(performanceDelta.toFixed(3))
  };

  console.log("---- FINAL METRICS ----");
  console.log(metrics);

  const coreMarkState = resolveCoreMarkState(metrics);

  const snapshot = {
    ...metrics,
    coreMarkState
  };

  console.log("---- SNAPSHOT ----");
  console.log(snapshot);

  return { snapshot };
}

// ------------------------------------------------------------
// UI WIRING
// ------------------------------------------------------------

function formatSnapshot(label, snapshot) {
  return [
    label,
    "",
    `fatigueScore:      ${snapshot.fatigueScore}`,
    `recoveryScore:     ${snapshot.recoveryScore}`,
    `trainingLoadIndex: ${snapshot.trainingLoadIndex}`,
    `performanceDelta:  ${snapshot.performanceDelta}`,
    `coreMarkState:     ${snapshot.coreMarkState}`
  ].join("\n");
}

function attachHandlers() {
  const btnA = document.getElementById("runDatasetA");
  const btnB = document.getElementById("runDatasetB");
  const outputPanel = document.getElementById("outputPanel");

  btnA.addEventListener("click", () => {
    const { snapshot } = runSessionAndRecomputeDaily(datasetA, null);
    outputPanel.textContent = formatSnapshot(datasetA.label, snapshot);
  });

  btnB.addEventListener("click", () => {
    const { snapshot } = runSessionAndRecomputeDaily(datasetB, null);
    outputPanel.textContent = formatSnapshot(datasetB.label, snapshot);
  });
}

document.addEventListener("DOMContentLoaded", attachHandlers);
