// BEYOND OS — Nutrition Route
// Anchor meals, macros, and weekly prep system

export function renderNutrition(app) {
    app.innerHTML = `
        <div class="panel">
            <div class="section-title">Nutrition</div>
            <p>Your anchor meals, macros, and weekly prep overview.</p>
        </div>

        <div class="panel grid-2">
            <div class="card">
                <div class="section-title">Anchor Meals</div>
                <p>Weekly anchor meals will appear here.</p>
            </div>

            <div class="card">
                <div class="section-title">Macros</div>
                <p>Macro breakdown and targets.</p>
            </div>
        </div>

        <div class="panel">
            <div class="section-title">Shopping List</div>
            <p>Auto‑generated shopping lists will appear here.</p>
        </div>
    `;
}
