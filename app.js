// =============================================
// BEYOND-OS — Main JavaScript
// =============================================

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
    }

    return {
        navigate,
        openModal,
        closeModal,
        pingSystem,
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
    ];

    function goTo(id) {
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
        };
        return defs[id] || null;
    }

    function openAbout() {
        actions.openModal("about-os");
    }

    return { getModalDefinition, openAbout };
})(Actions);

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
            case "home": return renderHome(state);
            case "protocol": return renderProtocol(state);
            case "systems": return renderSystems(state);
            case "log": return renderLog(state);
            default: return `<div class="os-panel">Unknown screen: ${id}</div>`;
        }
    }

    function renderHome() {
        return `
            <section class="os-panel">
                <h1 class="os-title">WELCOME, ${OS_CONTRACT.owner.toUpperCase()}</h1>
                <p class="os-text-muted">
                    BEYOND‑OS skeleton is online. This is your tactical base layer.
                </p>
                <div class="os-grid">
                    <div class="os-card">
                        <h2 class="os-card-title">Protocol</h2>
                        <p class="os-card-text">Define your daily rules, constraints, and non‑negotiables.</p>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Systems</h2>
                        <p class="os-card-text">Hydration, nutrition, training — wired in as modules.</p>
                    </div>
                    <div class="os-card">
                        <h2 class="os-card-title">Log</h2>
                        <p class="os-card-text">Every action, event, and decision captured.</p>
                    </div>
                </div>
            </section>
        `;
    }

    function renderProtocol() {
        return `
            <section class="os-panel">
                <h1 class="os-title">PROTOCOL</h1>
                <p class="os-text-muted">This is where your daily operating rules will live.</p>
            </section>
        `;
    }

    function renderSystems(state) {
        const sys = state.systemStatus;
        return `
            <section class="os-panel">
                <h1 class="os-title">SYSTEMS</h1>
                <p class="os-text-muted">Core subsystems — ready to be wired into real engines.</p>
                <div class="os-grid">
                    ${Object.keys(sys).map(key => `
                        <div class="os-card">
                            <h2 class="os-card-title">${key.charAt(0).toUpperCase() + key.slice(1)}</h2>
                            <p class="os-card-text">Status: ${sys[key]}</p>
                            <button class="os-btn os-btn-outline" data-ping="${key}">PING</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function renderLog(state) {
        const entries = state.log.slice().reverse();
        return `
            <section class="os-panel">
                <h1 class="os-title">LOG</h1>
                <p class="os-text-muted">Recent actions and events.</p>
                <div class="os-log">
                    ${entries.length === 0 
                        ? `<div class="os-log-empty">No entries yet.</div>` 
                        : entries.map(e => `
                            <div class="os-log-entry">
                                <div class="os-log-meta">
                                    <span class="os-log-type">${e.type || "EVENT"}</span>
                                    <span>${new Date(e.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <pre class="os-log-body">${JSON.stringify(e, null, 2)}</pre>
                            </div>
                        `).join("")
                    }
                </div>
            </section>
        `;
    }

    function renderFooter() {
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
                <div class="os-modal">
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

        root.querySelectorAll("[data-nav]").forEach(el => {
            el.addEventListener("click", () => Navigation.goTo(el.getAttribute("data-nav")));
        });

        root.querySelectorAll("[data-action='open-about']").forEach(el => {
            el.addEventListener("click", Modals.openAbout);
        });

        root.querySelectorAll("[data-action='close-modal']").forEach(el => {
            el.addEventListener("click", Actions.closeModal);
        });

        root.querySelectorAll("[data-ping]").forEach(el => {
            el.addEventListener("click", () => Actions.pingSystem(el.getAttribute("data-ping")));
        });
    }

    return { render };
})(State, Navigation, Modals);

// -----------------------------
// PHASE 10 — BOOT
// -----------------------------
function boot() {
    console.log("%c[BEYOND‑OS] Booting v" + OS_CONTRACT.version, "color:#ff003c; font-weight:bold");

    State.appendLog({ type: "BOOT", version: OS_CONTRACT.version });

    State.onChange(() => Renderer.render());

    Renderer.render();
}

// Auto start
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
