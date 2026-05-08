/* BEYOND‑OS — FULL SKELETON (PHASES 1–12)
   Single-file OS core: state, actions, navigation, renderer, modals, event bus.
*/

(function () {

    // -----------------------------
    // PHASE 1 — CORE CONTRACT
    // -----------------------------
    const OS_CONTRACT = {
        name: "BEYOND‑OS",
        owner: "Gavin",
        version: "0.1-skeleton",
        rules: {
            allowDestructive: false,
            logActions: true,
            logEvents: true,
            defaultScreen: "home",
        },
    };

    // -----------------------------
    // PHASE 2 — ARCHITECTURE SPEC
    // -----------------------------
    const ARCH = {
        screens: ["home", "hydration", "meals", "training", "cycle", "system"],
        engines: ["hydrationEngine", "mealEngine", "trainingEngine", "cycleEngine", "readinessEngine"],
        layers: ["state", "actions", "controllers", "renderer", "navigation", "modals", "persistence", "events"],
    };

    // -----------------------------
    // PHASE 3 — STATE ENGINE
    // -----------------------------
    const Store = (function () {
        const initialState = {
            ui: {
                activeScreen: OS_CONTRACT.rules.defaultScreen,
                modal: null,
                lastAction: null,
            },
            hydration: {
                targetOz: 80,
                consumedOz: 32,
                lastLog: null,
            },
            meals: {
                todayMeals: 3,
                preppedMeals: 5,
                lastPrep: null,
            },
            training: {
                microcycleDay: 2,
                sessionPlanned: true,
                lastCompleted: null,
            },
            readiness: {
                score: 78,
                status: "Operational",
            },
            cycle: {
                phase: "Load",
                dayInPhase: 3,
            },
        };

        let state = structuredClone(initialState);
        const listeners = new Set();

        function getState() {
            return state;
        }

        function setState(partial, meta = {}) {
            state = Object.freeze({
                ...state,
                ...partial,
            });
            if (OS_CONTRACT.rules.logActions && meta.type) {
                console.log("[OS:STATE]", meta.type, meta.payload || null);
            }
            listeners.forEach((fn) => fn(state, meta));
        }

        function update(path, value, meta = {}) {
            const segments = path.split(".");
            const newState = { ...state };
            let cursor = newState;
            for (let i = 0; i < segments.length - 1; i++) {
                const key = segments[i];
                cursor[key] = { ...cursor[key] };
                cursor = cursor[key];
            }
            cursor[segments[segments.length - 1]] = value;
            state = Object.freeze(newState);
            if (OS_CONTRACT.rules.logActions && meta.type) {
                console.log("[OS:STATE]", meta.type, meta.payload || null);
            }
            listeners.forEach((fn) => fn(state, meta));
        }

        function subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        }

        return {
            getState,
            setState,
            update,
            subscribe,
            reset: () => {
                state = structuredClone(initialState);
                listeners.forEach((fn) => fn(state, { type: "RESET" }));
            },
        };
    })();
    // -----------------------------
    // PHASE 4 — ACTION LAYER
    // -----------------------------
    const Actions = (function (store) {

        function logHydration(amountOz) {
            const state = store.getState();
            const newTotal = state.hydration.consumedOz + amountOz;

            store.setState(
                {
                    hydration: {
                        ...state.hydration,
                        consumedOz: newTotal,
                        lastLog: new Date().toISOString(),
                    },
                    ui: {
                        ...state.ui,
                        lastAction: `Logged ${amountOz}oz`,
                    },
                },
                { type: "HYDRATION_LOG", payload: { amountOz } }
            );
        }

        function logMeal() {
            const state = store.getState();
            store.setState(
                {
                    meals: {
                        ...state.meals,
                        todayMeals: state.meals.todayMeals + 1,
                    },
                    ui: {
                        ...state.ui,
                        lastAction: "Logged meal",
                    },
                },
                { type: "MEAL_LOG" }
            );
        }

        function completeTrainingSession() {
            const state = store.getState();
            store.setState(
                {
                    training: {
                        ...state.training,
                        lastCompleted: new Date().toISOString(),
                        sessionPlanned: false,
                    },
                    ui: {
                        ...state.ui,
                        lastAction: "Training complete",
                    },
                },
                { type: "TRAINING_COMPLETE" }
            );
        }

        function advanceCycleDay() {
            const state = store.getState();
            store.setState(
                {
                    cycle: {
                        ...state.cycle,
                        dayInPhase: state.cycle.dayInPhase + 1,
                    },
                    ui: {
                        ...state.ui,
                        lastAction: "Cycle advanced",
                    },
                },
                { type: "CYCLE_ADVANCE" }
            );
        }

        function recalcReadiness() {
            const state = store.getState();
            const delta = Math.floor(Math.random() * 7) - 3;
            let score = state.readiness.score + delta;
            score = Math.max(40, Math.min(95, score));
            const status = score >= 80 ? "Prime" : score >= 65 ? "Operational" : "Conserve";

            store.setState(
                {
                    readiness: {
                        ...state.readiness,
                        score,
                        status,
                    },
                    ui: {
                        ...state.ui,
                        lastAction: "Readiness recalculated",
                    },
                },
                { type: "READINESS_RECALC" }
            );
        }

        return {
            logHydration,
            logMeal,
            completeTrainingSession,
            advanceCycleDay,
            recalcReadiness,
        };
    })(Store);


    // -----------------------------
    // PHASE 5 — RENDERER
    // -----------------------------
    const Renderer = (function (store) {
        let rootEl = null;

        function mount(rootId) {
            rootEl = document.getElementById(rootId);
            if (!rootEl) {
                console.error("OS: root element not found:", rootId);
                return;
            }
            store.subscribe(render);
            render(store.getState(), { type: "INIT" });
        }

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

        function renderStatusBar(state) {
            const now = new Date();
            const time = now.toTimeString().slice(0, 5);
            return `
                <div class="app-status-bar">
                    <div class="app-status-bar-left">
                        <div class="app-status-dot"></div>
                        <span>${OS_CONTRACT.name}</span>
                    </div>
                    <div>${time}</div>
                </div>
            `;
        }

        function renderTopBar(state) {
            return `
                <div class="app-top-bar">
                    <div class="app-title-block">
                        <div class="app-title">BEYOND‑OS</div>
                        <div class="app-subtitle">Operator: ${OS_CONTRACT.owner}</div>
                    </div>
                    <div class="app-badge">Skeleton • v0.1</div>
                </div>
            `;
        }

        function renderScreen(screen, state) {
            switch (screen) {
                case "home": return renderHomeScreen(state);
                case "hydration": return renderHydrationScreen(state);
                case "meals": return renderMealsScreen(state);
                case "training": return renderTrainingScreen(state);
                case "cycle": return renderCycleScreen(state);
                case "system": return renderSystemScreen(state);
                default:
                    return `<div class="card"><div class="card-body">Unknown screen: ${screen}</div></div>`;
            }
        }

        function renderHomeScreen(state) {
            const h = state.hydration;
            const m = state.meals;
            const t = state.training;
            const r = state.readiness;
            const c = state.cycle;

            const hydrationPct = Math.round((h.consumedOz / h.targetOz) * 100);

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Readiness</div>
                            <div class="card-subtitle">System snapshot</div>
                        </div>
                        <div class="card-pill">${r.status}</div>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="metric-block">
                                <div class="metric-label">Readiness score</div>
                                <div class="metric-value">${r.score}</div>
                                <div class="metric-tag-row">
                                    <span class="metric-tag">Status</span>
                                    <span class="metric-status-ok">${r.status}</span>
                                </div>
                            </div>
                            <div class="metric-block">
                                <div class="metric-label">Cycle phase</div>
                                <div class="metric-value">${c.phase}</div>
                                <div class="metric-tag-row">
                                    <span class="metric-tag">Day</span>
                                    <span class="metric-status-warn">D${c.dayInPhase}</span>
                                </div>
                            </div>
                        </div>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="recalc-readiness">Recalc readiness</button>
                            <button class="btn btn-ghost" data-nav="cycle">Cycle view</button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Hydration</div>
                            <div class="card-subtitle">Today’s intake</div>
                        </div>
                        <div class="card-pill">${hydrationPct}%</div>
                    </div>
                    <div class="card-body">
                        <div class="grid-2">
                            <div class="metric-block">
                                <div class="metric-label">Consumed</div>
                                <div class="metric-value">${h.consumedOz}oz</div>
                                <div class="metric-tag-row">
                                    <span class="metric-tag">Target</span>
                                    <span class="metric-status-ok">${h.targetOz}oz</span>
                                </div>
                            </div>
                            <div class="metric-block">
                                <div class="metric-label">Meals logged</div>
                                <div class="metric-value">${m.todayMeals}</div>
                                <div class="metric-tag-row">
                                    <span class="metric-tag">Prepped</span>
                                    <span class="metric-status-ok">${m.preppedMeals}</span>
                                </div>
                            </div>
                        </div>

                        <div class="btn-row">
                            <button class="btn btn-primary" data-action="log-hydration-8">+8oz</button>
                            <button class="btn btn-ghost" data-nav="hydration">Hydration view</button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Training</div>
                            <div class="card-subtitle">Microcycle</div>
                        </div>
                        <div class="card-pill">Day ${t.microcycleDay}</div>
                    </div>
                    <div class="card-body">
                        <div class="metric-block">
                            <div class="metric-label">Session</div>
                            <div class="metric-value">${t.sessionPlanned ? "Planned" : "Complete"}</div>
                            <div class="metric-tag-row">
                                <span class="metric-tag">Control</span>
                                <span class="${t.sessionPlanned ? "metric-status-warn" : "metric-status-ok"}">
                                    ${t.sessionPlanned ? "Pending" : "Done"}
                                </span>
                            </div>
                        </div>

                        <div class="btn-row">
                            <button class="btn btn-primary" data-action="complete-training">Mark complete</button>
                            <button class="btn btn-ghost" data-nav="training">Training view</button>
                        </div>
                    </div>
                </div>
            `;
        }
        }

        function renderHydrationScreen(state) {
            const h = state.hydration;
            const pct = Math.round((h.consumedOz / h.targetOz) * 100);

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Hydration engine</div>
                            <div class="card-subtitle">Today’s protocol</div>
                        </div>
                        <div class="card-pill">${pct}%</div>
                    </div>

                    <div class="card-body">
                        <p class="text-muted">Hydration engine surface. Adaptive targets will live here.</p>

                        <div class="grid-2" style="margin-top:8px;">
                            <div class="metric-block">
                                <div class="metric-label">Consumed</div>
                                <div class="metric-value">${h.consumedOz}oz</div>
                            </div>

                            <div class="metric-block">
                                <div class="metric-label">Target</div>
                                <div class="metric-value">${h.targetOz}oz</div>
                            </div>
                        </div>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="log-hydration-8">+8oz</button>
                            <button class="btn btn-ghost" data-nav="home">Back</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderMealsScreen(state) {
            const m = state.meals;

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Meal engine</div>
                            <div class="card-subtitle">Prep + execution</div>
                        </div>
                        <div class="card-pill">${m.todayMeals} logged</div>
                    </div>

                    <div class="card-body">
                        <p class="text-muted">Meal engine surface. Anchor meals + prep cycles will live here.</p>

                        <div class="grid-2" style="margin-top:8px;">
                            <div class="metric-block">
                                <div class="metric-label">Today</div>
                                <div class="metric-value">${m.todayMeals}</div>
                            </div>

                            <div class="metric-block">
                                <div class="metric-label">Prepped</div>
                                <div class="metric-value">${m.preppedMeals}</div>
                            </div>
                        </div>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="log-meal">Log meal</button>
                            <button class="btn btn-ghost" data-nav="home">Back</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderTrainingScreen(state) {
            const t = state.training;

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Training engine</div>
                            <div class="card-subtitle">Microcycle control</div>
                        </div>
                        <div class="card-pill">Day ${t.microcycleDay}</div>
                    </div>

                    <div class="card-body">
                        <p class="text-muted">Training engine surface. Session templates + intensity logic will live here.</p>

                        <div class="metric-block" style="margin-top:8px;">
                            <div class="metric-label">Session</div>
                            <div class="metric-value">${t.sessionPlanned ? "Planned" : "Complete"}</div>
                        </div>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="complete-training">Mark complete</button>
                            <button class="btn btn-ghost" data-nav="home">Back</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCycleScreen(state) {
            const c = state.cycle;

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Cycle engine</div>
                            <div class="card-subtitle">Macro / micro</div>
                        </div>
                        <div class="card-pill">${c.phase}</div>
                    </div>

                    <div class="card-body">
                        <p class="text-muted">Cycle engine surface. Block planning + deload logic will live here.</p>

                        <div class="metric-block" style="margin-top:8px;">
                            <div class="metric-label">Day in phase</div>
                            <div class="metric-value">D${c.dayInPhase}</div>
                        </div>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="advance-cycle">Advance day</button>
                            <button class="btn btn-ghost" data-nav="home">Back</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderSystemScreen(state) {
            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">System layer</div>
                            <div class="card-subtitle">OS skeleton</div>
                        </div>
                        <div class="card-pill">Phases 1–12</div>
                    </div>

                    <div class="card-body">
                        <p class="text-muted">
                            Internal OS: state engine, actions, controllers, renderer, navigation, modals, persistence, event bus.
                        </p>

                        <div class="btn-row" style="margin-top:10px;">
                            <button class="btn btn-primary" data-action="open-modal" data-modal="reset-confirm">Reset state</button>
                            <button class="btn btn-ghost" data-nav="home">Back</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderNav(active) {
            const tabs = [
                { id: "home", label: "HUD" },
                { id: "hydration", label: "Hydration" },
                { id: "meals", label: "Meals" },
                { id: "training", label: "Training" },
                { id: "system", label: "System" },
            ];

            return `
                <div class="app-nav">
                    ${tabs
                        .map(
                            (t) => `
                        <div class="nav-item ${active === t.id ? "nav-item-active" : ""}" data-nav="${t.id}">
                            ${t.label}
                        </div>
                    `
                        )
                        .join("")}
                </div>
            `;
        }

        function renderModal(modal) {
            if (!modal) return "";

            if (modal.type === "reset-confirm") {
                return `
                    <div class="modal-backdrop" data-modal-dismiss>
                        <div class="modal-panel" data-modal-panel>
                            <div class="modal-title">Reset state</div>
                            <div class="modal-body">
                                This resets the OS skeleton to its initial state.
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-ghost" data-modal-dismiss>Cancel</button>
                                <button class="btn btn-primary" data-action="confirm-reset">Confirm</button>
                            </div>
                        </div>
                    </div>
                `;
            }

            return "";
        }

        function wireInteractions() {
            document.querySelectorAll("[data-nav]").forEach((el) => {
                el.addEventListener("click", () => {
                    Navigation.goTo(el.getAttribute("data-nav"));
                });
            });

            document.querySelectorAll("[data-action]").forEach((el) => {
                el.addEventListener("click", (ev) => {
                    const action = el.getAttribute("data-action");
                    const modal = el.getAttribute("data-modal");
                    handleAction(action, modal, ev);
                });
            });

            document.querySelectorAll("[data-modal-dismiss]").forEach((el) => {
                el.addEventListener("click", (ev) => {
                    if (ev.target.hasAttribute("data-modal-panel")) return;
                    Modal.close();
                });
            });
        }

        function handleAction(action, modalId) {
            switch (action) {
                case "log-hydration-8": Actions.logHydration(8); break;
                case "log-meal": Actions.logMeal(); break;
                case "complete-training": Actions.completeTrainingSession(); break;
                case "advance-cycle": Actions.advanceCycleDay(); break;
                case "recalc-readiness": Actions.recalcReadiness(); break;

                case "open-modal":
                    if (modalId === "reset-confirm") Modal.open({ type: "reset-confirm" });
                    break;

                case "confirm-reset":
                    Store.reset();
                    Modal.close();
                    break;

                default:
                    console.log("[OS:ACTIONS] Unknown action:", action);
            }
        }

        return { mount };
    })(Store);


    // -----------------------------
    // PHASE 6 — NAVIGATION
    // -----------------------------
    const Navigation = (function (store) {
        function goTo(screenId) {
            const state = store.getState();

            if (!ARCH.screens.includes(screenId)) {
                console.warn("[OS:NAV] Unknown screen:", screenId);
                return;
            }

            store.setState(
                {
                    ...state,
                    ui: { ...state.ui, activeScreen: screenId },
                },
                { type: "NAVIGATE", payload: { screenId } }
            );
        }

        return { goTo };
    })(Store);


    // -----------------------------
    // PHASE 7 — MODAL SYSTEM
    // -----------------------------
    const Modal = (function (store) {
        function open(modal) {
            const state = store.getState();
            store.setState(
                { ...state, ui: { ...state.ui, modal } },
                { type: "MODAL_OPEN", payload: modal }
            );
        }

        function close() {
            const state = store.getState();
            store.setState(
                { ...state, ui: { ...state.ui, modal: null } },
                { type: "MODAL_CLOSE" }
            );
        }

        return { open, close };
    })(Store);


    // -----------------------------
    // PHASE 8 — PERSISTENCE
    // -----------------------------
    const Persistence = (function (store) {
        const KEY = "BEYOND_OS_SKELETON_STATE";

        function save() {
            try {
                const state = store.getState();
                const payload = {
                    hydration: state.hydration,
                    meals: state.meals,
                    training: state.training,
                    readiness: state.readiness,
                    cycle: state.cycle,
                };
                localStorage.setItem(KEY, JSON.stringify(payload));
            } catch (e) {
                console.warn("[OS:PERSIST] Save failed:", e);
            }
        }

        function load() {
            try {
                const raw = localStorage.getItem(KEY);
                if (!raw) return;

                const parsed = JSON.parse(raw);
                const state = store.getState();

                store.setState(
                    { ...state, ...parsed },
                    { type: "PERSIST_LOAD" }
                );
            } catch (e) {
                console.warn("[OS:PERSIST] Load failed:", e);
            }
        }

        function attachAutoSave() {
            store.subscribe((state, meta) => {
                if (meta.type && meta.type !== "PERSIST_LOAD") save();
            });
        }

        return { load, attachAutoSave };
    })(Store);


    // -----------------------------
    // PHASE 9 — EVENT BUS
    // -----------------------------
    const EventBus = (function () {
        const listeners = {};

        function on(event, handler) {
            if (!listeners[event]) listeners[event] = new Set();
            listeners[event].add(handler);
            return () => listeners[event].delete(handler);
        }

        function emit(event, payload) {
            if (OS_CONTRACT.rules.logEvents) {
                console.log("[OS:EVENT]", event, payload || null);
            }
            (listeners[event] || []).forEach((fn) => fn(payload));
        }

        return { on, emit };
    })();


    // -----------------------------
    // PHASE 10 — CONTROLLERS
    // -----------------------------
    const Controllers = (function (actions, bus) {
        function init() {
            bus.on("DAY_ROLLOVER", () => {
                actions.advanceCycleDay();
                actions.recalcReadiness();
            });
        }

        return { init };
    })(Actions, EventBus);


    // -----------------------------
    // PHASE 11 — MICRO‑INTERACTIONS
    // -----------------------------
    const Motion = (function () {
        function bootPulse() {
            console.log("[OS:MOTION] Boot sequence nominal.");
        }
        return;
        return { bootPulse };
    })();


    // -----------------------------
    // PHASE 12 — SYSTEM BOOT
    // -----------------------------
    function boot() {
        console.log(`[${OS_CONTRACT.name}] Booting skeleton v${OS_CONTRACT.version}…`);

        Persistence.load();
        Persistence.attachAutoSave();
        Controllers.init();
        Motion.bootPulse();

        Renderer.mount("app-root");
    }

    document.addEventListener("DOMContentLoaded", boot);

})();
        
