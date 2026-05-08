/* ============================
   BEYOND‑OS — HYDRATION CURVE ENGINE
   ============================ */

function hydrationCurveEngine(state) {
  if (!state.booted) return;

  updateHydration(state);
}

/* ============================
   HYDRATION LOGIC
   ============================ */

function updateHydration(state) {
  const mem = state.memory;

  // Initialize if missing
  if (mem.hydration == null) mem.hydration = 5;
  if (mem.fatigue == null) mem.fatigue = 0;
  if (mem.trainingLoad == null) mem.trainingLoad = 0;

  /* ============================
     1. NATURAL HYDRATION DECLINE
     ============================ */
  if (Math.random() < 0.35) {
    mem.hydration = Math.max(mem.hydration - 1, 0);
  }

  /* ============================
     2. HYDRATION BOOST WHEN FATIGUE IS LOW
     ============================ */
  if (mem.fatigue <= 3 && Math.random() < 0.25) {
    mem.hydration = Math.min(mem.hydration + 1, 10);
  }

  /* ============================
     3. HYDRATION PENALTY UNDER HIGH LOAD
     ============================ */
  if (mem.trainingLoad >= 7 && Math.random() < 0.4) {
    mem.hydration = Math.max(mem.hydration - 1, 0);
  }

  /* ============================
     4. EXTREME STRESS DEHYDRATION
     ============================ */
  if (mem.fatigue >= 7 && mem.trainingLoad >= 7 && Math.random() < 0.5) {
    mem.hydration = Math.max(mem.hydration - 2, 0);
  }

  /* ============================
     5. CLAMP VALUES
     ============================ */
  mem.hydration = clamp(mem.hydration, 0, 10);
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

window.hydrationCurveEngine = hydrationCurveEngine;

