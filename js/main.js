import { renderHUD } from "./routes/hud.js";
import { renderLoadout } from "./routes/loadout.js";
import { renderCycle } from "./routes/cycle.js";
import { renderNutrition } from "./routes/nutrition.js";
import { renderSync } from "./routes/sync.js";

const app = document.getElementById("app");

const routes = {
    hud: renderHUD,
    loadout: renderLoadout,
    cycle: renderCycle,
    nutrition: renderNutrition,
    sync: renderSync
};

function navigate(route) {
    app.innerHTML = "";
    routes[route](app);
}

document.querySelectorAll("#bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.route));
});

navigate("hud");
