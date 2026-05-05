// BEYOND OS — HUD Route
// The main dashboard screen

export function renderHUD(app) {
    app.innerHTML = `
        <div class="panel">
            <div class="section-title">HUD Overview</div>
            <p>Welcome to BEYOND OS. This is your tactical dashboard.</p>
        </div>

        <div class="panel grid-2">
            <div class="card">
                <div class="section-title">Today</div>
                <p>Daily readiness, tasks, and cycle status.</p>
            </div>

            <div class="card">
                <div class="section-title">Loadout</div>
                <p>Your current configuration and presets.</p>
            </div>
        </div>

        <div class="panel">
            <div class="section-title">Next Actions</div>
            <p>System suggestions will appear here.</p>
        </div>
    `;
}
