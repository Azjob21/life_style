import React, { useState, useMemo, useEffect, useCallback } from "react";

/**
 * Goals / Targets System
 * Users can create weekly goals like "Train 4x this week" and track progress automatically.
 */
function GoalsPanel({
  dayInstances,
  completedInstances,
  commitmentTemplates,
  userId,
  toast,
}) {
  const userKey = (key) => `${userId || "anonymous"}:${key}`;
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: 3,
    type: "completions",
    keyword: "",
  });

  // Load goals
  useEffect(() => {
    const saved = localStorage.getItem(userKey("weekly-goals"));
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  // Save goals
  const saveGoals = useCallback(
    (g) => {
      setGoals(g);
      localStorage.setItem(userKey("weekly-goals"), JSON.stringify(g));
    },
    [userKey],
  );

  // Calculate progress for a goal
  const calculateProgress = useCallback(
    (goal) => {
      let count = 0;
      const kw = (goal.keyword || "").toLowerCase();

      Object.entries(dayInstances).forEach(([dayIdx, instances]) => {
        (instances || []).forEach((inst) => {
          const template = (commitmentTemplates || []).find(
            (t) => t.id === inst.templateId,
          );
          if (!template) return;

          const nameMatch = kw
            ? (template.name || "").toLowerCase().includes(kw)
            : true;
          const catMatch = kw
            ? (template.category || "").toLowerCase().includes(kw)
            : true;

          if (nameMatch || catMatch) {
            if (goal.type === "completions") {
              if (completedInstances[dayIdx]?.[inst.id]) count++;
            } else if (goal.type === "scheduled") {
              count++;
            }
          }
        });
      });

      return count;
    },
    [dayInstances, completedInstances, commitmentTemplates],
  );

  const addGoal = () => {
    if (!newGoal.name.trim()) return;
    const goal = { id: Date.now(), ...newGoal };
    saveGoals([...goals, goal]);
    setNewGoal({ name: "", target: 3, type: "completions", keyword: "" });
    setShowAdd(false);
    toast?.success?.("Goal added!");
  };

  const removeGoal = (id) => {
    saveGoals(goals.filter((g) => g.id !== id));
    toast?.info?.("Goal removed");
  };

  if (goals.length === 0 && !showAdd) {
    return (
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-indigo-500"></i>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Weekly Goals
            </span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            <i className="fa-solid fa-plus mr-1"></i>Add Goal
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Set targets like "Train 4x this week" and track automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bullseye text-indigo-500"></i>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Weekly Goals
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
        >
          <i
            className={`fa-solid ${showAdd ? "fa-xmark" : "fa-plus"} mr-1`}
          ></i>
          {showAdd ? "Cancel" : "Add"}
        </button>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3 border border-slate-200 dark:border-slate-700 space-y-2">
          <input
            type="text"
            placeholder="Goal name (e.g. Train 4x)"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Target
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={newGoal.target}
                onChange={(e) =>
                  setNewGoal({
                    ...newGoal,
                    target: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Track
              </label>
              <select
                value={newGoal.type}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, type: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                <option value="completions">Completions</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Keyword
              </label>
              <input
                type="text"
                placeholder="gym, content..."
                value={newGoal.keyword}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, keyword: e.target.value })
                }
                className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={addGoal}
            className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition"
          >
            <i className="fa-solid fa-check mr-1"></i>Create Goal
          </button>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-2">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const pct = Math.min(Math.round((progress / goal.target) * 100), 100);
          const isComplete = progress >= goal.target;

          return (
            <div
              key={goal.id}
              className={`p-3 rounded-xl border transition-all ${
                isComplete
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <i className="fa-solid fa-check-circle text-green-500 text-sm"></i>
                  )}
                  <span
                    className={`text-sm font-bold ${isComplete ? "text-green-700 dark:text-green-300" : "text-slate-900 dark:text-white"}`}
                  >
                    {goal.name}
                  </span>
                  {goal.keyword && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {goal.keyword}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black ${isComplete ? "text-green-600 dark:text-green-400" : "text-indigo-600 dark:text-indigo-400"}`}
                  >
                    {progress}/{goal.target}
                  </span>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-slate-400 hover:text-red-500 transition text-xs"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : "bg-indigo-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GoalsPanel;
