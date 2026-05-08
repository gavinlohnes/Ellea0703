/* ============================
   BEYOND‑OS — TRAINING LOAD ENGINE
   ============================ */

function trainingLoadEngine(state) {
  if (!state.booted) return;

  updateTrainingLoad(state);
}

/* ============================
   TRAINING LOAD LOGIC
   ============================ */

function updateTrainingLoad(state) {
  const mem = state.memory;

  // Initialize if missing
  if (mem.trainingLoad == null) mem.trainingLoad = 0;
  if (mem.fatigue == null) mem.fatigue = 0;
  if (mem.hydration == null) mem.hydration = 5;

  /* ============================
     1. LOAD INCREASE FROM FATIGUE
     ============================ */
  if (mem.fatigue >= 6 && Math.random() < 0.4) {
    mem.trainingLoad = Math.min(mem.trainingLoad + 1, 10);
  }

  /* ============================
     2. LOAD INCREASE FROM LOW HYDRATION
     ============================ */
  if (mem.hydration <= 3 && Math.random() < 0.35) {
    mem.trainingLoad = Math.min(mem.trainingLoad + 1, 10);
  }

  /* ============================
     3. LOAD SPIKES UNDER STRESS
     ============================ */
  if (mem.fatigue >= 7 && mem.hydration <= 2 && Math.random() < 0.5) {
    mem.trainingLoad = Math.min(mem.trainingLoad + 2, 10);
  }

  /* ============================
     4. NATURAL LOAD DECAY (SLOW)
     ============================ */
  if (Math.random() < 0.15) {
    mem.trainingLoad = Math.max(mem.trainingLoad - 1, 0);
  }

  /* ============================
     5. CLAMP VALUES
     ============================ */
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

window.trainingLoadEngine = trainingLoadEngine;

