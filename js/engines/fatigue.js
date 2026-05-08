/* ============================
   BEYOND‑OS — FATIGUE ENGINE
   ============================ */

function fatigueEngine(state) {
  if (!state.booted) return;

  updateFatigue(state);
}

/* ============================
   FATIGUE LOGIC
   ============================ */

function updateFatigue(state) {
  const mem = state.memory;

  // Initialize if missing
  if (mem.fatigue == null) mem.fatigue = 0;
  if (mem.hydration == null) mem.hydration = 5;
  if (mem.trainingLoad == null) mem.trainingLoad = 0;

  /* ============================
     1. FATIGUE FROM LOW HYDRATION
     ============================ */
  if (mem.hydration <= 3 && Math.random() < 0.4) {
    mem.fatigue = Math.min(mem.fatigue + 1, 10);
  }

  /* ============================
     2. FATIGUE FROM HIGH TRAINING LOAD
     ============================ */
  if (mem.trainingLoad >= 6 && Math.random() < 0.35) {
    mem.fatigue = Math.min(mem.fatigue + 1, 10);
  }

  /* ============================
     3. FATIGUE SPIKES UNDER COMBINED STRESS
     ============================ */
  if (mem.hydration <= 2 && mem.trainingLoad >= 7 && Math.random() < 0.5) {
    mem.fatigue = Math.min(mem.fatigue + 2, 10);
  }

  /* ============================
     4. NATURAL FATIGUE DECAY (SLOW)
     ============================ */
  if (Math.random() < 0.15) {
    mem.fatigue = Math.max(mem.fatigue - 1, 0);
  }

  /* ============================
     5. CLAMP VALUES
     ============================ */
  mem.fatigue = clamp(mem.fatigue, 0, 10);
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

window.fatigueEngine = fatigueEngine;

