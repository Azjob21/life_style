import React, { useState, useEffect } from "react";

function CommitmentTemplateModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTemplate,
  colors,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: colors[0],
    priority: "medium",
    startTime: "09:00",
    endTime: "10:30",
  });

  useEffect(() => {
    if (editingTemplate) {
      setFormData(editingTemplate);
    } else {
      setFormData({
        name: "",
        description: "",
        color: colors[0],
        priority: "medium",
        startTime: "09:00",
        endTime: "10:30",
      });
    }
  }, [editingTemplate, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const calculateDuration = () => {
    const [startH, startM] = formData.startTime.split(":").map(Number);
    const [endH, endM] = formData.endTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = endMin - startMin;
    return duration > 0 ? duration : 0;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a commitment name");
      return;
    }
    onSave(formData);
  };

  return (
    <div className={`modal ${isOpen ? "active" : ""}`}>
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingTemplate ? "Edit Template" : "New Commitment Template"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label>Commitment Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Gym, Project Work, Reading"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Details about this commitment..."
              rows="2"
            ></textarea>
          </div>

          {/* Priority & Color Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Priority */}
            <div className="form-group">
              <label>Importance</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟠 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            {/* Color */}
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${
                      formData.color === color ? "selected" : ""
                    }`}
                    style={{ background: color }}
                    onClick={() => handleColorSelect(color)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Default Time Block */}
          <div className="mb-4 p-4 bg-slate-700/30 rounded-lg">
            <label className="font-semibold block mb-3">Default Duration</label>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="form-group">
                <label className="text-sm">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="text-sm">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-600/30 rounded text-sm text-center">
              <span className="text-green-400 font-bold">
                {formatDuration(calculateDuration())}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            <i className="fa-solid fa-info-circle mr-1"></i>
            These times will be used as defaults. You can customize timing for
            each day when adding to schedule.
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary flex-1">
              <i className="fa-solid fa-save mr-2"></i>
              {editingTemplate ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition"
            >
              Cancel
            </button>
          </div>

          {editingTemplate && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full mt-4 px-4 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            >
              <i className="fa-solid fa-trash mr-2"></i>Delete Template
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CommitmentTemplateModal;
