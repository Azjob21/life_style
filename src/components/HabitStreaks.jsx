import React, { useState, useEffect, useMemo } from "react";

/**
 * Habit Streaks & Long-term History
 * Tracks completion streaks across weeks and shows monthly/all-time stats.
 * Stores weekly snapshots in localStorage indexed by week key.
 */
function HabitStreaks({ dayInstances, completedInstances, commitmentTemplates, userId }) {
  const userKey = (key) => `${userId || "anonymous"}:${key}`;
  const [history, setHistory] = useState({});
  const [viewMode, setViewMode] = useState("streaks"); // "streaks" | "monthly" | "heatmap"

  // Load all weekly history snapshots
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userKey("habit-history"));
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Save current week snapshot whenever data changes
  useEffect(() => {
    const weekKey = getCurrentWeekKey();
    const snapshot = buildWeekSnapshot();
    if (Object.keys(snapshot).length > 0) {
      setHistory((prev) => {
        const updated = { ...prev, [weekKey]: snapshot };
        localStorage.setItem(userKey("habit-history"), JSON.stringify(updated));
        return updated;
      });
    }
  }, [dayInstances, completedInstances]);

  function getCurrentWeekKey() {
    const d = new Date();
    const year = d.getFullYear();
    const onejan = new Date(year, 0, 1);
    const weekNum = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `${year}-W${weekNum}`;
  }

  function buildWeekSnapshot() {
    const data = {};
    Object.entries(dayInstances).forEach(([dayIdx, instances]) => {
      (instances || []).forEach((inst) => {
        const template = (commitmentTemplates || []).find((t) => t.id === inst.templateId);
        if (!template) return;
        const name = template.name;
        if (!data[name]) data[name] = { scheduled: 0, completed: 0, color: template.color };
        data[name].scheduled++;
        if (completedInstances[dayIdx]?.[inst.id]) {
          data[name].completed++;
        }
      });
    });
    return data;
  }

  // Calculate streaks per habit
  const streaks = useMemo(() => {
    const weekKeys = Object.keys(history).sort().reverse(); // newest first
    const habitStreaks = {};

    // Get unique habit names across all weeks
    const allHabits = new Set();
    Object.values(history).forEach((weekData) => {
      Object.keys(weekData).forEach((name) => allHabits.add(name));
    });

    allHabits.forEach((name) => {
      let currentStreak = 0;
      let longestStreak = 0;
      let totalCompleted = 0;
      let totalScheduled = 0;
      let streakActive = true;
      let color = "#3b82f6";

      weekKeys.forEach((wk) => {
        const habitData = history[wk]?.[name];
        if (habitData) {
          totalScheduled += habitData.scheduled;
          totalCompleted += habitData.completed;
          color = habitData.color || color;

          if (habitData.completed > 0 && streakActive) {
            currentStreak++;
          } else if (habitData.scheduled > 0 && habitData.completed === 0) {
            streakActive = false;
          }
          if (habitData.completed > 0) {
            longestStreak = Math.max(longestStreak, currentStreak);
          }
        } else {
          streakActive = false;
        }
      });

      habitStreaks[name] = {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalCompleted,
        totalScheduled,
        completionRate: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
        color,
      };
    });

    return habitStreaks;
  }, [history]);

  // Monthly aggregation
  const monthlyData = useMemo(() => {
    const months = {};
    Object.entries(history).forEach(([weekKey, weekData]) => {
      // Extract year from week key (YYYY-WXX)
      const year = weekKey.split("-W")[0];
      const weekNum = parseInt(weekKey.split("-W")[1]);
      // Rough month estimate from week number
      const monthIdx = Math.min(Math.floor((weekNum - 1) / 4.33), 11);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthKey = `${monthNames[monthIdx]} ${year}`;

      if (!months[monthKey]) months[monthKey] = { scheduled: 0, completed: 0 };
      Object.values(weekData).forEach((habit) => {
        months[monthKey].scheduled += habit.scheduled;
        months[monthKey].completed += habit.completed;
      });
    });
    return months;
  }, [history]);

  const sortedHabits = Object.entries(streaks).sort((a, b) => b[1].currentStreak - a[1].currentStreak);

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-fire text-orange-500"></i>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Habit Streaks
          </span>
        </div>
        <div className="flex gap-1">
          {["streaks", "monthly"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                viewMode === mode
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              {mode === "streaks" ? "Streaks" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "streaks" && (
        <div className="space-y-2">
          {sortedHabits.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
              Complete some commitments to start tracking streaks!
            </p>
          ) : (
            sortedHabits.map(([name, data]) => (
              <div
                key={name}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${data.color}25` }}
                >
                  <i className="fa-solid fa-fire" style={{ color: data.color, fontSize: "12px" }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[10px] text-orange-500 font-bold">
                      {data.currentStreak}w streak
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Best: {data.longestStreak}w
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {data.completionRate}% rate
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(data.currentStreak, 7) }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: data.color }}></div>
                  ))}
                  {data.currentStreak > 7 && (
                    <span className="text-[9px] text-slate-400 ml-1">+{data.currentStreak - 7}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === "monthly" && (
        <div className="space-y-2">
          {Object.keys(monthlyData).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
              No monthly data yet — keep completing commitments!
            </p>
          ) : (
            Object.entries(monthlyData).reverse().map(([month, data]) => {
              const pct = data.scheduled > 0 ? Math.round((data.completed / data.scheduled) * 100) : 0;
              return (
                <div key={month} className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{month}</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">{data.completed} completed</span>
                    <span className="text-[10px] text-slate-400">{data.scheduled} scheduled</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default HabitStreaks;
