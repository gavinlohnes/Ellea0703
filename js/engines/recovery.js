/* ============================
   BEYOND‑OS — RECOVERY ENGINE
   ============================ */

function recoveryEngine(state) {
  if (!state.booted) return;

  applyRecovery(state);
}

/* ============================
   RECOVERY LOGIC
   ============================ */

function applyRecovery(state) {
  const mem = state.memory;

  // Initialize if missing
  if (mem.fatigue == null) mem.fatigue = 0;
  if (mem.hydration == null) mem.hydration = 5;
  if (mem.trainingLoad == null) mem.trainingLoad = 0;

  /* ============================
     1. HYDRATION RECOVERY
     ============================ */
  // If hydration is low, recover faster
  if (mem.hydration <= 4 && Math.random() < 0.5) {
    mem.hydration = Math.min(mem.hydration + 1, 10);
  }

  /* ============================
     2. FATIGUE RECOVERY
     ============================ */
  // Fatigue drops when hydration is good
  if (mem.hydration >= 6 && Math.random() < 0.4) {
    mem.fatigue = Math.max(mem.fatigue - 1, 0);
  }

  /* ============================
     3. TRAINING LOAD RECOVERY
     ============================ */
  // Load recovers when fatigue is low
  if (mem.fatigue <= 3 && Math.random() < 0.3) {
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

window.recoveryEngine = recoveryEngine;

