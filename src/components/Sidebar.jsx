import React from "react";

function Sidebar({
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDragStart,
}) {
  const highPriority = templates.filter((t) => t.priority === "high");
  const mediumPriority = templates.filter((t) => t.priority === "medium");
  const lowPriority = templates.filter((t) => t.priority === "low");

  const TemplateButton = ({ template }) => (
    <div
      key={template.id}
      draggable
      onDragStart={() => onDragStart?.(template)}
      className="group relative commitment-tag w-full text-left hover:shadow-lg hover:shadow-slate-600/50 transition transform hover:scale-105"
      style={{
        background: `${template.color}20`,
        borderWidth: "2px",
        borderColor: template.color,
        color: template.color,
      }}
      title={`${template.name} - ${template.startTime} to ${template.endTime}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex-1 truncate text-sm">
          <i className="fa-solid fa-arrows-alt text-xs opacity-50 mr-1"></i>
          {template.name}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditTemplate(template.id);
            }}
            className="text-xs px-2 py-1 rounded bg-slate-600/50 hover:bg-slate-600 mr-1"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTemplate(template.id);
            }}
            className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-xs opacity-60 mt-1">
        {template.startTime} - {template.endTime}
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-slate-900/50 dark:bg-slate-100/50 backdrop-blur border-r border-white/10 dark:border-slate-300/10 p-6 overflow-y-auto">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-green-400 dark:text-green-600 mb-2">
          <i className="fa-solid fa-circle-check mr-2"></i>Schedule
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Building Block Scheduler
        </p>
      </div>

      {/* Add Button */}
      <button onClick={onAddTemplate} className="btn-primary w-full mb-6">
        <i className="fa-solid fa-plus mr-2"></i>New Template
      </button>

      {/* Stats */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-3 tracking-widest">
          Stats
        </h3>
        <div className="glass-card p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 dark:text-slate-600">
              Total:
            </span>
            <span className="text-xl font-bold text-green-400 dark:text-green-600">
              {templates.length}
            </span>
          </div>
          {highPriority.length > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-400 dark:text-red-600">Critical:</span>
              <span className="font-bold text-red-400 dark:text-red-600">
                {highPriority.length}
              </span>
            </div>
          )}
          {mediumPriority.length > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-orange-400 dark:text-orange-600">
                Important:
              </span>
              <span className="font-bold text-orange-400 dark:text-orange-600">
                {mediumPriority.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Templates List */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-3 tracking-widest">
          <i className="fa-solid fa-cube mr-2"></i>Building Blocks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-600 mb-3">
          💡 Drag templates to add to your week
        </p>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Create commitment templates to get started
            </p>
          ) : (
            <>
              {highPriority.length > 0 && (
                <div>
                  <p className="text-xs text-red-400 dark:text-red-600 font-semibold mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-star"></i>Critical
                  </p>
                  <div className="space-y-2">
                    {highPriority.map((t) => (
                      <TemplateButton key={t.id} template={t} />
                    ))}
                  </div>
                </div>
              )}

              {mediumPriority.length > 0 && (
                <div>
                  <p className="text-xs text-orange-400 dark:text-orange-600 font-semibold mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-exclamation"></i>Important
                  </p>
                  <div className="space-y-2">
                    {mediumPriority.map((t) => (
                      <TemplateButton key={t.id} template={t} />
                    ))}
                  </div>
                </div>
              )}

              {lowPriority.length > 0 && (
                <div>
                  <p className="text-xs text-green-400 dark:text-green-600 font-semibold mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-check"></i>Regular
                  </p>
                  <div className="space-y-2">
                    {lowPriority.map((t) => (
                      <TemplateButton key={t.id} template={t} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
