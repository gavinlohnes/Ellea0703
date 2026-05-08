/* ============================
   BEYOND‑OS — DRIFT ENGINE
   ============================ */

function driftEngine(state) {
  if (!state.booted) return;

  applyDrift(state);
}

/* ============================
   DRIFT LOGIC
   ============================ */

function applyDrift(state) {
  const mem = state.memory;

  // Initialize if missing
  if (mem.fatigue == null) mem.fatigue = 0;
  if (mem.hydration == null) mem.hydration = 5;
  if (mem.trainingLoad == null) mem.trainingLoad = 0;

  /* ============================
     1. FATIGUE DRIFT
     ============================ */
  // Fatigue slowly rises over time
  if (Math.random() < 0.3) {
    mem.fatigue = Math.min(mem.fatigue + 1, 10);
  }

  /* ============================
     2. HYDRATION DRIFT
     ============================ */
  // Hydration slowly decreases
  if (Math.random() < 0.4) {
    mem.hydration = Math.max(mem.hydration - 1, 0);
  }

  /* ============================
     3. TRAINING LOAD DRIFT
     ============================ */
  // Load decays slowly unless boosted by other engines
  if (Math.random() < 0.25) {
    mem.trainingLoad = Math.max(mem.trainingLoad - 1, 0);
  }

  /* ============================
     4. STABILITY: CLAMP VALUES
     ============================ */
  mem.fatigue = clamp(mem.fatigue, 0, 10);
  mem.hydration = clamp(mem.hydration, 0, 10);
  mem.trainingLoad = clamp(mem.trainingLoad, 0, 10);
}

/* ============================
   UTILITY
   ============================ */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* ============================
   EXPORT
   ============================ */

window.driftEngine = driftEngine;

