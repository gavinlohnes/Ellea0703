/* ============================
   BEYOND‑OS — DASHBOARD RENDERER
   ============================ */

function renderDashboard(state) {
  const mem = state.memory;

  // Pull live engine values
  const fatigue = mem.fatigue ?? 0;
  const hydration = mem.hydration ?? 5;
  const load = mem.trainingLoad ?? 0;

  // Derived metrics
  const readiness = Math.max(0, 10 - fatigue);
  const hydrationPct = Math.round((hydration / 10) * 100);
  const loadPct = Math.round((load / 10) * 100);

  return `
    <div class="dash-grid">

      <div class="dash-card">
        <div class="dash-label">Fatigue</div>
        <div class="dash-value">${fatigue}/10</div>
        <div class="dash-bar"><div style="width:${fatigue * 10}%"></div></div>
      </div>

      <div class="dash-card">
        <div class="dash-label">Hydration</div>
        <div class="dash-value">${hydration}/10</div>
        <div class="dash-bar"><div style="width:${hydrationPct}%"></div></div>
      </div>

      <div class="dash-card">
        <div class="dash-label">Training Load</div>
        <div class="dash-value">${load}/10</div>
        <div class="dash-bar"><div style="width:${loadPct}%"></div></div>
      </div>

      <div class="dash-card">
        <div class="dash-label">Readiness</div>
        <div class="dash-value">${readiness}/10</div>
        <div class="dash-bar"><div style="width:${readiness * 10}%"></div></div>
      </div>

    </div>
  `;
}
