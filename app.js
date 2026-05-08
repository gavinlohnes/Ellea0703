// -----------------------------
// PHASE 1 — CORE CONTRACT
// -----------------------------
const OS_CONTRACT = {
    name: "BEYOND‑OS",
    owner: "Gavin",
    version: "0.2-skeleton",
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
    screens: ["home", "protocol", "systems", "log"],
    defaultScreen: "home",
};

// -----------------------------
// PHASE 3 — STATE ENGINE
// -----------------------------
const State = (function () {
    const _state = {
        currentScreen: ARCH.defaultScreen,
        modal: null,
        log: [],
        systemStatus: {
            hydration: "idle",
            nutrition: "idle",
            training: "idle",
        },
    };

    const listeners = [];

    function getState() {
        return JSON.parse(JSON.stringify(_state));
    }

    function setState(patch, meta = {}) {
        const prev = getState();
        Object.assign(_state, patch);
        const next = getState();
        if (OS_CONTRACT.rules.logActions) {
            console.log("[OS:STATE] PATCH", { patch, meta });
        }
        listeners.forEach((fn) => fn(next, prev, meta));
    }

    function onChange(fn) {
        listeners.push(fn);
        return () => {
            const idx = listeners.indexOf(fn);
            if (idx >= 0) listeners.splice(idx, 1);
        };
    }

    function appendLog(entry) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...entry,
        };
        _state.log.push(logEntry);
        if (_state.log.length > 50) _state.log.shift();
        if (OS_CONTRACT.rules.logEvents) {
            console.log("[OS:LOG]", logEntry);
        }
    }

    return {
        getState,
        setState,
        onChange,
        appendLog,
    };
})();

// -----------------------------
// PHASE 4 — EVENT BUS
// -----------------------------
const EventBus = (function () {
    const handlers = {};

    function on(event, handler) {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
        return () => {
            handlers[event] = handlers[event].filter((h) => h !== handler);
        };
    }

    function emit(event, payload) {
        if (OS_CONTRACT.rules.logEvents) {
            console.log("[OS:EVENT]", event, payload || {});
        }
        (handlers[event] || []).forEach((h) => h(payload));
    }

    return { on, emit };
})();

// -----------------------------
// PHASE 5 — ACTION LAYER
// -----------------------------
const Actions = (function (state, bus) {

    // -----------------------------
    // CORE ACTIONS
    // -----------------------------
    function navigate(screen) {
        if (!ARCH.screens.includes(screen)) {
            console.warn("[OS:NAV] Invalid screen:", screen);
            return;
        }
        state.setState({ currentScreen: screen }, { type: "NAVIGATE" });
        state.appendLog({ type: "NAVIGATE", screen });
        bus.emit("NAVIGATED", { screen });
    }

    function openModal(id, data = {}) {
        state.setState({ modal: { id, data } }, { type: "OPEN_MODAL" });
        state.appendLog({ type: "OPEN_MODAL", id });
        bus.emit("MODAL_OPENED", { id, data });
    }

    function closeModal() {
        state.setState({ modal: null }, { type: "CLOSE_MODAL" });
        state.appendLog({ type: "CLOSE_MODAL" });
        bus.emit("MODAL_CLOSED", {});
    }

    function pingSystem(systemKey) {
        state.appendLog({ type: "PING_SYSTEM", systemKey });
        bus.emit("SYSTEM_PING", { systemKey });

        if (state.getState().systemStatus[systemKey] !== undefined) {
            const statuses = ["idle", "active", "optimal", "warning"];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const patch = { systemStatus: { ...state.getState().systemStatus } };
            patch.systemStatus[systemKey] = newStatus;
            state.setState(patch, { type: "SYSTEM_UPDATE", system: systemKey });
        }
    }

    // -----------------------------
    // TODAY MODE v2 ACTIONS
    // -----------------------------
    function setDailyObjective(objective) {
        const today = { ...state.getState().today, objective };
        state.setState({ today });
        state.appendLog({ type: "DAILY_OBJECTIVE_SET", objective });
    }

    function recordWin(title) {
        const today = state.getState().today;
        const wins = [...(today.wins || []), { title, timestamp: new Date().toISOString() }];
        state.setState({ today: { ...today, wins } });
        state.appendLog({ type: "WIN_RECORDED", title });
    }

    function startCycle(minutes = 90) {
        const now = Date.now();
        const today = state.getState().today;
        state.setState({
            today: { ...today, cycleStart: now, cycleEnd: now + minutes * 60000 }
        });
        state.appendLog({ type: "FOCUS_CYCLE_STARTED", duration: minutes });
    }

    // -----------------------------
    // PROTOCOL ENGINE v2 ACTIONS
    // -----------------------------
    function addRule(text, category = "general") {
        const newRule = {
            id: "rule-" + Date.now(),
            category,
            text,
            active: true
        };
        const protocols = [...(state.getState().protocols || []), newRule];
        state.setState({ protocols });
        state.appendLog({ type: "RULE_ADDED", text, category });
    }

    function toggleRule(ruleId) {
        const protocols = (state.getState().protocols || []).map(r =>
            r.id === ruleId ? { ...r, active: !r.active } : r
        );
        state.setState({ protocols });
        state.appendLog({ type: "RULE_TOGGLED", ruleId });
    }

    // -----------------------------
    // SYSTEMS ENGINE v3 ACTIONS
    // -----------------------------
    function logHydration(amount) {
        const hyd = state.getState().hydration || { current: 0, target: 3500 };
        state.setState({ hydration: { ...hyd, current: hyd.current + amount } });
        state.appendLog({ type: "HYDRATION_LOGGED", amount });
    }

    function calculateSystemScore() {
        const s = state.getState();
        let score = 0;

        if ((s.hydration?.current || 0) >= (s.hydration?.target || 3500)) score += 40;
        if ((s.today?.wins?.length || 0) >= 3) score += 30;
        if (s.training?.length > 0) score += 30;

        return Math.min(100, score);
    }

    // -----------------------------
    // LOG INTELLIGENCE v2 ACTIONS
    // -----------------------------
    function generateDailySummary() {
        state.appendLog({ type: "DAILY_SUMMARY_REQUEST" });
        openModal("daily-summary");
    }

    function generateWeeklySummary() {
    state.appendLog({ type: "WEEKLY_SUMMARY_REQUEST" });
    openModal("weekly-summary");
}

    // -----------------------------
    // EXISTING ACTIONS
    // -----------------------------
    function enterTodayMode() {
        state.appendLog({ type: "TODAY_MODE_ENTER" });
        bus.emit("TODAY_MODE_ENTERED", {});
        openModal("today-mode");
    }

    function logQuickWin(title) {
        state.appendLog({ type: "QUICK_WIN", title, impact: "positive" });
        bus.emit("QUICK_WIN_LOGGED", { title });
    }

    function loadProtocol(name) {
        state.appendLog({ type: "PROTOCOL_LOAD", protocol: name });
        bus.emit("PROTOCOL_LOADED", { name });
        openModal("protocol-view", { name });
    }

    function analyzeLog() {
        state.appendLog({ type: "LOG_ANALYSIS_REQUEST" });
        bus.emit("LOG_ANALYSIS_STARTED", {});
        setTimeout(() => openModal("log-intelligence"), 420);
    }

    // -----------------------------
    // ACTION EXPORT
    // -----------------------------
    return {
        navigate,
        openModal,
        closeModal,
        pingSystem,

        // Today Mode v2
        setDailyObjective,
        recordWin,
        startCycle,

        // Protocol Engine v2
        addRule,
        toggleRule,

        // Systems Engine v3
        logHydration,
        calculateSystemScore,

        // Log Intelligence v2
        generateDailySummary,
        generateWeeklySummary,

        // Existing
        enterTodayMode,
        logQuickWin,
        loadProtocol,
        analyzeLog
    };

})(State, EventBus);

// -----------------------------
// PHASE 6 — NAVIGATION MODEL
// -----------------------------
const Navigation = (function (actions) {
    const items = [
        { id: "home", label: "HOME" },
        { id: "protocol", label: "PROTOCOL" },
        { id: "systems", label: "SYSTEMS" },
        { id: "log", label: "LOG" },
        { id: "today", label: "TODAY" },
    ];

    function goTo(id) {
        if (id === "today") {
            actions.enterTodayMode();
            return;
        }
        actions.navigate(id);
    }

    function getItems() {
        return items.slice();
    }

    return { goTo, getItems };
})(Actions);

// -----------------------------
// PHASE 7 — MODAL MODEL
// -----------------------------
const Modals = (function (actions) {
    function getModalDefinition(id) {
        if (!id) return null;
        const defs = {
            "about-os": {
                title: "BEYOND‑OS",
                body: "Tactical personal OS skeleton. Built for Gavin.",
            },
            "today-mode": {
                title: "TODAY MODE",
                body: "Focus window active. What is your primary objective for this cycle?",
            },
            "protocol-view": {
                title: "ACTIVE PROTOCOL",
                body: "Discipline is the bridge between goals and accomplishment.",
            },
            "log-intelligence": {
                title: "LOG INTELLIGENCE",
                body: "Pattern detected: Consistent execution in morning systems. Momentum building.",
            }
        };
        return defs[id] || null;
    }

    function openAbout() {
        actions.openModal("about-os");
    }

    function openTodayMode() {
        actions.openModal("today-mode");
    }

    return { 
        getModalDefinition, 
        openAbout,
        openTodayMode 
    };
})(Actions);

// -----------------------------
// PHASE 9 — NEW MODULES
// -----------------------------
const Modules = (function (state, actions) {
    
    // Today Mode Engine
    const TodayMode = {
        init() {
            console.log("%c[TODAY MODE] Tactical focus layer online", "color:#ff003c");
        },
        recordWin(title) {
            actions.logQuickWin(title);
        }
    };

    // Protocol Engine
    const ProtocolEngine = {
        protocols: {
            "morning-protocol": ["Hydrate", "Movement", "Deep Work Block"],
            "evening-protocol": ["Review", "Shutdown Ritual", "No Input"]
        },
        
        activate(name) {
            actions.loadProtocol(name);
        },
        
        getActiveRules() {
            return ["No social media before 10:00", "Minimum 3L water", "Training before 18:00"];
        }
    };

    // Systems Engine Upgrades
    const SystemsEngine = {
        upgradeSystem(systemKey, newStatus) {
            const current = state.getState().systemStatus;
            const patch = { systemStatus: { ...current } };
            patch.systemStatus[systemKey] = newStatus;
            state.setState(patch, { type: "SYSTEM_UPGRADE" });
            state.appendLog({ type: "SYSTEM_UPGRADE", system: systemKey, status: newStatus });
        },
        
        getAllStatuses() {
            return state.getState().systemStatus;
        }
    };

    // Log Intelligence
    const LogIntelligence = {
        generateInsight() {
            const log = state.getState().log;
            if (log.length < 3) return "Insufficient data for analysis.";
            
            const recent = log.slice(-5);
            const pingCount = recent.filter(e => e.type === "PING_SYSTEM").length;
            
            if (pingCount > 2) {
                return "High system engagement detected. Execution rhythm strong.";
            }
            return "Consistent logging observed. Discipline compounding.";
        },
        
        runAnalysis() {
            actions.analyzeLog();
        }
    };

    // Auto-initialize enhanced modules
    setTimeout(() => {
        TodayMode.init();
        state.appendLog({ type: "MODULE_INIT", modules: ["TodayMode", "ProtocolEngine", "SystemsEngine", "LogIntelligence"] });
    }, 800);

    return {
        TodayMode,
        ProtocolEngine,
        SystemsEngine,
        LogIntelligence
    };
})(State, Actions);

// -----------------------------
// PHASE 8 — RENDERER
// -----------------------------
const Renderer = (function (state, nav, modals) {
    function render() {
        const root = document.getElementById("app");
        if (!root) {
            console.error("[OS:RENDER] #app not found");
            return;
        }

        const s = state.getState();
        root.innerHTML = `
            <div class="os-root">
                <div class="os-frame">
                    ${renderHeader(s)}
                    <div class="os-body">
                        ${renderSidebar(s)}
                        ${renderMain(s)}
                    </div>
                    ${renderFooter(s)}
                    ${renderModal(s)}
                </div>
            </div>
        `;
        attachEvents();
    }

    function renderHeader() {
        return `
            <header class="os-header">
                <div class="os-brand">
                    <span class="os-brand-main">BEYOND‑OS</span>
                    <span class="os-brand-sub">v${OS_CONTRACT.version}</span>
                </div>
                <div class="os-header-right">
                    <button class="os-btn os-btn-ghost" data-action="open-about">
                        ABOUT
                    </button>
                </div>
            </header>
        `;
    }

    function renderSidebar(s) {
        const items = nav.getItems();
        return `
            <nav class="os-sidebar">
                ${items
                    .map((item) => {
                        const active = item.id === s.currentScreen;
                        return `
                            <button
                                class="os-nav-item ${active ? "active" : ""}"
                                data-nav="${item.id}"
                            >
                                ${item.label}
                            </button>
                        `;
                    })
                    .join("")}
            </nav>
        `;
    }

    function renderMain(s) {
        return `
            <main class="os-main">
                ${renderScreen(s.currentScreen, s)}
            </main>
        `;
    }

    function renderScreen(id, state) {
        switch (id) {
            case "home":
                return renderHome(state);
            case "protocol":
                return renderProtocol(state);
            case "systems":
                return renderSystems(state);
            case "log":
                return renderLog(state);
            default:
                return `<div class="os-panel">Unknown screen: ${id}</div>`;
        }
    }

    function renderHome(state) {
        return `
            <section class="os-panel">
                <h1 class="os-title">WELCOME, ${OS_CONTRACT.owner.toUpperCase()}</h1>
                <p class="os-text-muted">
                    BEYOND‑OS skeleton is online. This is your tactical base layer.
                </p>
                <div class="os-grid">
                    <div class="os-card">
                        <h2 class="os-card-title">Protocol</h2>
                        <p class="os-card-text">
                            Define your daily rules, constraints, and non‑negotiables.
                        </p>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Systems</h2>
                        <p class="os-card-text">
                            Hydration, nutrition, training, sleep — wired in as modules.
                        </p>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Log</h2>
                        <p class="os-card-text">
                            Every action, event, and decision — captured for review.
                        </p>
                    </div>
                </div>
            </section>
        `;
    }

    function renderProtocol(state) {
        return `
            <section class="os-panel">
                <h1 class="os-title">PROTOCOL</h1>
                <p class="os-text-muted">
                    This is where your daily operating rules will live.
                </p>
                <button class="os-btn" data-action="load-protocol" data-protocol="morning-protocol">LOAD MORNING PROTOCOL</button>
            </section>
        `;
    }

    function renderSystems(state) {
        const sys = state.systemStatus;
        return `
            <section class="os-panel">
                <h1 class="os-title">SYSTEMS</h1>
                <p class="os-text-muted">
                    Core subsystems — ready to be wired into real engines.
                </p>
                <div class="os-grid">
                    <div class="os-card">
                        <h2 class="os-card-title">Hydration</h2>
                        <p class="os-card-text">Status: ${sys.hydration}</p>
                        <button class="os-btn os-btn-outline" data-ping="hydration">PING</button>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Nutrition</h2>
                        <p class="os-card-text">Status: ${sys.nutrition}</p>
                        <button class="os-btn os-btn-outline" data-ping="nutrition">PING</button>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Training</h2>
                        <p class="os-card-text">Status: ${sys.training}</p>
                        <button class="os-btn os-btn-outline" data-ping="training">PING</button>
                    </div>
                </div>
            </section>
        `;
    }

    function renderLog(state) {
        const entries = state.log.slice().reverse();
        return `
            <section class="os-panel">
                <h1 class="os-title">LOG</h1>
                <p class="os-text-muted">
                    Recent actions and events.
                </p>
                <button class="os-btn os-btn-outline" data-action="analyze-log">RUN INTELLIGENCE</button>
                <div class="os-log">
                    ${
                        entries.length === 0
                            ? `<div class="os-log-empty">No entries yet.</div>`
                            : entries
                                  .map((e) => {
                                      return `
                                <div class="os-log-entry">
                                    <div class="os-log-meta">
                                        <span class="os-log-type">${e.type || "EVENT"}</span>
                                        <span class="os-log-time">${e.timestamp}</span>
                                    </div>
                                    <pre class="os-log-body">${JSON.stringify(
                                        e,
                                        null,
                                        2
                                    )}</pre>
                                </div>
                            `;
                                  })
                                  .join("")
                    }
                </div>
            </section>
        `;
    }

    function renderFooter(state) {
        return `
            <footer class="os-footer">
                <span>BEYOND‑OS SKELETON</span>
                <span>${OS_CONTRACT.owner}</span>
            </footer>
        `;
    }

    function renderModal(state) {
        const modal = state.modal;
        if (!modal) return "";
        const def = modals.getModalDefinition(modal.id);
        if (!def) return "";
        return `
            <div class="os-modal-backdrop" data-action="close-modal">
                <div class="os-modal" data-modal-root>
                    <h2 class="os-modal-title">${def.title}</h2>
                    <p class="os-modal-body">${def.body}</p>
                    <button class="os-btn" data-action="close-modal">CLOSE</button>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        const root = document.getElementById("app");
        if (!root) return;

        root.querySelectorAll("[data-nav]").forEach((el) => {
            el.addEventListener("click", () => {
                const id = el.getAttribute("data-nav");
                Navigation.goTo(id);
            });
        });

        root.querySelectorAll("[data-action='open-about']").forEach((el) => {
            el.addEventListener("click", () => {
                Modals.openAbout();
            });
        });

        root.querySelectorAll("[data-action='close-modal']").forEach((el) => {
            el.addEventListener("click", (e) => {
                if (
                    e.target.hasAttribute("data-action") ||
                    e.target.hasAttribute("data-modal-root") === false
                ) {
                    Actions.closeModal();
                }
            });
        });

        root.querySelectorAll("[data-ping]").forEach((el) => {
            el.addEventListener("click", () => {
                const key = el.getAttribute("data-ping");
                Actions.pingSystem(key);
            });
        });

        // New Phase 9 event bindings
        root.querySelectorAll("[data-action='load-protocol']").forEach((el) => {
            el.addEventListener("click", () => {
                const protocol = el.getAttribute("data-protocol");
                Actions.loadProtocol(protocol);
            });
        });

        root.querySelectorAll("[data-action='analyze-log']").forEach((el) => {
            el.addEventListener("click", () => {
                Actions.analyzeLog();
            });
        });
    }

    return { render };
})(State, Navigation, Modals);

// -----------------------------
// PHASE 10 — BOOT
// -----------------------------
function boot() {
    console.log("[BEYOND‑OS] Booting skeleton…", {
        contract: OS_CONTRACT,
        arch: ARCH,
    });

    State.appendLog({ type: "BOOT", version: OS_CONTRACT.version });

    State.onChange(() => {
        Renderer.render();
    });

    Renderer.render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
