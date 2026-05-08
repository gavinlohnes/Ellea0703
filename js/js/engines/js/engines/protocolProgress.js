/* ============================
   BEYOND‑OS — PROTOCOL PROGRESS ENGINE
   ============================ */

function protocolProgressEngine(state) {
  if (!state.booted) return;

  updateProtocolProgress(state);
  completeFinishedProtocols(state);
}

/* ============================
   PROGRESS UPDATE
   ============================ */

function updateProtocolProgress(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  const now = Date.now();

  protocols.forEach(p => {
    if (p.expired || p.completed) return;

    // Initialize progress fields
    if (p.progress == null) p.progress = 0;
    if (!p.lastProgressUpdate) p.lastProgressUpdate = now;

    const elapsed = now - p.lastProgressUpdate;

    // Progress every 3 hours
    // 3 hours = 10,800,000 ms
    if (elapsed >= 10800000) {
      p.progress += 1;
      p.lastProgressUpdate = now;
    }
  });
}

/* ============================
   COMPLETION CHECK
   ============================ */

function completeFinishedProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  protocols.forEach(p => {
    if (p.completed || p.expired) return;

    // Default completion threshold = 4 progress cycles
    const threshold = p.threshold || 4;

    if (p.progress >= threshold) {
      p.completed = true;
      p.completedAt = Date.now();
    }
  });
}

/* ============================
   EXPORT
   ============================ */

window.protocolProgressEngine = protocolProgressEngine;

