/* ============================
   BEYOND‑OS — WEEKLY ENGINE
   ============================ */

function weeklyEngine(state) {
  if (!state.booted) return;

  checkWeeklyCycle(state);
}

/* ============================
   WEEKLY CYCLE LOGIC
   ============================ */

function checkWeeklyCycle(state) {
  const mem = state.memory;

  // Initialize timestamp
  if (!mem.lastWeeklyReset) {
    mem.lastWeeklyReset = Date.now();
    return;
  }

  const now = Date.now();
  const elapsed = now - mem.lastWeeklyReset;

  // 7 days = 604,800,000 ms
  if (elapsed >= 604800000) {
    runWeeklyReset(state);
    mem.lastWeeklyReset = now;
  }
}

/* ============================
   WEEKLY RESET
   ============================ */

function runWeeklyReset(state) {
  const mem = state.memory;

  /* ============================
     1. WEEKLY SUMMARY SNAPSHOT
     ============================ */
  if (!mem.weeklyHistory) mem.weeklyHistory = [];

  mem.weeklyHistory.push({
    timestamp: Date.now(),
    fatigue: mem.fatigue || 0,
    hydration: mem.hydration || 0,
    trainingLoad: mem.trainingLoad || 0,
    protocolCount: Array.isArray(mem.protocols) ? mem.protocols.length : 0,
    completedProtocols: Array.isArray(mem.protocols)
      ? mem.protocols.filter(p => p.completed).length
      : 0
  });

  // Keep only last 12 weeks
  if (mem.weeklyHistory.length > 12) {
    mem.weeklyHistory.shift();
  }

  /* ============================
     2. WEEKLY RECOVERY BOOST
     ============================ */
  mem.fatigue = Math.max((mem.fatigue || 0) - 2, 0);
  mem.hydration = Math.min((mem.hydration || 0) + 2, 10);

  /* ============================
     3. WEEKLY LOAD NORMALIZATION
     ============================ */
  mem.trainingLoad = Math.max((mem.trainingLoad || 0) - 1, 0);

  /* ============================
     4. WEEKLY PROTOCOL CLEANUP
     ============================ */
  if (Array.isArray(mem.protocols)) {
    mem.protocols = mem.protocols.filter(p => !p.expired);
  }
}

/* ============================
   EXPORT
   ============================ */

window.weeklyEngine = weeklyEngine;

