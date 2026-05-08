/* ============================
   BEYOND‑OS — PROTOCOL INTERRUPTION ENGINE
   ============================ */

function protocolInterruptionEngine(state) {
  if (!state.booted) return;

  handleInterruptions(state);
}

/* ============================
   INTERRUPTION LOGIC
   ============================ */

function handleInterruptions(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  const now = Date.now();

  protocols.forEach(p => {
    if (p.completed || p.expired) return;

    // Initialize fields
    if (!p.interruptions) p.interruptions = 0;
    if (!p.lastActive) p.lastActive = now;

    const elapsed = now - p.lastActive;

    // 2 hours = 7,200,000 ms
    if (elapsed >= 7200000) {
      p.interruptions++;

      // If interruption count is high, pause protocol
      if (p.interruptions >= 3 && !p.paused) {
        p.paused = true;
        p.pausedAt = now;
      }
    }

    // Auto‑resume after 30 minutes
    if (p.paused && p.pausedAt) {
      const pausedElapsed = now - p.pausedAt;

      // 30 minutes = 1,800,000 ms
      if (pausedElapsed >= 1800000) {
        p.paused = false;
        p.pausedAt = null;
        p.lastActive = now;
      }
    }
  });
}

/* ============================
   EXPORT
   ============================ */

window.protocolInterruptionEngine = protocolInterruptionEngine;

