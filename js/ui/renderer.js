/* ============================
   BEYOND‑OS — UNIFIED RENDERER
   ============================ */

const Renderer = (function (store) {
    let rootEl = null;

    /* ---------- MOUNT ---------- */
    function mount(rootId) {
        rootEl = document.getElementById(rootId);
        if (!rootEl) {
            console.error("OS: root element not found:", rootId);
            return;
        }
        store.subscribe(render);
        render(store.getState(), { type: "INIT" });
    }

    /* ---------- ROOT RENDER ---------- */
    function render(state) {
        if (!rootEl) return;

        const screen = state.ui.activeScreen;

        rootEl.innerHTML = `
            <div class="app-frame">
                ${renderStatusBar(state)}
                ${renderTopBar(state)}
                <div class="app-content">
                    ${renderScreen(screen, state)}
                </div>
                ${renderNav(screen)}
                ${state.ui.modal ? renderModal(state.ui.modal) : ""}
            </div>
        `;

        wireInteractions();
    }

    /* ============================
       STATUS BAR
       ============================ */
    function renderStatusBar(state) {
        const now = new Date();
        const time = now.toTimeString().slice(0, 5);
        return `
            <div style="background:#000; color:#666; padding:8px 16px; font-size:0.9rem; display:flex; justify-content:space-between;">
                <div>BEYOND‑OS v1.0</div>
                <div>${time}</div>
            </div>
        `;
    }

    /* ============================
       TOP BAR
       ============================ */
    function renderTopBar(state) {
        return `
            <div style="padding:12px 16px; background:#111; border-bottom:1px solid #222;">
                <strong>${state.ui.activeScreen.toUpperCase()}</strong>
                ${state.ui.lastAction ? `<small style="float:right; color:#666;">${state.ui.lastAction}</small>` : ""}
            </div>
        `;
    }

    /* ============================
       SCREEN ROUTER
       ============================ */
    function renderScreen(screen, state) {
        switch (screen) {
            case "home": return renderDashboard(state);
            case "hydration": return renderHydrationScreen(state);
            case "meals": return renderMealsScreen(state);
            case "training": return renderTrainingScreen(state);
            case "cycle": return renderCycleScreen(state);
            case "system": return renderSystemScreen(state);
            default: return `<div>Screen not found: ${screen}</div>`;
        }
    }

    /* ============================
       DASHBOARD (FIXED)
       ============================ */
    function renderDashboard(state) {
        const mem = state.memory;

        const fatigue = mem.fatigue ?? 0;
        const hydration = mem.hydration ?? 5;
        const load = mem.trainingLoad ?? 0;

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

    /* ============================
       HYDRATION SCREEN
       ============================ */
    function renderHydrationScreen(state) {
        const h = state.memory.hydration ?? 5;
        return `
            <div class="panel">
                <h2>Hydration</h2>
                <p>Current hydration: ${h}/10</p>
            </div>
        `;
    }

    /* ============================
       MEALS SCREEN
       ============================ */
    function renderMealsScreen(state) {
        return `
            <div class="panel">
                <h2>Meals</h2>
                <p>Meal planning coming online.</p>
            </div>
        `;
    }

    /* ============================
       TRAINING SCREEN
       ============================ */
    function renderTrainingScreen(state) {
        const load = state.memory.trainingLoad ?? 0;
        return `
            <div class="panel">
                <h2>Training</h2>
                <p>Training load: ${load}/10</p>
            </div>
        `;
    }

    /* ============================
       CYCLE SCREEN
       ============================ */
    function renderCycleScreen(state) {
        return `
            <div class="panel">
                <h2>Cycle</h2>
                <p>Cycle engine active.</p>
            </div>
        `;
    }

    /* ============================
       SYSTEM SCREEN
       ============================ */
    function renderSystemScreen(state) {
        return `
            <div class="panel">
                <h2>System</h2>
                <p>System diagnostics nominal.</p>
            </div>
        `;
    }

    /* ============================
       NAVIGATION BAR
       ============================ */
    function renderNav(active) {
        return `
            <div class="nav">
                <button data-nav="home" class="${active === "home" ? "active" : ""}">Home</button>
                <button data-nav="hydration" class="${active === "hydration" ? "active" : ""}">Hydration</button>
                <button data-nav="meals" class="${active === "meals" ? "active" : ""}">Meals</button>
                <button data-nav="training" class="${active === "training" ? "active" : ""}">Training</button>
                <button data-nav="cycle" class="${active === "cycle" ? "active" : ""}">Cycle</button>
                <button data-nav="system" class="${active === "system" ? "active" : ""}">System</button>
            </div>
        `;
    }

    /* ============================
       MODAL
       ============================ */
    function renderModal(modal) {
        return `
            <div class="modal-overlay">
                <div class="modal">
                    <h3>${modal.title}</h3>
                    <p>${modal.message}</p>
                    <button data-close-modal>Close</button>
                </div>
            </div>
        `;
    }

    /* ============================
       INTERACTIONS
       ============================ */
    function wireInteractions() {
        document.querySelectorAll("[data-nav]").forEach(btn => {
            btn.onclick = () => {
                store.dispatch({
                    type: "NAVIGATE",
                    payload: btn.dataset.nav
                });
            };
        });

        const closeBtn = document.querySelector("[data-close-modal]");
        if (closeBtn) {
            closeBtn.onclick = () => {
                store.dispatch({ type: "CLOSE_MODAL" });
            };
        }
    }

    return { mount };
})(OS.store);

window.Renderer = Renderer;
