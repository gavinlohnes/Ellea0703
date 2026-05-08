/* ============================
   BEYOND‑OS — CORE OS ENGINE
   ============================ */

export const OS = {
  state: {
    booted: false,
    memory: {},
    ui: {
      activeScreen: "home",
      modal: null,
      lastAction: null
    }
  },

  listeners: [],

  /* ---------- Subscribe to state changes ---------- */
  subscribe(fn) {
    this.listeners.push(fn);
  },

  /* ---------- Dispatch actions ---------- */
  dispatch(action) {
    if (!action || !action.type) return;

    switch (action.type) {
      case "BOOT":
        this.state.booted = true;
        break;

      case "NAVIGATE":
        this.state.ui.activeScreen = action.payload;
        this.state.ui.lastAction = `Navigated to ${action.payload}`;
        break;

      case "CLOSE_MODAL":
        this.state.ui.modal = null;
        break;

      default:
        break;
    }

    this.runEngines();
    this.notify();
  },

