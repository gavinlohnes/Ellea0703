// ============================
// TRENDS ENGINE (stub)
// ============================

function trendsEngine(state) {
  // Ensure trend memory exists
  if (!state.memory.trends) {
    state.memory.trends = {
      fatigueHistory: [],
      hydrationHistory: [],
      loadHistory: []
    };
  }

  // Push latest values into history arrays
  state.memory.trends.fatigueHistory.push(state.fatigue);
  state.memory.trends.hydrationHistory.push(state.hydration);
  state.memory.trends.loadHistory.push(state.trainingLoad);

  // Limit history length to prevent runaway memory growth
  const MAX_HISTORY = 100;
  if (state.memory.trends.fatigueHistory.length > MAX_HISTORY)
    state.memory.trends.fatigueHistory.shift();

  if (state.memory.trends.hydrationHistory.length > MAX_HISTORY)
    state.memory.trends.hydrationHistory.shift();

  if (state.memory.trends.loadHistory.length > MAX_HISTORY)
    state.memory.trends.loadHistory.shift();
}


