import React from "react";

function Dashboard({ dayInstances, commitmentTemplates, onEditTemplate }) {
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

  const instancesByTemplate = getInstancesByTemplate();

  return (
    <section className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <i className="fa-solid fa-chart-bar text-green-400"></i>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-700/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">
                {getTotalInstances()}
              </div>
              <p className="text-xs text-slate-400 mt-2">Total Instances</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">
                {commitmentTemplates.length}
              </div>
              <p className="text-xs text-slate-400 mt-2">Templates</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Object.keys(instancesByTemplate).length}
              </div>
              <p className="text-xs text-slate-400 mt-2">Used</p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {commitmentTemplates.map((template) => {
              const instanceCount = instancesByTemplate[template.id] || 0;
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

                  <p className="text-xs text-slate-400 mb-3">
                    {template.description || "No description"}
                  </p>

                  {/* Duration */}
                  <div className="flex gap-4 items-center text-xs text-slate-500 mb-4">
                    <div>
                      <i className="fa-solid fa-clock mr-1"></i>
                      {template.startTime} - {template.endTime}
                    </div>
                    <div className="text-green-400 font-bold">
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
                          className={`px-2 py-1 rounded text-xs ${
                            used
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
