import React, { useState, useMemo } from "react";

function WeeklyCalendar({
  dayInstances,
  commitmentTemplates,
  dayProperties,
  completedInstances,
  currentWeekStart,
  onUpdateDayProperty,
  onAddInstance,
  onRemoveInstance,
  onToggleCompletion,
  onUpdateInstanceTiming,
  onDropZone,
  draggedTemplate,
  onOpenDayView,
}) {
  const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [dragOverDay, setDragOverDay] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Determine if a dayIdx is today or in the past (can be completed)
  const isDayCompletable = (dayIdx) => {
    if (!currentWeekStart) return true; // fallback: allow all
    const weekStart = new Date(currentWeekStart);
    // Adjust to Monday-based week (dayIdx 0 = Mon)
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIdx);
    dayDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return dayDate <= today;
  };

  // Derive available categories from templates
  const categories = useMemo(() => {
    const cats = new Set();
    (commitmentTemplates || []).forEach((t) => {
      cats.add(t.category || "general");
    });
    return ["all", ...Array.from(cats).sort()];
  }, [commitmentTemplates]);

  // Filter instances by selected category (dayInstances is an object keyed by day index)
  const filteredDayInstances = useMemo(() => {
    const result = {};
    for (let i = 0; i < 7; i++) {
      const instances = dayInstances[i] || [];
      if (categoryFilter === "all") {
        result[i] = instances;
      } else {
        result[i] = instances.filter((inst) => {
          const tpl = (commitmentTemplates || []).find(
            (t) => t.id === inst.templateId,
          );
          return (tpl?.category || "general") === categoryFilter;
        });
      }
    }
    return result;
  }, [dayInstances, commitmentTemplates, categoryFilter]);

  const CATEGORY_ICONS = {
    all: "fa-solid fa-layer-group",
    training: "fa-solid fa-dumbbell",
    content: "fa-solid fa-pen-nib",
    general: "fa-solid fa-bookmark",
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (dayIdx) => {
    if (draggedTemplate) {
      onDropZone(draggedTemplate.id, dayIdx);
      setDragOverDay(null);
    }
  };

  const calculateBlockHeight = (startTime, endTime) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = endMin - startMin;
    const baseHeight = 0.8; // pixels per minute (reduced to prevent stretching)
    const calculatedHeight = duration * baseHeight;
    return Math.min(Math.max(calculatedHeight, 45), 120); // min 45px, max 120px
  };

  const formatDuration = (startTime, endTime) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const durationMin = endMin - startMin;

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Category Filter */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
        <span className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-0.5 sm:mr-1">
          Filter
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all border ${
              categoryFilter === cat
                ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            }`}
          >
            <i
              className={`${CATEGORY_ICONS[cat] || "fa-solid fa-tag"} mr-1`}
            ></i>
            <span className="hidden sm:inline">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
            <span className="sm:hidden">
              {cat.charAt(0).toUpperCase() + cat.slice(1, 4)}
            </span>
          </button>
        ))}
      </div>

      {/* Day Headers Row */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 border-b-2 border-slate-200 dark:border-slate-800">
        {DAYS_SHORT.map((day, dayIdx) => {
          const instances = filteredDayInstances[dayIdx] || [];
          const isToday =
            new Date().getDay() === (dayIdx === 6 ? 0 : dayIdx + 1);
          return (
            <div
              key={dayIdx}
              className={`py-3 text-center ${dayIdx < 6 ? "border-r border-slate-200 dark:border-slate-800" : ""}`}
            >
              <p
                className={`font-black text-xs uppercase tracking-widest ${isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
              >
                {day}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">
                {instances.length} {instances.length === 1 ? "block" : "blocks"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Day Columns — Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {DAYS_SHORT.map((day, dayIdx) => {
          const instances = filteredDayInstances[dayIdx] || [];

          return (
            <div
              key={dayIdx}
              className={`calendar-day flex flex-col transition-all cursor-pointer ${dayIdx < 6 ? "border-r border-slate-200/60 dark:border-slate-800/60" : ""} ${
                dragOverDay === dayIdx ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
              } hover:bg-slate-50/50 dark:hover:bg-slate-800/20`}
              onClick={() => onOpenDayView?.(dayIdx)}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={() => handleDrop(dayIdx)}
              onDragEnter={() => setDragOverDay(dayIdx)}
            >
              {/* Drop zone & commitments */}
              <div className="flex-1 space-y-1">
                {instances.length === 0 ? (
                  <p className="text-xs text-slate-600 dark:text-slate-500 italic text-center py-4">
                    Drop or click to add
                  </p>
                ) : (
                  instances.map((instance) => {
                    const template = commitmentTemplates.find(
                      (t) => t.id === instance.templateId,
                    );
                    if (!template) return null;

                    const height = calculateBlockHeight(
                      instance.startTime,
                      instance.endTime,
                    );

                    const isCompleted =
                      completedInstances[dayIdx]?.[instance.id] || false;

                    return (
                      <div
                        key={instance.id}
                        className={`group relative cursor-pointer transition hover:shadow-lg ${isCompleted ? "opacity-60" : ""}`}
                        style={{
                          height: `${height}px`,
                          background: `${template.color}30`,
                          borderLeft: `4px solid ${template.color}`,
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div className="p-1 text-xs h-full flex flex-col justify-between">
                          <div>
                            <div
                              className={`font-bold truncate ${isCompleted ? "line-through" : ""}`}
                              style={{ color: template.color }}
                            >
                              {template.name}
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 text-xs font-medium opacity-90">
                              {instance.startTime} - {instance.endTime}
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div
                            className="text-xs font-bold mt-1 px-1.5 py-0.5 rounded inline-block self-start"
                            style={{
                              background: `${template.color}40`,
                              color: template.color,
                              fontSize: "10px",
                            }}
                          >
                            ⏱{" "}
                            {formatDuration(
                              instance.startTime,
                              instance.endTime,
                            )}
                          </div>
                        </div>

                        {/* Hover/Touch actions */}
                        <div className="absolute top-0 right-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex sm:flex-col gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                          {isDayCompletable(dayIdx) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCompletion(dayIdx, instance.id);
                              }}
                              className={`w-6 h-6 rounded ${isCompleted ? "bg-green-500" : "bg-slate-700 dark:bg-slate-300"} hover:bg-green-600 flex items-center justify-center text-white text-xs`}
                              title={
                                isCompleted
                                  ? "Mark as incomplete"
                                  : "Mark as complete"
                              }
                            >
                              {isCompleted ? "✓" : "○"}
                            </button>
                          ) : (
                            <div
                              className="w-6 h-6 rounded bg-slate-400/50 flex items-center justify-center text-slate-500 text-xs cursor-not-allowed"
                              title="Cannot mark future days as complete"
                            >
                              <i className="fa-solid fa-lock text-[8px]"></i>
                            </div>
                          )}
                          <button
                            onClick={() =>
                              onUpdateInstanceTiming(
                                dayIdx,
                                instance.id,
                                instance.startTime,
                                instance.endTime,
                              )
                            }
                            className="block text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-blue-600/60 hover:bg-blue-600 text-white"
                            title="Edit timing"
                          >
                            <i className="fa-solid fa-clock"></i>
                          </button>
                          <button
                            onClick={() =>
                              onRemoveInstance(dayIdx, instance.id)
                            }
                            className="block text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-red-600/60 hover:bg-red-600 text-white"
                            title="Remove from this day only"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Card View — stacked days */}
      <div className="sm:hidden space-y-3">
        {DAYS_SHORT.map((day, dayIdx) => {
          const instances = filteredDayInstances[dayIdx] || [];
          const isToday =
            new Date().getDay() === (dayIdx === 6 ? 0 : dayIdx + 1);

          return (
            <div
              key={dayIdx}
              className={`rounded-xl border overflow-hidden ${
                isToday
                  ? "border-blue-400 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30"
              }`}
              onClick={() => onOpenDayView?.(dayIdx)}
            >
              {/* Day Header */}
              <div
                className={`px-3 py-2 flex justify-between items-center ${
                  isToday
                    ? "bg-blue-100/50 dark:bg-blue-900/20"
                    : "bg-slate-50 dark:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-xs uppercase tracking-widest ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  {instances.length}{" "}
                  {instances.length === 1 ? "block" : "blocks"}
                </span>
              </div>

              {/* Blocks */}
              <div className="px-2 py-1.5 space-y-1">
                {instances.length === 0 ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center py-2">
                    No blocks scheduled
                  </p>
                ) : (
                  instances.map((instance) => {
                    const template = commitmentTemplates.find(
                      (t) => t.id === instance.templateId,
                    );
                    if (!template) return null;
                    const isCompleted =
                      completedInstances[dayIdx]?.[instance.id] || false;

                    return (
                      <div
                        key={instance.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isCompleted ? "opacity-50" : ""}`}
                        style={{
                          background: `${template.color}15`,
                          borderLeft: `3px solid ${template.color}`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${isCompleted ? "line-through" : ""}`}
                            style={{ color: template.color }}
                          >
                            {template.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {instance.startTime} - {instance.endTime}
                            <span
                              className="ml-1.5 font-bold"
                              style={{ color: template.color }}
                            >
                              {formatDuration(
                                instance.startTime,
                                instance.endTime,
                              )}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isDayCompletable(dayIdx) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCompletion(dayIdx, instance.id);
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {isCompleted ? "✓" : "○"}
                            </button>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-[10px]">
                              <i className="fa-solid fa-lock"></i>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveInstance(dayIdx, instance.id);
                            }}
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-xs"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-slate-400 uppercase mb-2 sm:mb-3 tracking-widest">
          Legend
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
          {commitmentTemplates.length === 0 ? (
            <span className="text-slate-400 italic">
              No templates created yet
            </span>
          ) : (
            commitmentTemplates.map((template) => (
              <div key={template.id} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm"
                  style={{ backgroundColor: template.color }}
                ></div>
                <span className="font-bold text-slate-900 dark:text-slate-300">
                  {template.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalendar;
