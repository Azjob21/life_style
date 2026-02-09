import React, { useState } from "react";

function WeeklyCalendar({
  dayInstances,
  commitmentTemplates,
  dayProperties,
  onUpdateDayProperty,
  onAddInstance,
  onRemoveInstance,
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
    const baseHeight = 2; // pixels per minute
    return Math.max(duration * baseHeight, 40); // minimum height
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
              className={`calendar-day flex flex-col transition-all ${
                dragOverDay === dayIdx ? "ring-2 ring-green-400 scale-105" : ""
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

                    return (
                      <div
                        key={instance.id}
                        className="group relative cursor-pointer transition hover:shadow-lg"
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
                              className="font-bold truncate"
                              style={{ color: template.color }}
                            >
                              {template.name}
                            </div>
                            <div className="text-slate-400 text-xs opacity-75">
                              {instance.startTime} - {instance.endTime}
                            </div>
                          </div>
                        </div>

                        {/* Hover actions */}
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition space-y-1 p-1">
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
    </div>
  );
}

export default WeeklyCalendar;
