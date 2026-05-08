// =============================
// DOMAIN: OS CONTRACT
// =============================
const OS_CONTRACT = {
    owner: "Gavin",
    version: "1.0.0",
    screens: [
        { id: "home", label: "Home" },
        { id: "protocol", label: "Protocol" },
        { id: "systems", label: "Systems" },
        { id: "log", label: "Log" }
    ]
};

// =============================
// DOMAIN: STATE ENGINE
// =============================
const State = (function () {
    let _state = {
        currentScreen: "home",
        todayMode: { type: "work" },
        systemStatus: {
            hydration: "OK",
            nutrition: "OK",
            training: "IDLE"
        },
        modal: null,
        log: []
    };

    const listeners = [];

    function getState() {
        return JSON.parse(JSON.stringify(_state));
    }

    function setState(patch, meta) {
        _state = { ..._state, ...patch };
        if (meta) appendLog(meta);
        listeners.forEach((fn) => fn(getState()));
    }

    function appendLog(entry) {
        const withTime = {
            ...entry,
            timestamp: new Date().toISOString()
        };
        _state.log.push(withTime);
        if (_state.log.length > 200) {
            _state.log.shift();
        }
    }

    function subscribe(fn) {
        listeners.push(fn);
        return () => {
            const idx = listeners.indexOf(fn);
            if (idx >= 0) listeners.splice(idx, 1);
        };
    }

    return { getState, setState, appendLog, subscribe };
})();

// =============================
// DOMAIN: NAVIGATION
// =============================
const Navigation = (function () {
    function getItems() {
        return OS_CONTRACT.screens;
    }

    function goTo(id) {
        const exists = OS_CONTRACT.screens.some((s) => s.id === id);
        if (!exists) return;
        State.setState({ currentScreen: id }, { type: "NAVIGATE", to: id });
        Renderer.render();
    }

    return { getItems, goTo };
})();

// =============================
// DOMAIN: MODALS
// =============================
const Modals = (function () {
    const defs = {
        about: {
            id: "about",
            title: "ABOUT BEYOND‑OS",
            body: `
                <p>Personal operating system shell for Gavin.</p>
                <p class="text-muted">v${OS_CONTRACT.version}</p>
            `
        }
    };

    function getModalDefinition(id) {
        return defs[id] || null;
    }

    function open(id) {
        const def = getModalDefinition(id);
        if (!def) return;
        State.setState({ modal: { id } }, { type: "MODAL_OPEN", id });
        Renderer.render();
    }

    function close() {
        State.setState({ modal: null }, { type: "MODAL_CLOSE" });
        Renderer.render();
    }

    function openAbout() {
        open("about");
    }

    return { getModalDefinition, open, close, openAbout };
})();

// =============================
// DOMAIN: ACTIONS
// =============================
const Actions = (function () {
    function closeModal() {
        Modals.close();
    }

    function loadProtocol(protocolId) {
        State.appendLog({ type: "PROTOCOL_LOAD", protocolId });
        Renderer.render();
    }

    function pingSystem(id) {
        State.appendLog({ type: "SYSTEM_PING", id });
        Renderer.render();
    }

    function analyzeLog() {
        const s = State.getState();
        const mode = s.todayMode?.type || "work";
        const summary =
            mode === "work"
                ? "Work mode active. Execution rhythm under observation."
                : "Off mode active. Recovery and decompression prioritized.";
        State.appendLog({ type: "LOG_ANALYSIS", summary });
        Renderer.render();
    }

    function setMode(mode) {
        State.setState({ todayMode: { type: mode } }, { type: "MODE_SET", mode });
        document.body.setAttribute("data-mode", mode);
        Renderer.render();
    }

    function toggleMode() {
        const current = State.getState().todayMode?.type || "work";
        const next = current === "work" ? "off" : "work";
        setMode(next);
    }

    return {
        closeModal,
        loadProtocol,
        pingSystem,
        analyzeLog,
        setMode,
        toggleMode
    };
})();

// =============================
// DOMAIN: FUTURE MODULE HOOKS
// =============================
const FutureModules = {
    WorkoutEngine: {
        init() {
            State.appendLog({ type: "WORKOUT_ENGINE_INIT" });
        },
        getTodayWorkout() {
            return null;
        },
        recordSession(_data) {}
    },
    MealEngine: {
        init() {
            State.appendLog({ type: "MEAL_ENGINE_INIT" });
        },
        getTodayMeals() {
            return [];
        },
        logMeal(_meal) {}
    },
    ShoppingEngine: {
        init() {
            State.appendLog({ type: "SHOPPING_ENGINE_INIT" });
        },
        getShoppingList() {
            return [];
        }
    },
    WeeklyMode: {
        init() {
            State.appendLog({ type: "WEEKLY_MODE_INIT" });
        },
        getWeekSummary() {
            return null;
        }
    },
    DeloadLogic: {
        init() {
            State.appendLog({ type: "DELOAD_LOGIC_INIT" });
        },
        shouldDeload() {
            return false;
        }
    },
    RecoveryScore: {
        init() {
            State.appendLog({ type: "RECOVERY_SCORE_INIT" });
        },
        compute() {
            return 50;
        }
    }
};

// auto‑init future modules
setTimeout(() => {
    Object.values(FutureModules).forEach((m) => m.init && m.init());
}, 1200);

// =============================
// DOMAIN: UI COMPONENT LIBRARY
// =============================
const UI = {};

UI.card = function ({ title, subtitle, body, footer }) {
    return `
        <div class="card">
            ${title ? `<div class="card-title">${title}</div>` : ""}
            ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ""}
            ${body ? `<div class="card-body">${body}</div>` : ""}
            ${footer ? `<div class="btn-row">${footer}</div>` : ""}
        </div>
    `;
};

UI.metricBlock = function ({ label, value, action }) {
    return `
        <div class="metric-block">
            <div class="metric-label">${label}</div>
            <div class="metric-value">${value}</div>
            ${action ? `<div class="btn-row">${action}</div>` : ""}
        </div>
    `;
};

UI.button = function ({ label, action, variant = "ghost", attrs = "" }) {
    const actionAttr = action ? `data-action="${action}"` : "";
    return `
        <div class="btn btn-${variant}" ${actionAttr} ${attrs}>
            ${label}
        </div>
    `;
};

UI.modal = function ({ title, body }) {
    return `
        <div class="modal-backdrop" data-action="close-modal">
            <div class="modal-panel" data-modal-root>
                <div class="modal-title">${title}</div>
                <div class="modal-body">${body}</div>
                <div class="modal-footer">
                    ${UI.button({
                        label: "Close",
                        action: "close-modal",
                        variant: "primary"
                    })}
                </div>
            </div>
        </div>
    `;
};

UI.navItem = function ({ id, label, active }) {
    return `
        <div 
            class="nav-item ${active ? "nav-item-active" : ""}" 
            data-nav="${id}"
        >
            ${label}
        </div>
    `;
};

// =============================
// DOMAIN: RENDERER
// =============================
const Renderer = (function (state, nav, modals) {
    function render() {
        const root = document.getElementById("app");
        if (!root) return;

        const s = state.getState();
        document.body.setAttribute("data-mode", s.todayMode?.type || "work");

        root.innerHTML = `
            <div id="app-root">
                <div class="app-frame">
                    ${renderTopBar(s)}
                    <div class="app-content">
                        ${renderScreen(s.currentScreen, s)}
                    </div>
                    ${renderNav(s)}
                    ${renderModal(s)}
                </div>
            </div>
        `;

        attachEvents();
    }

    function renderTopBar(s) {
        return `
            <div class="app-top-bar">
                <div class="app-title-block">
                    <div class="app-title">BEYOND‑OS</div>
                    <div class="app-subtitle">v${OS_CONTRACT.version}</div>
                </div>
                <div class="app-badge" data-action="toggle-mode">
                    MODE: ${s.todayMode?.type.toUpperCase()}
                </div>
            </div>
        `;
    }

    function renderNav(s) {
        return `
            <div class="app-nav">
                ${nav
                    .getItems()
                    .map((item) =>
                        UI.navItem({
                            id: item.id,
                            label: item.label,
                            active: item.id === s.currentScreen
                        })
                    )
                    .join("")}
            </div>
        `;
    }

    function renderScreen(id, s) {
        switch (id) {
            case "home":
                return renderHome(s);
            case "protocol":
                return renderProtocol(s);
            case "systems":
                return renderSystems(s);
            case "log":
                return renderLog(s);
            default:
                return UI.card({ body: `Unknown screen: ${id}` });
        }
    }

    function renderHome(s) {
        const mode = s.todayMode?.type || "work";
        const modeLine =
            mode === "work"
                ? "Work mode: execute, train, hydrate."
                : "Off mode: recover, decompress, reset.";

        return `
            ${UI.card({
                title: `WELCOME, ${OS_CONTRACT.owner.toUpperCase()}`,
                body: `BEYOND‑OS skeleton is online. Tactical base layer active.<br/><br/>${modeLine}`
            })}

            <div class="grid-2">
                ${UI.card({
                    title: "Protocol",
                    body: "Define your rules and constraints."
                })}
                ${UI.card({
                    title: "Systems",
                    body: "Hydration, nutrition, training modules."
                })}
                ${UI.card({
                    title: "Log",
                    body: "Recent actions and events."
                })}
            </div>
        `;
    }

    function renderProtocol() {
        return UI.card({
            title: "PROTOCOL",
            body: "Your operating rules live here.",
            footer: UI.button({
                label: "Load Morning Protocol",
                action: "load-protocol",
                variant: "primary",
                attrs: `data-protocol="morning-protocol"`
            })
        });
    }

    function renderSystems(s) {
        const sys = s.systemStatus;
        const mode = s.todayMode?.type || "work";

        const trainingLabel = mode === "work" ? "Training" : "Recovery";
        const trainingValue =
            mode === "work" ? sys.training : "RECOVERY FOCUS";

        return `
            ${UI.card({
                title: "SYSTEMS",
                body: "Core subsystems online."
            })}

            <div class="grid-2">
                ${UI.metricBlock({
                    label: "Hydration",
                    value: sys.hydration,
                    action: UI.button({
                        label: "Ping",
                        action: "",
                        attrs: `data-ping="hydration"`
                    })
                })}
                ${UI.metricBlock({
                    label: "Nutrition",
                    value: sys.nutrition,
                    action: UI.button({
                        label: "Ping",
                        action: "",
                        attrs: `data-ping="nutrition"`
                    })
                })}
                ${UI.metricBlock({
                    label: trainingLabel,
                    value: trainingValue,
                    action: UI.button({
                        label: "Ping",
                        action: "",
                        attrs: `data-ping="training"`
                    })
                })}
            </div>
        `;
    }

    function renderLog(s) {
        const entries = s.log.slice().reverse();

        let logCards =
            entries.length === 0
                ? UI.card({
                      subtitle: "Empty Log",
                      body: "No entries yet."
                  })
                : entries
                      .map((e) =>
                          UI.card({
                              subtitle: e.timestamp,
                              body: `<pre>${JSON.stringify(e, null, 2)}</pre>`
                          })
                      )
                      .join("");

        return `
            ${UI.card({
                title: "LOG",
                body: "Recent actions and events.",
                footer: UI.button({
                    label: "Run Intelligence",
                    action: "analyze-log",
                    variant: "primary"
                })
            })}
            ${logCards}
        `;
    }

    function renderModal(s) {
        const modal = s.modal;
        if (!modal) return "";
        const def = modals.getModalDefinition(modal.id);
        if (!def) return "";
        return UI.modal({
            title: def.title,
            body: def.body
        });
    }

    function attachEvents() {
        const root = document.getElementById("app");
        if (!root) return;

        root.querySelectorAll("[data-nav]").forEach((el) => {
            el.addEventListener("click", () => {
                Navigation.goTo(el.getAttribute("data-nav"));
            });
        });

        root.querySelectorAll("[data-action='open-about']").forEach((el) => {
            el.addEventListener("click", () => Modals.openAbout());
        });

        root.querySelectorAll("[data-action='close-modal']").forEach((el) => {
            el.addEventListener("click", () => Actions.closeModal());
        });

        root.querySelectorAll("[data-ping]").forEach((el) => {
            el.addEventListener("click", () => {
                Actions.pingSystem(el.getAttribute("data-ping"));
            });
        });

        root.querySelectorAll("[data-action='load-protocol']").forEach((el) => {
            el.addEventListener("click", () => {
                Actions.loadProtocol(el.getAttribute("data-protocol"));
            });
        });

        root.querySelectorAll("[data-action='analyze-log']").forEach((el) => {
            el.addEventListener("click", () => Actions.analyzeLog());
        });

        root.querySelectorAll("[data-action='toggle-mode']").forEach((el) => {
            el.addEventListener("click", () => Actions.toggleMode());
        });

        root
            .querySelectorAll(".app-badge[data-action='open-about']")
            .forEach((el) => {
                el.addEventListener("click", () => Modals.openAbout());
            });
    }

    return { render };
})(State, Navigation, Modals);

// =============================
// BOOT
// =============================
document.addEventListener("DOMContentLoaded", () => {
    Renderer.render();
});
