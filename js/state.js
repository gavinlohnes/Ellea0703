/* ============================
   BEYOND‑OS — STATE ENGINE
   ============================ */

const OSState = {
  booted: false,

  screen: "boot", 
  // other screens will include:
  // "dashboard", "protocols", "tasks", "weekly", "reports", etc.

  memory: {
    tasks: [],
    protocols: [],
    weeklyPlan: {},
    fatigue: 0,
    hydration: 0,
    trainingLoad: 0,
    trends: {},
    reports: []
  },

  flags: {
    busy: false,
    error: null
  },

  operator: {
    name: "Gavin",
    mode: "normal", 
    // modes: normal, adaptive, predictive, recovery
  }
};

/* ============================
   STATE ACCESS HELPERS
   ============================ */

function getState() {
  return OSState;
}

function setScreen(screenName) {
  OSState.screen = screenName;
}

function setFlag(flag, value) {
  OSState.flags[flag] = value;
}

function updateMemory(key, value) {
  OSState.memory[key] = value;
}

function appendToMemory(key, value) {
  if (!Array.isArray(OSState.memory[key])) return;
  OSState.memory[key].push(value);
}

/* ============================
   EXPORT
   ============================ */

window.OSState = OSState;
window.getState = getState;
window.setScreen = setScreen;
window.setFlag = setFlag;
window.updateMemory = updateMemory;
window.appendToMemory = appendToMemory;

