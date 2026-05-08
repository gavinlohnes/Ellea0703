function reportsEngine(state) {
  if (!state.memory.reports) {
    state.memory.reports = {
      lastGenerated: null,
      summaries: []
    };
  }
}

