/* ============================
   BEYOND‑OS — RENDERER
   ============================ */

function render() {
  const state = getState();
  const screen = state.screen;
  const app = document.getElementById("app");

  if (!app) return;

  // Safety wrapper
  try {
    app.innerHTML = renderScreen(screen, state);
  } catch (err) {
    console.error("Renderer error:", err);
    app.innerHTML = `
      <div class="os-panel">
        <h2 style="color: var(--accent)">Renderer Error</h2>
        <p class="os-text-muted">${err.message}</p>
      </div>
    `;
  }
}

/* ============================
   SCREEN ROUTER
   ============================ */

function renderScreen(screen, state) {
  switch (screen) {
    case "boot":
      return renderBoot();

    case "dashboard":
      return renderDashboard(state);

    case "protocols":
      return renderProtocols(state);

    case "tasks":
      return renderTasks(state);

    case "weekly":
      return renderWeekly(state);

    case "reports":
      return renderReports(state);

    default:
      return `
        <div class="os-panel">
          <h2 style="color: var(--accent)">Unknown Screen</h2>
          <p class="os-text-muted">${screen}</p>
        </div>
      `;
  }
}

/* ============================
   INDIVIDUAL SCREENS
   ============================ */

function renderBoot() {
  return `
    <div class="os-panel">
      <h1 style="color: var(--accent)">
