/* ============================
   BEYOND‑OS — MAIN APP UI
   ============================ */

let currentScreen = "home";
let state = {
  booted: false,
  memory: {
    protocols: []
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");

  nav.addEventListener("click", (e) => {
    if (e.target.dataset.screen) {
      currentScreen = e.target.dataset.screen;
      renderUI(state);
    }
  });

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
  if (window.weeklyEngine) weeklyEngine(state);
}

/* ============================
   UI RENDERER
   ============================ */

function renderUI(state) {
  const container = document.getElementById("app");
  if (!container) return;

  let html = "";

  if (currentScreen === "home") {
    html = renderHome(state);
  } else if (currentScreen === "system") {
    html = renderSystem(state);
  } else if (currentScreen === "protocols") {
    html = renderProtocols(state);
  } else if (currentScreen === "cycle") {
    html = renderCycle(state);
  }

  container.innerHTML = html;
}

/* ============================
   SCREENS
   ============================ */

function renderHome(state) {
  return `
    <h2>Home</h2>
    ${renderOSTelemetry(state)}
  `;
}

function renderSystem(state) {
  return `
    <h2>System Status</h2>
    ${renderOSTelemetry(state)}
  `;
}

function renderProtocols(state) {
  return `
    <h2>Protocols</h2>
    <p>No protocol UI yet.</p>
  `;
}

function renderCycle(state) {
  return `
    <h2>Cycle</h2>
    <p>Cycle UI coming soon.</p>
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
