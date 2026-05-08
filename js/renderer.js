/* ============================
   BEYOND‑OS — RENDERER ENGINE
   ============================ */

function rendererEngine(state) {
  if (!state.booted) return;

  renderState(state);
}

/* ============================
   RENDER LOGIC
   ============================ */

function renderState(state) {
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

  const output = `
    <div class="beyond-os-panel">
      <h2>BEYOND‑OS STATUS</h2>

      <div class="metrics">
        <p><strong>Fatigue:</strong> ${fatigue}/10</p>
        <p><strong>Hydration:</strong> ${hydration}/10</p>
        <p><strong>Training Load:</strong> ${load}/10</p>
      </div>

      <div class="protocols">
        <p><strong>Active Protocols:</strong> ${protocolCount}</p>
        <p><strong>Completed Protocols:</strong> ${completedProtocols}</p>
      </div>

      <div class="predictions">
        <p><strong>Fatigue Risk:</strong> ${predictions.fatigueRisk}</p>
        <p><strong>Hydration Risk:</strong> ${predictions.hydrationRisk}</p>
        <p><strong>Overload Risk:</strong> ${predictions.overloadRisk}</p>
        <p><strong>Protocol Failure Risk:</strong> ${predictions.protocolFailures}</p>
      </div>
    </div>
  `;

  const container = document.getElementById("beyond-os-output");
  if (container) container.innerHTML = output;
}

/* ============================
   EXPORT
   ============================ */

window.rendererEngine = rendererEngine;
