/* ============================
   BEYOND‑OS — PROTOCOL EXPANSION ENGINE
   ============================ */

function protocolExpansionEngine(state) {
  if (!state.booted) return;

  expandActiveProtocols(state);
}

/* ============================
   EXPANSION LOGIC
   ============================ */

function expandActiveProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  protocols.forEach(p => {
    if (p.expired) return;

    // Initialize expansion history
    if (!p.expansions) p.expansions = 0;

    // Expand every 6 hours
    const now = Date.now();
    if (!p.lastExpansion) p.lastExpansion = now;

    const elapsed = now - p.lastExpansion;

    // 6 hours = 21,600,000 ms
    if (elapsed >= 21600000) {
      p.expansions++;
      p.lastExpansion = now;
    }
  });
}

/* ============================
   EXPORT
   ============================ */

window.protocolExpansionEngine = protocolExpansionEngine;

