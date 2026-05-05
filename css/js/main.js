// BEYOND OS — Main Application Loader

import { renderHUD } from "./routes/hud.js";
import { renderLoadout } from "./routes/loadout.js";
import { renderCycle } from "./routes/cycle.js";
import { renderNutrition } from "./routes/nutrition.js";
import { renderSync } from "./routes/sync.js";

const app = document.getElementById("app");

// Route map
const routes = {
    hud: renderHUD,
    loadout: renderLoadout,
    cycle: renderCycle,
    nutrition: renderNutrition,
    sync: renderSync
};

// Load a route into the #app container
function navigate(route) {
    app.innerHTML = ""; // clear screen

    if (routes[route]) {
        routes[route](app);
    } else {
        app.innerHTML = `<div class="panel">Route not found: ${route}</div>`;
    }
}

// Attach nav buttons
document.querySelectorAll("#bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
        const route = btn.getAttribute("data-route");
        navigate(route);
    });
});

// Boot the OS on HUD
navigate("hud");
