/* ============================
   BEYOND‑OS — MAIN APP UI
   ============================ */

window.addEventListener("DOMContentLoaded", () => {
  const state = {
    booted: false,
    memory: {
      protocols: []
    }
  };

  // Boot system
  state.booted = true;

  // Start operator loop
  setInterval(() => {
    runEngines(state);
    renderUI(state);
  }, 1000);
});

/* ============================
   ENGINE RUNNER
   ============================ */

function runEngines(state) {
  if (window.driftEngine) driftEngine(state);
  if (window.recoveryEngine) recoveryEngine(state);
  if (window.trainingLoadEngine) trainingLoadEngine(state);
  if (window.fatigueEngine) fatigueEngine(state);
  if (window.hydrationCurveEngine) hydrationCurveEngine(state);
  if (window.predictiveEngine) predictiveEngine(state);
  if (window.adaptiveProtocolsEngine) adaptiveProtocolsEngine(state);
  if (window.protocolTuningEngine) protocolTuningEngine(state);
  if (window.protocolInterruptionEngine) protocolInterruptionEngine(state);
  if (window.weeklyEngine) weeklyEngine(state);
}

/* ============================
   UI RENDERER
   ============================ */

function renderUI(state) {
  const container = document.getElementById("app");
  if (!container) return;

  container.innerHTML = `
    <h1>BEYOND‑OS</h1>
    ${renderOSTelemetry(state)}
  `;
}

/* ============================
   OS TELEMETRY BLOCK
   ============================ */

function renderOSTelemetry(state) {
  const mem = state.memory;

  const fatigue = mem.fatigue ?? 0;
  const hydration = mem.hydration ?? 5;
  const load = mem.trainingLoad ?? 0;

  const protocolCount = Array.isArray(mem.protocols) ? mem.protocols.length : 0;
  const completedProtocols = Array.isArray(mem.protocols)
    ? mem.protocols.filter(p => p.completed).length
    : 0;

  const predictions = mem.predictions || {
    fatigueRisk: 0,
    hydrationRisk: 0,
    overloadRisk: 0,
    protocolFailures: 0
  };

  return `
    <div class="os-telemetry">
      <div><strong>Fatigue:</strong> ${fatigue}/10</div>
      <div><strong>Hydration:</strong> ${hydration}/10</div>
      <div><strong>Training Load:</strong> ${load}/10</div>

      <div><strong>Protocols:</strong> ${protocolCount}</div>
      <div><strong>Completed:</strong> ${completedProtocols}</div>

      <div><strong>Fatigue Risk:</strong> ${predictions.fatigueRisk}</div>
      <div><strong>Hydration Risk:</strong> ${predictions.hydrationRisk}</div>
      <div><strong>Overload Risk:</strong> ${predictions.overloadRisk}</div>
      <div><strong>Protocol Failures:</strong> ${predictions.protocolFailures}</div>
    </div>
  `;
}
