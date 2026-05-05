// BEYOND OS — Loadout Route
// Configuration, presets, and system setup

export function renderLoadout(app) {
    app.innerHTML = `
        <div class="panel">
            <div class="section-title">Loadout</div>
            <p>Your current system configuration and presets.</p>
        </div>

        <div class="panel grid-2">
            <div class="card">
                <div class="section-title">Profile</div>
                <p>Identity, preferences, and system alignment.</p>
            </div>

            <div class="card">
                <div class="section-title">Modules</div>
                <p>Active modules and optional components.</p>
            </div>
        </div>

        <div class="panel">
            <div class="section-title">System Settings</div>
            <p>Future settings and customization options will appear here.</p>
        </div>
    `;
}
