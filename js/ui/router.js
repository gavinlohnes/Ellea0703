/* ============================
   BEYOND‑OS — ROUTER (FIXED)
   ============================ */

import { OS } from "../core/os.js";
import { renderDashboard } from "./renderer.js";
import { renderProtocols } from "./renderer.js";
import { renderSettings } from "./renderer.js";

let routeCallback = null;

/* ---------- Initialize Router ---------- */
export function initRouter(cb) {
    routeCallback = cb;

    // Listen for state changes
    OS.subscribe((state) => {
        if (routeCallback) {
            routeCallback(state.route);
        }
    });
}

/* ---------- Set Route ---------- */
export function setRoute(routeName) {
    OS.dispatch({
        type: "SET_ROUTE",
        payload: routeName
    });
}

/* ---------- Route Table (FIXED) ---------- */
export function resolveRoute(route) {
    switch (route) {

        case "/":
        case "/dashboard":
            return renderDashboard;

        case "/protocols":
            return renderProtocols;

        case "/settings":
            return renderSettings;

        default:
            return renderDashboard; // fallback
    }
}
