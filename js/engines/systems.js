/* ============================
   BEYOND‑OS — SYSTEMS ENGINE (FIXED)
   ============================ */

function systemsEngine(state) {
  if (!state.booted) return;

  updateSystemHeartbeat(state);
  updateSystemStatus(state);
}

/* ============================
   HEARTBEAT
   ============================ */
function updateSystemHeartbeat(state) {
  state.memory.lastSystemUpdate = Date.now();
}

/* ============================
   SYSTEM STATUS (NEW LOGIC)
   ============================ */
function updateSystemStatus(state) {
  const mem = state.memory;

  const fatigue = mem.fatigue ?? 0;
  const hydration = mem.hydration ?? 5;
  const load = mem.trainingLoad ?? 0;

  // Derived system-level metrics
  mem.systemStatus = {
    fatigueLevel: fatigue,
    hydrationLevel: hydration,
    loadLevel: load,
    readiness: Math.max(0, 10 - fatigue),
    stability: calculateStability(fatigue, hydration, load)
  };
}

/* ============================
   STABILITY MODEL
   ============================ */
function calculateStability(fatigue, hydration, load) {
  let score = 10;

  if (fatigue >= 6) score -= 2;
  if (hydration <= 3) score -= 2;
  if (load >= 7) score -= 2;

  return Math.max(1, score);
}

/* ============================
   EXPORT
   ============================ */

window.systemsEngine = systemsEngine;
