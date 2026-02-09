import React, { useState, useEffect } from "react";

function TemplateManager({ onClose, currentCommitments, onLoadTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const saved = localStorage.getItem("templates");
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (currentCommitments.length === 0) {
      alert("No commitments to save");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateName,
      createdAt: new Date().toLocaleDateString(),
      commitments: currentCommitments.map((c) => ({
        ...c,
        id: undefined,
      })),
    };

    const updatedTemplates = [...templates, newTemplate];
    localStorage.setItem("templates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    setTemplateName("");
    setShowSaveForm(false);
  };

  const deleteTemplate = (id) => {
    const updatedTemplates = templates.filter((t) => t.id !== id);
    localStorage.setItem("templates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const loadTemplate = (template) => {
    if (
      confirm(
        "This will replace current commitments with this template. Continue?",
      )
    ) {
      onLoadTemplate(template);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <i className="fa-solid fa-save mr-2"></i>Weekly Program Templates
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Save Current as Template */}
        <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full px-4 py-3 rounded bg-green-600/30 text-green-400 hover:bg-green-600/40 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>Save Current Week as Template
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., 'Balanced Week', 'Heavy Training'"
                className="w-full px-3 py-2 rounded bg-slate-600 text-white placeholder-slate-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveTemplate}
                  className="flex-1 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setTemplateName("");
                  }}
                  className="flex-1 px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Templates */}
        <div>
          <h3 className="text-lg font-bold mb-4">
            <i className="fa-solid fa-star mr-2"></i>Saved Templates
            <span className="text-sm text-slate-400 ml-2">
              ({templates.length})
            </span>
          </h3>

          {templates.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              <i className="fa-solid fa-inbox text-3xl mb-2 block"></i>
              No templates yet. Create one by saving your current week!
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/50 hover:border-slate-600 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{template.name}</h4>
                      <p className="text-xs text-slate-400">
                        {template.commitments.length} commitments
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Saved: {template.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>

                  {/* Template preview */}
                  <div className="mb-3 p-3 bg-slate-600/30 rounded text-xs">
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {template.commitments.map((c, idx) => (
                        <div key={idx} className="text-slate-300">
                          <i
                            className="fa-solid fa-circle text-xs mr-2"
                            style={{ color: c.color }}
                          ></i>
                          {c.name}
                          {c.priority && (
                            <span className="text-slate-500 ml-2">
                              ({c.priority})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => loadTemplate(template)}
                    className="w-full px-4 py-2 rounded bg-green-600/30 text-green-400 hover:bg-green-600/50 transition font-semibold"
                  >
                    <i className="fa-solid fa-play mr-2"></i>Load This Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default TemplateManager;
