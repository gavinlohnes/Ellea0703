/* ============================
   BEYOND‑OS — PROTOCOLS ENGINE
   ============================ */

function protocolsEngine(state) {
  if (!state.booted) return;

  expireOldProtocols(state);
  cleanupProtocols(state);
}

/* ============================
   PROTOCOL EXPIRATION
   ============================ */

function expireOldProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  const now = Date.now();

  protocols.forEach(p => {
    if (!p.created) p.created = now;

    const age = now - p.created;

    // 48 hours = 172,800,000 ms
    if (age > 172800000 && !p.expired) {
      p.expired = true;
    }
  });
}

/* ============================
   AUTO‑CLEANUP
   ============================ */

function cleanupProtocols(state) {
  const protocols = state.memory.protocols;
  if (!Array.isArray(protocols)) return;

  // Remove protocols older than 7 days
  const cutoff = Date.now() - (7 * 86400000);

  state.memory.protocols = protocols.filter(p => {
    return p.created >= cutoff;
  });
}

/* ============================
   HELPERS
   ============================ */

function addProtocol(name, data = {}) {
  appendToMemory("protocols", {
    name,
    data,
    created: Date.now(),
    expired: false
  });
}

function clearProtocols() {
  updateMemory("protocols", []);
}

/* ============================
   EXPORT
   ============================ */

window.protocolsEngine = protocolsEngine;
window.addProtocol = addProtocol;
window.clearProtocols = clearProtocols;

