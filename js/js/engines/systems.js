/* ============================
   BEYOND‑OS — SYSTEMS ENGINE
   ============================ */

function systemsEngine(state) {
  // Ensure OS boots only once
  if (!state.booted) return;

  // Basic system heartbeat
  updateSystemTimestamp(state);

  // Auto‑resolve errors after a few cycles
  resolveSystemErrors(state);
}

/* ============================
   SYSTEM TIMESTAMP
   ============================ */

function updateSystemTimestamp(state) {
  const now = Date.now();
  state.memory.lastUpdate = now;
}

/* ============================
   ERROR RESOLUTION
   ============================ */

let errorCooldown = 0;

function resolveSystemErrors(state) {
  if (!state.flags.error) return;

  errorCooldown++;

  // After 3 cycles, clear the error
  if (errorCooldown >= 3) {
    state.flags.error = null;
    errorCooldown = 0;
  }
}

/* ============================
   EXPORT
   ============================ */

window.systemsEngine = systemsEngine;

