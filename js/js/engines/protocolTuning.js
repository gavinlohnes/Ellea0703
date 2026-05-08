/* ============================
   BEYOND‑OS — PROTOCOL TUNING ENGINE
   ============================ */

function protocolTuningEngine(state) {
  if (!state.booted) return;

  tuneProtocols(state);
}

/* ============================
   TUNING LOGIC
   ============================ */

function tuneProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  protocols.forEach(p => {
    if (p.completed || p.expired) return;

    // Initialize fields
    if (!p.tuning) p.tuning = { difficulty: 1, stability: 1 };

    // 1. Too many interruptions → reduce difficulty
    if (p.interruptions >= 3) {
      p.tuning.difficulty = Math.max(1, p.tuning.difficulty - 1);
      p.tuning.stability = Math.max(1, p.tuning.stability - 1);
    }

    // 2. Fast progress → increase difficulty
    if (p.progress >= 2 && p.expansions >= 1) {
      p.tuning.difficulty += 1;
    }

    // 3. Slow progress → increase stability
    if (p.progress === 0 && p.expansions >= 2) {
      p.tuning.stability += 1;
    }

    // 4. Cap values to avoid runaway tuning
    p.tuning.difficulty = Math.min(p.tuning.difficulty, 10);
    p.tuning.stability = Math.min(p.tuning.stability, 10);
  });
}

/* ============================
   EXPORT
   ============================ */

window.protocolTuningEngine = protocolTuningEngine;

