import React, { useState } from "react";

function WeeklyCalendar({
  dayInstances,
  commitmentTemplates,
  dayProperties,
  completedInstances,
  onUpdateDayProperty,
  onAddInstance,
  onRemoveInstance,
  onToggleCompletion,
  onUpdateInstanceTiming,
  onDropZone,
  draggedTemplate,
}) {
  const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [dragOverDay, setDragOverDay] = useState(null);

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
    <div className="mb-8">
      <div className="grid grid-cols-7 gap-3">
        {DAYS_SHORT.map((day, dayIdx) => {
          const instances = dayInstances[dayIdx] || [];
          const props = dayProperties[dayIdx] || {
            availableTimeStart: "08:00",
            availableTimeEnd: "22:00",
          };

          return (
            <div
              key={dayIdx}
              className={`calendar-day flex flex-col transition-all ${dragOverDay === dayIdx ? "ring-2 ring-green-400 scale-105" : ""
                }`}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={() => handleDrop(dayIdx)}
              onDragEnter={() => setDragOverDay(dayIdx)}
            >
              {/* Day Header */}
              <div className="mb-3">
                <p className="font-bold text-sm mb-2 text-green-400">{day}</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <label className="text-slate-500">From:</label>
                    <input
                      type="time"
                      value={props.availableTimeStart}
                      onChange={(e) =>
                        onUpdateDayProperty(
                          dayIdx,
                          "availableTimeStart",
                          e.target.value,
                        )
                      }
                      className="w-full form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500">To:</label>
                    <input
                      type="time"
                      value={props.availableTimeEnd}
                      onChange={(e) =>
                        onUpdateDayProperty(
                          dayIdx,
                          "availableTimeEnd",
                          e.target.value,
                        )
                      }
                      className="w-full form-input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Drop zone & commitments */}
              <div className="flex-1 min-h-64 bg-slate-700/20 rounded-lg p-2 space-y-1 border border-dashed border-slate-600/30">
                {instances.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">
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

                    const isCompleted = completedInstances[dayIdx]?.[instance.id] || false;

                    return (
                      <div
                        key={instance.id}
                        className={`group relative cursor-pointer transition hover:shadow-lg ${isCompleted ? 'opacity-60' : ''}`}
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
                              className={`font-bold truncate ${isCompleted ? 'line-through' : ''}`}
                              style={{ color: template.color }}
                            >
                              {template.name}
                            </div>
                            <div className="text-slate-400 dark:text-slate-500 text-xs opacity-75">
                              {instance.startTime} - {instance.endTime}
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div
                            className="text-xs font-bold mt-1 px-1.5 py-0.5 rounded inline-block self-start"
                            style={{
                              background: `${template.color}40`,
                              color: template.color,
                              fontSize: '10px'
                            }}
                          >
                            ⏱ {formatDuration(instance.startTime, instance.endTime)}
                          </div>
                        </div>

                        {/* Hover actions */}
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition space-y-1 p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleCompletion(dayIdx, instance.id);
                            }}
                            className={`w-6 h-6 rounded ${isCompleted ? 'bg-green-500' : 'bg-slate-700 dark:bg-slate-300'} hover:bg-green-600 flex items-center justify-center text-white text-xs`}
                            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {isCompleted ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() =>
                              onUpdateInstanceTiming(
                                dayIdx,
                                instance.id,
                                instance.startTime,
                                instance.endTime,
                              )
                            }
                            className="block text-xs px-2 py-0.5 rounded bg-blue-600/60 hover:bg-blue-600 text-white"
                            title="Edit timing"
                          >
                            <i className="fa-solid fa-clock"></i>
                          </button>
                          <button
                            onClick={() =>
                              onRemoveInstance(dayIdx, instance.id)
                            }
                            className="block text-xs px-2 py-0.5 rounded bg-red-600/60 hover:bg-red-600 text-white"
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

      {/* Legend */}
      <div className="mt-8 p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-widest">
          Commitment Legend
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          {commitmentTemplates.length === 0 ? (
            <span className="text-slate-400 italic">No templates created yet</span>
          ) : (
            commitmentTemplates.map(template => (
              <div key={template.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: template.color }}
                ></div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{template.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalendar;
