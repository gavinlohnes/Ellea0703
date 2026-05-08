/* ============================
   BEYOND‑OS — ADAPTIVE PROTOCOLS ENGINE
   ============================ */

function adaptiveProtocolsEngine(state) {
  if (!state.booted) return;

  adaptProtocols(state);
}

/* ============================
   ADAPTATION LOGIC
   ============================ */

function adaptProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  const fatigue = state.memory.fatigue || 0;
  const hydration = state.memory.hydration || 0;
  const load = state.memory.trainingLoad || 0;

  protocols.forEach(p => {
    if (p.completed || p.expired) return;

    // Initialize adaptive fields
    if (!p.adaptive) {
      p.adaptive = {
        boost: 0,
        suppression: 0,
        stability: 1
      };
    }

    /* ============================
       1. FATIGUE RESPONSE
       ============================ */
    if (fatigue >= 5) {
      p.adaptive.suppression += 1;
      p.adaptive.stability += 1;
    }

    /* ============================
       2. HYDRATION RESPONSE
       ============================ */
    if (hydration <= 2) {
      p.adaptive.suppression += 1;
    }

    /* ============================
       3. TRAINING LOAD RESPONSE
       ============================ */
    if (load >= 7) {
      p.adaptive.suppression += 1;
    }

    /* ============================
       4. PROGRESS BOOST
       ============================ */
    if (p.progress >= 2 && p.interruptions === 0) {
      p.adaptive.boost += 1;
    }

    /* ============================
       5. INTERRUPTION RESPONSE
       ============================ */
    if (p.interruptions >= 2) {
      p.adaptive.suppression += 1;
      p.adaptive.stability += 1;
    }

    /* ============================
       6. APPLY ADAPTATION
       ============================ */
    const net = p.adaptive.boost - p.adaptive.suppression;

    if (net > 0) {
      p.tuning.difficulty = Math.min(p.tuning.difficulty + 1, 10);
    } else if (net < 0) {
      p.tuning.difficulty = Math.max(p.tuning.difficulty - 1, 1);
    }

    // Stability always trends upward with stress
    p.tuning.stability = Math.min(p.tuning.stability + p.adaptive.stability, 10);

    // Reset adaptive counters each cycle
    p.adaptive.boost = 0;
    p.adaptive.suppression = 0;
    p.adaptive.stability = 1;
  });
}

/* ============================
   EXPORT
   ============================ */

window.adaptiveProtocolsEngine = adaptiveProtocolsEngine;

