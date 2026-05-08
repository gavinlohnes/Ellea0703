/* ============================
   BEYOND‑OS — TASKS ENGINE
   ============================ */

function tasksEngine(state) {
  if (!state.booted) return;

  decayOldTasks(state);
  autoCleanup(state);
}

/* ============================
   TASK DECAY
   ============================ */

function decayOldTasks(state) {
  const tasks = state.memory.tasks;
  if (!Array.isArray(tasks)) return;

  const now = Date.now();

  tasks.forEach(task => {
    if (!task.created) task.created = now;

    const age = now - task.created;

    // 24 hours = 86,400,000 ms
    if (age > 86400000 && !task.expired) {
      task.expired = true;
    }
  });
}

/* ============================
   AUTO‑CLEANUP
   ============================ */

function autoCleanup(state) {
  const tasks = state.memory.tasks;
  if (!Array.isArray(tasks)) return;

  // Remove tasks older than 3 days
  const cutoff = Date.now() - (3 * 86400000);

  state.memory.tasks = tasks.filter(task => {
    return task.created >= cutoff;
  });
}

/* ============================
   TASK HELPERS
   ============================ */

function addTask(text) {
  appendToMemory("tasks", {
    text,
    created: Date.now(),
    expired: false
  });
}

function clearTasks() {
  updateMemory("tasks", []);
}

/* ============================
   EXPORT
   ============================ */

window.tasksEngine = tasksEngine;
window.addTask = addTask;
window.clearTasks = clearTasks;
