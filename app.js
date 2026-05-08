window.onerror = (msg, url, line, col, error) => {
  document.body.innerHTML = `
    <pre style="color:red; font-size:20px; padding:20px; white-space:pre-wrap;">
      JS ERROR:
      ${msg}
      at ${url}:${line}:${col}
    </pre>
  `;
};
alert("JS loaded");
console.log("JS is running");
// rebuild 002
//rebuild 007 
/* BEYOND‑OS — SKELETON (PHASES 1–10)
   Core: state, actions, event bus, navigation, modals, renderer, boot.
*/

(function () {

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
        theme: {
            name: "BatmanBeyond",
            background: "#000000",
            accent: "#ff003c",
            accentSoft: "#ff4f7a",
            textPrimary: "#ffffff",
            textMuted: "#888888",
            panel: "#080808",
            border: "#1a1a1a",
        },
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
                console.log("[OS:STATE] PATCH", { patch, meta, next });
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
        const theme = ARCH.theme;

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

        function renderHeader(state) {
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

        function renderSidebar(state) {
            const items = nav.getItems();
            return `
                <nav class="os-sidebar">
                    ${items
                        .map((item) => {
                            const active = item.id === state.currentScreen;
                            return `
                                <button
                                    class="os-nav-item ${active ? "active" : ""}"
                                    data-nav="${item.id}"
                                >
                                    <span class="os-nav-label">${item.label}</span>
                                </button>
                            `;
                        })
                        .join("")}
                </nav>
            `;
        }

        function renderMain(state) {
            return `
                <main class="os-main">
                    ${renderScreen(state.currentScreen, state)}
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
                    <p class="os-text-soft">
                        Next step: we’ll wire in DailyProtocol from your advanced architecture.
                    </p>
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
                            <button class="os-btn os-btn-outline" data-ping="hydration">
                                PING
                            </button>
                        </div>
                        <div class="os-card">
                            <h2 class="os-card-title">Nutrition</h2>
                            <p class="os-card-text">Status: ${sys.nutrition}</p>
                            <button class="os-btn os-btn-outline" data-ping="nutrition">
                                PING
                            </button>
                        </div>
                        <div class="os-card">
                            <h2 class="os-card-title">Training</h2>
                            <p class="os-card-text">Status: ${sys.training}</p>
                            <button class="os-btn os-btn-outline" data-ping="training">
                                PING
                            </button>
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
        }

        return { render };
    })(State, Navigation, Modals);

    // -----------------------------
    // PHASE 9 — STYLE INJECTION
    // -----------------------------
    (function injectStyles() {
        const theme = ARCH.theme;
        const css = `
            :root {
                --os-bg: ${theme.background};
                --os-accent: ${theme.accent};
                --os-accent-soft: ${theme.accentSoft};
                --os-text: ${theme.textPrimary};
                --os-text-muted: ${theme.textMuted};
                --os-panel: ${theme.panel};
                --os-border: ${theme.border};
            }
            * { box-sizing: border-box; }
            body {
                margin: 0;
                background: var(--os-bg);
                color: var(--os-text);
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .os-root {
                min-height: 100vh;
                display: flex;
                align-items: stretch;
                justify-content: center;
                background: radial-gradient(circle at top, #1a000a 0, #000 55%);
                color: var(--os-text);
            }
            .os-frame {
                width: 100%;
                max-width: 1200px;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                padding: 16px;
                gap: 12px;
            }
            .os-header, .os-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(0,0,0,0.7);
                border: 1px solid var(--os-border);
                border-radius: 8px;
            }
            .os-brand-main {
                font-weight: 700;
                letter-spacing: 0.12em;
                color: var(--os-accent);
                font-size: 14px;
            }
            .os-brand-sub {
                font-size: 11px;
                color: var(--os-text-muted);
                margin-left: 8px;
            }
            .os-body {
                flex: 1;
                display: grid;
                grid-template-columns: 220px minmax(0, 1fr);
                gap: 12px;
            }
            .os-sidebar {
                background: rgba(0,0,0,0.7);
                border: 1px solid var(--os-border);
                border-radius: 8px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .os-nav-item {
                width: 100%;
                text-align: left;
                padding: 8px 10px;
                border-radius: 6px;
                border: 1px solid transparent;
                background: transparent;
                color: var(--os-text-muted);
                font-size: 12px;
                letter-spacing: 0.12em;
                cursor: pointer;
                text-transform: uppercase;
            }
            .os-nav-item.active {
                border-color: var(--os-accent);
                background: linear-gradient(90deg, rgba(255,0,60,0.2), transparent);
                color: var(--os-text);
            }
            .os-main {
                background: rgba(0,0,0,0.7);
                border: 1px solid var(--os-border);
                border-radius: 8px;
                padding: 12px;
                overflow: auto;
            }
            .os-panel {
                display: flex;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

(function injectStyles() {
    const theme = ARCH.theme;
    const css = `
           
.os-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.os-text-muted {
    font-size: 13px;
    color: var(--os-text-muted);
}

.os-text-soft {
    font-size: 13px;
    color: var(--os-accent-soft);
}

.os-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
}

.os-card {
    background: rgba(8,8,8,0.9);
    border-radius: 8px;
    border: 1px solid var(--os-border);
    padding: 10px;
}

.os-card-title {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: var(--os-accent);
    letter-spacing: 0.12em;
}

.os-card-text {
    font-size: 12px;
    color: var(--os-text-muted);
}

.os-btn {
    border-radius: 999px;
    border: 1px solid var(--os-accent);
    background: var(--os-accent);
    color: #000;
    padding: 6px 14px;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
}

.os-btn-ghost {
    background: transparent;
    color: var(--os-accent-soft);
    border-color: var(--os-accent-soft);
}

.os-btn-outline {
    background: transparent;
    color: var(--os-accent-soft);
    border-color: var(--os-accent);
}

.os-footer span {
    font-size: 11px;
    color: var(--os-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.os-log {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow: auto;
}

.os-log-entry {
    border-radius: 6px;
    border: 1px solid var(--os-border);
    padding: 6px;
    background: rgba(0,0,0,0.8);
}

.os-log-meta {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--os-text-muted);
    margin-bottom: 4px;
}

.os-log-type {
    color: var(--os-accent-soft);
}

.os-log-body {
    font-size: 10px;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}

.os-log-empty {
    font-size: 12px;
    color: var(--os-text-muted);
}

.os-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.os-modal {
    background: #050505;
    border-radius: 10px;
    border: 1px solid var(--os-accent);
    padding: 16px;
    max-width: 360px;
    width: 90%;
    box-shadow: 0 0 40px rgba(255,0,60,0.4);
}

.os-modal-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: var(--os-accent-soft);
}

.os-modal-body {
    font-size: 13px;
    color: var(--os-text-muted);
    margin: 0 0 12px 0;
}

@media (max-width: 768px) {
    .os-body {
        grid-template-columns: 1fr;
    }
    .os-sidebar {
        flex-direction: row;
        overflow-x: auto;
    }
    .os-nav-item {
        flex: 1;
        text-align: center;
        white-space: nowrap;
    }
}
`;
    const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);

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
    });   // ← THIS LINE WAS MISSING

    Renderer.render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
