import React from "react";

function Dashboard({ dayInstances, commitmentTemplates, completedInstances = {}, onEditTemplate }) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calculate statistics
  const getTotalInstances = () => {
    return Object.values(dayInstances).reduce(
      (sum, instances) => sum + (instances?.length || 0),
      0,
    );
  };

  const getInstancesByTemplate = () => {
    const map = {};
    Object.values(dayInstances).forEach((instances) => {
      instances?.forEach((instance) => {
        map[instance.templateId] = (map[instance.templateId] || 0) + 1;
      });
    });
    return map;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "fa-solid fa-star";
      case "medium":
        return "fa-solid fa-exclamation";
      case "low":
        return "fa-solid fa-check";
      default:
        return "fa-solid fa-circle";
    }
  };

  const getCompletedCount = () => {
    let count = 0;
    Object.values(completedInstances).forEach((dayCompleted) => {
      Object.values(dayCompleted).forEach((isCompleted) => {
        if (isCompleted) count++;
      });
    });
    return count;
  };

  const calculateDurationMinutes = (startTime, endTime) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  };

  const getTimeStats = () => {
    let totalMinutes = 0;
    let completedMinutes = 0;

    Object.entries(dayInstances).forEach(([dayIdx, instances]) => {
      instances?.forEach((instance) => {
        const duration = calculateDurationMinutes(instance.startTime, instance.endTime);
        totalMinutes += duration;

        if (completedInstances[dayIdx]?.[instance.id]) {
          completedMinutes += duration;
        }
      });
    });

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      completedHours: (completedMinutes / 60).toFixed(1),
      percentage: totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0
    };
  };

  const stats = {
    totalInstances: getTotalInstances(),
    completedInstances: getCompletedCount(),
    instancesByTemplate: getInstancesByTemplate(),
    time: getTimeStats()
  };

  const completionRate = stats.totalInstances > 0
    ? Math.round((stats.completedInstances / stats.totalInstances) * 100)
    : 0;

  return (
    <section className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-100 dark:text-amber-100">
        <i className="fa-solid fa-chart-bar text-purple-500 dark:text-amber-500"></i>
        Week Overview
      </h3>

      {commitmentTemplates.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-inbox"></i>
          <p>No commitment templates created</p>
          <p className="text-xs mt-2">
            Create templates to start building your week
          </p>
        </div>
      ) : (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Completion Rate */}
            <div className="p-4 bg-slate-700/30 dark:bg-amber-900/10 rounded-lg border border-purple-500/10 dark:border-amber-500/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400 dark:text-amber-200/60 uppercase font-bold">Completion</span>
                <span className={`text-2xl font-bold ${completionRate >= 80 ? 'text-green-500' : completionRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-slate-700 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completionRate >= 80 ? 'bg-green-500' : completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">
                {stats.completedInstances} / {stats.totalInstances} tasks
              </p>
            </div>

            {/* Time Stats */}
            <div className="p-4 bg-slate-700/30 dark:bg-amber-900/10 rounded-lg border border-purple-500/10 dark:border-amber-500/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400 dark:text-amber-200/60 uppercase font-bold">Time Tracked</span>
                <span className="text-2xl font-bold text-blue-400">
                  {stats.time.completedHours}h
                </span>
              </div>
              <div className="w-full bg-slate-700 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${stats.time.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">
                of {stats.time.totalHours}h committed
              </p>
            </div>

            {/* Template Stats */}
            <div className="p-4 bg-slate-700/30 dark:bg-amber-900/10 rounded-lg border border-purple-500/10 dark:border-amber-500/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400 dark:text-amber-200/60 uppercase font-bold">Total Templates</span>
                <span className="text-2xl font-bold text-purple-400">
                  {commitmentTemplates.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-auto pt-4 text-right">
                Blocks in library
              </p>
            </div>

            {/* Utilization */}
            <div className="p-4 bg-slate-700/30 dark:bg-amber-900/10 rounded-lg border border-purple-500/10 dark:border-amber-500/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400 dark:text-amber-200/60 uppercase font-bold">Active Templates</span>
                <span className="text-2xl font-bold text-indigo-400">
                  {Object.keys(stats.instancesByTemplate).length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-auto pt-4 text-right">
                Used this week
              </p>
            </div>
          </div>

          {/* Daily Breakdown & Streak */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Daily Chart */}
            <div className="md:col-span-2 p-6 bg-slate-700/30 dark:bg-amber-900/10 rounded-xl border border-purple-500/10 dark:border-amber-500/10">
              <h4 className="text-sm font-bold text-slate-400 dark:text-amber-200/60 uppercase mb-4">Daily Performance</h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {DAYS.map((day, idx) => {
                  const dayInsts = dayInstances[idx] || [];
                  const total = dayInsts.length;
                  const completed = dayInsts.filter(i => completedInstances[idx]?.[i.id]).length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={day} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                      <div className="relative w-full flex justify-center h-full items-end">
                        <div
                          className={`w-full max-w-[30px] rounded-t transition-all duration-500 hover:opacity-80 ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-amber-500' : 'bg-slate-600 dark:bg-slate-700'}`}
                          style={{ height: `${percent > 0 ? percent : 5}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-xs p-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                          {completed}/{total} ({percent}%)
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Card */}
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-3">
                <i className="fa-solid fa-fire text-3xl text-orange-500 animate-pulse"></i>
              </div>
              <div className="text-4xl font-black text-orange-500 mb-1">
                {(() => {
                  let streak = 0;
                  const today = new Date().getDay(); // 0 is Sunday, but our array is 0=Mon
                  const todayIdx = today === 0 ? 6 : today - 1;

                  // Simple streak calculation: count consecutive days with >0 completions up to today
                  for (let i = todayIdx; i >= 0; i--) {
                    const dayInsts = dayInstances[i] || [];
                    if (dayInsts.length > 0) {
                      const completed = dayInsts.filter(item => completedInstances[i]?.[item.id]).length;
                      if (completed > 0) streak++;
                      else break;
                    }
                  }
                  return streak;
                })()}
              </div>
              <div className="text-sm font-bold text-orange-400 uppercase tracking-widest">Day Streak</div>
              <p className="text-xs text-slate-400 mt-2">Consistency is key!</p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {commitmentTemplates.map((template) => {
              const instanceCount = stats.instancesByTemplate[template.id] || 0;
              return (
                <div
                  key={template.id}
                  className="glass-card p-4 hover:border-green-500/50 transition cursor-pointer relative overflow-hidden"
                  style={{
                    background: `${template.color}10`,
                    borderLeft: `4px solid ${template.color}`,
                  }}
                  onClick={() => onEditTemplate(template.id)}
                >
                  {/* Priority bar */}
                  <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{
                      background:
                        template.priority === "high"
                          ? "#ef4444"
                          : template.priority === "medium"
                            ? "#f97316"
                            : "#22c55e",
                    }}
                  ></div>

                  <div className="flex items-start justify-between mb-3 pt-2">
                    <h4
                      className="font-bold flex items-center gap-2 text-lg"
                      style={{ color: template.color }}
                    >
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          background: template.color,
                          borderRadius: "50%",
                        }}
                      ></span>
                      {template.name}
                    </h4>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                      style={{
                        background: `${template.color}30`,
                        color: template.color,
                      }}
                    >
                      <i className={getPriorityIcon(template.priority)}></i>
                      {template.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-600 mb-3">
                    {template.description || "No description"}
                  </p>

                  {/* Duration */}
                  <div className="flex gap-4 items-center text-xs text-slate-500 dark:text-slate-600 mb-4">
                    <div>
                      <i className="fa-solid fa-clock mr-1"></i>
                      {template.startTime} - {template.endTime}
                    </div>
                    <div className="text-green-400 dark:text-green-600 font-bold">
                      × {instanceCount} {instanceCount === 1 ? "time" : "times"}
                    </div>
                  </div>

                  {/* Usage days */}
                  <div className="flex gap-1 flex-wrap">
                    {DAYS.map((day, idx) => {
                      const used = dayInstances[idx]?.some(
                        (inst) => inst.templateId === template.id,
                      );
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs ${used
                            ? "bg-green-500/30 text-green-400"
                            : "bg-slate-700/30 text-slate-500"
                            }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
