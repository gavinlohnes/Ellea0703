// BEYOND OS v2 – Training + Nutrition + Recovery + Habits + Weekly Intel

// ----------------------
// TRAINING ENGINE
// ----------------------

function getCoreMarkState(fatigueScore, recoveryScore, trainingLoadIndex) {
  if (fatigueScore >= 63 && trainingLoadIndex >= 78) {
    return "OVERLOAD";
  } else if (fatigueScore >= 40 || recoveryScore <= 55) {
    return "RECOVERY";
  } else {
    return "ACTIVE";
  }
}

const datasetA = {
  label: "Dataset A – Stable Training (Expected ACTIVE)",
  fatigueScore: 26.4,
  recoveryScore: 83.3,
  trainingLoadIndex: 57.4,
  performanceDelta: 0.3
};

const datasetB = {
  label: "Dataset B – Accumulated Fatigue (Expected OVERLOAD)",
  fatigueScore: 67.6,
  recoveryScore: 44.6,
  trainingLoadIndex: 83.8,
  performanceDelta: -0.173
};

function renderOutputTo(elId, dataset) {
  const coreMarkState = getCoreMarkState(
    dataset.fatigueScore,
    dataset.recoveryScore,
    dataset.trainingLoadIndex
  );

  const outputEl = document.getElementById(elId);
  if (!outputEl) return;

  outputEl.innerText =
    `${dataset.label}\n\n` +
    `fatigueScore:      ${dataset.fatigueScore}\n` +
    `recoveryScore:     ${dataset.recoveryScore}\n` +
    `trainingLoadIndex: ${dataset.trainingLoadIndex}\n` +
    `performanceDelta:  ${dataset.performanceDelta}\n` +
    `coreMarkState:     ${coreMarkState}`;
}

// ----------------------
// NUTRITION HUD – STATE
// ----------------------

const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 160;

let anchors = JSON.parse(localStorage.getItem("anchors")) || {
  A: { name: "Anchor A", calories: 700, protein: 45 },
  B: { name: "Anchor B", calories: 700, protein: 45 }
};

let currentCalories = 0;
let currentProtein = 0;
let anchorALogged = false;
let anchorBLogged = false;

function saveAnchors() {
  localStorage.setItem("anchors", JSON.stringify(anchors));
}

function updateAnchorUI() {
  const idsA = [
    ["anchorAName", "anchorACals", "anchorAProtein"],
    ["anchorAName_n", "anchorACals_n", "anchorAProtein_n"]
  ];
  const idsB = [
    ["anchorBName", "anchorBCals", "anchorBProtein"],
    ["anchorBName_n", "anchorBCals_n", "anchorBProtein_n"]
  ];

  idsA.forEach(([nameId, calsId, protId]) => {
    const nameEl = document.getElementById(nameId);
    const calsEl = document.getElementById(calsId);
    const protEl = document.getElementById(protId);
    if (nameEl) nameEl.textContent = anchors.A.name;
    if (calsEl) calsEl.textContent = `${anchors.A.calories} kcal`;
    if (protEl) protEl.textContent = `${anchors.A.protein} g protein`;
  });

  idsB.forEach(([nameId, calsId, protId]) => {
    const nameEl = document.getElementById(nameId);
    const calsEl = document.getElementById(calsId);
    const protEl = document.getElementById(protId);
    if (nameEl) nameEl.textContent = anchors.B.name;
    if (calsEl) calsEl.textContent = `${anchors.B.calories} kcal`;
    if (protEl) protEl.textContent = `${anchors.B.protein} g protein`;
  });
}

function computeMode() {
  const calRatio = currentCalories / TARGET_CALORIES;
  const proteinRatio = currentProtein / TARGET_PROTEIN;

  if (calRatio <= 0.8 && proteinRatio >= 0.8) return "FAST";
  if (calRatio >= 1.1 || proteinRatio <= 0.5) return "CHILL";
  return "BALANCED";
}

function updateNutritionHUD() {
  const calIds = ["caloriesDisplay", "caloriesDisplay_n"];
  const protIds = ["proteinDisplay", "proteinDisplay_n"];
  const modeIds = ["modeDisplay", "modeDisplay_n"];
  const anchorIds = ["anchorStatus", "anchorStatus_n"];

  calIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${currentCalories} / ${TARGET_CALORIES}`;
  });

  protIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${currentProtein} / ${TARGET_PROTEIN} g`;
  });

  const mode = computeMode();
  modeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = mode;
  });

  const aMark = anchorALogged ? "☑" : "☐";
  const bMark = anchorBLogged ? "☑" : "☐";
  anchorIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = `A: ${aMark}  B: ${bMark}`;
  });

  updateRecoveryToday(); // nutrition feeds readiness
}

function logAnchor(anchorKey) {
  const meal = anchors[anchorKey];

  if (anchorKey === "A" && !anchorALogged) {
    currentCalories += meal.calories;
    currentProtein += meal.protein;
    anchorALogged = true;
  } else if (anchorKey === "B" && !anchorBLogged) {
    currentCalories += meal.calories;
    currentProtein += meal.protein;
    anchorBLogged = true;
  }

  updateNutritionHUD();
}

function quickAddProtein() {
  currentProtein += 25;
  updateNutritionHUD();
}

function quickAddCalories() {
  currentCalories += 250;
  updateNutritionHUD();
}

function resetNutrition() {
  currentCalories = 0;
  currentProtein = 0;
  anchorALogged = false;
  anchorBLogged = false;
  updateNutritionHUD();
}

function editAnchor(anchorKey) {
  const meal = anchors[anchorKey];

  const name = prompt("Meal name:", meal.name);
  if (!name) return;

  const calories = parseInt(prompt("Calories:", meal.calories), 10);
  if (isNaN(calories)) return;

  const protein = parseInt(prompt("Protein (g):", meal.protein), 10);
  if (isNaN(protein)) return;

  anchors[anchorKey] = { name, calories, protein };
  saveAnchors();
  updateAnchorUI();
}

// ----------------------
// HYDRATION + SLEEP + RECOVERY (v2)
// ----------------------

const HYDRATION_TARGET = 3200;
let hydrationToday = 0;
let sleepHours = 0;

let habitsState = JSON.parse(localStorage.getItem("habitsState")) || {
  today: [false, false, false]
};

function saveHabits() {
  localStorage.setItem("habitsState", JSON.stringify(habitsState));
}

function updateHydrationUI() {
  const labelEl = document.getElementById("hydrationLabel");
  const todayEl = document.getElementById("hydrationToday");
  const fillEl = document.getElementById("hydrationFill");

  const val = `${hydrationToday} / ${HYDRATION_TARGET} ml`;
  if (labelEl) labelEl.textContent = val;
  if (todayEl) todayEl.textContent = val;

  const pct = Math.max(0, Math.min(100, (hydrationToday / HYDRATION_TARGET) * 100));
  if (fillEl) fillEl.style.width = `${pct}%`;

  updateRecoveryToday();
}

function addHydration(amount) {
  hydrationToday += amount;
  updateHydrationUI();
}

function resetHydration() {
  hydrationToday = 0;
  updateHydrationUI();
}

function updateHabitsUI() {
  const toggles = document.querySelectorAll(".habit-toggle");
  toggles.forEach(t => {
    const idx = parseInt(t.dataset.habit, 10);
    t.checked = habitsState.today[idx] || false;
  });

  const done = habitsState.today.filter(Boolean).length;
  const summaryEl = document.getElementById("habitSummary");
  if (summaryEl) summaryEl.textContent = `${done} / 3 locked in.`;

  const trainingHabitEl = document.getElementById("habitLockTraining");
  if (trainingHabitEl) trainingHabitEl.textContent = `${done} / 3`;
}

function toggleHabit(idx, value) {
  habitsState.today[idx] = value;
  saveHabits();
  updateHabitsUI();
  updateRecoveryToday();
}

function computeRecoveryScore() {
  const sleepRatio = Math.min(1, sleepHours / 8);
  const hydrationRatio = Math.min(1, hydrationToday / HYDRATION_TARGET);
  const proteinRatio = Math.min(1, currentProtein / TARGET_PROTEIN);

  const habitsDone = habitsState.today.filter(Boolean).length;
  const habitRatio = habitsDone / 3;

  let score =
    40 +
    sleepRatio * 25 +
    hydrationRatio * 15 +
    proteinRatio * 15 +
    habitRatio * 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

function classifyReadiness(score) {
  if (score >= 80) return "GREEN – Push";
  if (score >= 60) return "YELLOW – Maintain";
  return "RED – Back Off";
}

function updateRecoveryToday() {
  const sleepInput = document.getElementById("sleepInput");
  if (sleepInput) {
    const val = parseFloat(sleepInput.value);
    sleepHours = isNaN(val) ? 0 : val;
  }

  const score = computeRecoveryScore();
  const tag = classifyReadiness(score);

  const todayEl = document.getElementById("recoveryScoreToday");
  const trainingEl = document.getElementById("recoveryScoreTraining");
  const tagEl = document.getElementById("readinessTag");

  if (todayEl) todayEl.textContent = score;
  if (trainingEl) trainingEl.textContent = score;
  if (tagEl) tagEl.textContent = tag;
}

// ----------------------
// WEEKLY NUTRITION – STATE
// ----------------------

let weekNutrition = JSON.parse(localStorage.getItem("weekNutrition")) || [];

function saveWeekNutrition() {
  localStorage.setItem("weekNutrition", JSON.stringify(weekNutrition));
}

function summarizeWeek() {
  if (!weekNutrition.length) {
    return {
      days: 0,
      avgCal: 0,
      avgProt: 0,
      adherence: 0,
      modeCounts: { FAST: 0, BALANCED: 0, CHILL: 0 }
    };
  }

  let totalCal = 0;
  let totalProt = 0;
  let totalAnchors = 0;
  let totalPossibleAnchors = weekNutrition.length * 2;
  const modeCounts = { FAST: 0, BALANCED: 0, CHILL: 0 };

  weekNutrition.forEach(day => {
    totalCal += day.calories;
    totalProt += day.protein;
    if (day.anchorA) totalAnchors += 1;
    if (day.anchorB) totalAnchors += 1;
    if (modeCounts[day.mode] !== undefined) {
      modeCounts[day.mode] += 1;
    }
  });

  const days = weekNutrition.length;
  const avgCal = Math.round(totalCal / days);
  const avgProt = Math.round(totalProt / days);
  const adherence = Math.round((totalAnchors / totalPossibleAnchors) * 100) || 0;

  return { days, avgCal, avgProt, adherence, modeCounts };
}

function updateWeeklyUI() {
  const weeklyCaloriesEl = document.getElementById("weeklyCalories");
  const weeklyProteinEl = document.getElementById("weeklyProtein");
  const weeklyAnchorsEl = document.getElementById("weeklyAnchors");
  const weeklyModesEl = document.getElementById("weeklyModes");

  const summary = summarizeWeek();

  if (!summary.days) {
    if (weeklyCaloriesEl) weeklyCaloriesEl.textContent = "0";
    if (weeklyProteinEl) weeklyProteinEl.textContent = "0 g";
    if (weeklyAnchorsEl) weeklyAnchorsEl.textContent = "0%";
    if (weeklyModesEl) weeklyModesEl.textContent = "–";
    updateMissionBrief(summary, "missionBrief");
    updateMissionBrief(summary, "missionBrief_training");
    return;
  }

  if (weeklyCaloriesEl) weeklyCaloriesEl.textContent = `${summary.avgCal}`;
  if (weeklyProteinEl) weeklyProteinEl.textContent = `${summary.avgProt} g`;
  if (weeklyAnchorsEl) weeklyAnchorsEl.textContent = `${summary.adherence}%`;

  const modeParts = [];
  if (summary.modeCounts.FAST) modeParts.push(`FAST ${summary.modeCounts.FAST}`);
  if (summary.modeCounts.BALANCED) modeParts.push(`BAL ${summary.modeCounts.BALANCED}`);
  if (summary.modeCounts.CHILL) modeParts.push(`CHILL ${summary.modeCounts.CHILL}`);

  if (weeklyModesEl) {
    weeklyModesEl.textContent = modeParts.length ? modeParts.join(" · ") : "–";
  }

  updateMissionBrief(summary, "missionBrief");
  updateMissionBrief(summary, "missionBrief_training");
}

function closeDayAndLog() {
  const mode = computeMode();

  const entry = {
    calories: currentCalories,
    protein: currentProtein,
    anchorA: anchorALogged,
    anchorB: anchorBLogged,
    mode
  };

  weekNutrition.push(entry);
  if (weekNutrition.length > 7) {
    weekNutrition = weekNutrition.slice(weekNutrition.length - 7);
  }

  saveWeekNutrition();
  updateWeeklyUI();
  resetNutrition();
  resetHydration();
  habitsState.today = [false, false, false];
  saveHabits();
  updateHabitsUI();
}

// ----------------------
// INTELLIGENCE – MISSION BRIEF
// ----------------------

function updateMissionBrief(summary, elementId) {
  const briefEl = document.getElementById(elementId);
  if (!briefEl) return;

  if (!summary.days) {
    briefEl.textContent =
      "No logged days yet.\n\nClose at least 3 days to unlock a mission brief for your next training block.";
    return;
  }

  const { days, avgCal, avgProt, adherence, modeCounts } = summary;

  let fatigueImpact = "neutral";
  let recoveryImpact = "neutral";
  let trainingSuggestion = "Keep training as planned.";

  const calRatio = avgCal / TARGET_CALORIES;
  const protRatio = avgProt / TARGET_PROTEIN;

  if (calRatio <= 0.9 && protRatio >= 0.9) {
    fatigueImpact = "slightly elevated (from frequent FAST days)";
    recoveryImpact = "stable (protein is solid)";
    trainingSuggestion = "Keep intensity, but consider 1 extra easy / recovery day if you feel worn down.";
  } else if (calRatio >= 1.1 && protRatio >= 0.9) {
    fatigueImpact = "reduced (you’re well‑fed)";
    recoveryImpact = "enhanced (good protein support)";
    trainingSuggestion = "You can afford 1–2 harder sessions next week if life stress is low.";
  } else if (protRatio < 0.8) {
    fatigueImpact = "higher than necessary (low protein)";
    recoveryImpact = "limited (muscle repair under‑supported)";
    trainingSuggestion = "Hold training where it is and tighten up protein before pushing harder.";
  }

  const modeSummaryParts = [];
  if (modeCounts.FAST) modeSummaryParts.push(`${modeCounts.FAST} FAST`);
  if (modeCounts.BALANCED) modeSummaryParts.push(`${modeCounts.BALANCED} BALANCED`);
  if (modeCounts.CHILL) modeSummaryParts.push(`${modeCounts.CHILL} CHILL`);
  const modeSummary = modeSummaryParts.join(" · ") || "No modes logged";

  briefEl.textContent =
    `Last ${days} days:\n` +
    `- Avg calories: ${avgCal}\n` +
    `- Avg protein: ${avgProt} g\n` +
    `- Anchor adherence: ${adherence}%\n` +
    `- Mode mix: ${modeSummary}\n\n` +
    `Nutrition impact:\n` +
    `- Fatigue: ${fatigueImpact}\n` +
    `- Recovery: ${recoveryImpact}\n\n` +
    `Next week – suggested training focus:\n` +
    `- ${trainingSuggestion}`;
}

// ----------------------
// NAVIGATION
// ----------------------

function switchPage(pageKey) {
  document.querySelectorAll(".page").forEach(p => {
    if (p.id === `page-${pageKey}`) {
      p.classList.add("on");
    } else {
      p.classList.remove("on");
    }
  });

  document.querySelectorAll(".nav-tab").forEach(tab => {
    if (tab.dataset.page === pageKey) {
      tab.classList.add("on");
    } else {
      tab.classList.remove("on");
    }
  });
}

// ----------------------
// WIRE UP UI
// ----------------------

window.addEventListener("DOMContentLoaded", () => {
  // Training – Today
  const btnA = document.getElementById("runDatasetA");
  const btnB = document.getElementById("runDatasetB");
  if (btnA) btnA.addEventListener("click", () => renderOutputTo("output", datasetA));
  if (btnB) btnB.addEventListener("click", () => renderOutputTo("output", datasetB));
  renderOutputTo("output", datasetA);

  // Training – Training page
  const btnA2 = document.getElementById("runDatasetA_training");
  const btnB2 = document.getElementById("runDatasetB_training");
  if (btnA2) btnA2.addEventListener("click", () => renderOutputTo("output_training", datasetA));
  if (btnB2) btnB2.addEventListener("click", () => renderOutputTo("output_training", datasetB));
  renderOutputTo("output_training", datasetA);

  // Nutrition – Today + Nutrition pages
  const logAIds = ["logAnchorA", "logAnchorA_n"];
  const logBIds = ["logAnchorB", "logAnchorB_n"];
  const quickProtIds = ["quickAddProtein", "quickAddProtein_n"];
  const quickCalIds = ["quickAddCalories", "quickAddCalories_n"];
  const resetIds = ["resetNutrition", "resetNutrition_n"];

  logAIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => logAnchor("A"));
  });

  logBIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => logAnchor("B"));
  });

  quickProtIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", quickAddProtein);
  });

  quickCalIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", quickAddCalories);
  });

  resetIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", resetNutrition);
  });

  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editAnchor(btn.dataset.anchor));
  });

  // Weekly
  const closeDayBtn = document.getElementById("closeDay");
  if (closeDayBtn) closeDayBtn.addEventListener("click", closeDayAndLog);

  // Nav tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => switchPage(tab.dataset.page));
  });

  // Hydration
  const h250 = document.getElementById("hydrationAdd250");
  const h500 = document.getElementById("hydrationAdd500");
  const hReset = document.getElementById("hydrationReset");
  if (h250) h250.addEventListener("click", () => addHydration(250));
  if (h500) h500.addEventListener("click", () => addHydration(500));
  if (hReset) hReset.addEventListener("click", resetHydration);

  // Sleep
  const sleepInput = document.getElementById("sleepInput");
  if (sleepInput) {
    sleepInput.addEventListener("input", updateRecoveryToday);
  }

  // Habits
  document.querySelectorAll(".habit-toggle").forEach(t => {
    t.addEventListener("change", () => {
      const idx = parseInt(t.dataset.habit, 10);
      toggleHabit(idx, t.checked);
    });
  });

  // Initial state
  updateAnchorUI();
  updateNutritionHUD();
  updateHydrationUI();
  updateHabitsUI();
  updateWeeklyUI();
  switchPage("today");
});
