import React, { useState, useEffect } from "react";

function CommitmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCommitment,
  colors,
  priorityColors,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: colors[0],
    days: [],
    startTime: "09:00",
    endTime: "12:00",
    priority: "medium",
    timings: {},
  });

  const [showTimingDetails, setShowTimingDetails] = useState(false);

  useEffect(() => {
    if (editingCommitment) {
      setFormData(editingCommitment);
    } else {
      setFormData({
        name: "",
        description: "",
        color: colors[0],
        days: [],
        startTime: "09:00",
        endTime: "12:00",
        priority: "medium",
        timings: {},
      });
    }
    setShowTimingDetails(false);
  }, [editingCommitment, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayIdx) => {
    setFormData((prev) => {
      const newDays = prev.days.includes(dayIdx)
        ? prev.days.filter((d) => d !== dayIdx)
        : [...prev.days, dayIdx];
      return { ...prev, days: newDays };
    });
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleDayTimingChange = (dayIdx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      timings: {
        ...prev.timings,
        [dayIdx]: {
          ...(prev.timings[dayIdx] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.days.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={`modal ${isOpen ? "active" : ""}`}>
      <div className="modal-content max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingCommitment ? "Edit Commitment" : "New Commitment"}
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
              placeholder="e.g., AI/Game Dev Project"
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
              placeholder="What's this commitment about?"
              rows="3"
            ></textarea>
          </div>

          {/* Priority & Color Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Priority */}
            <div className="form-group">
              <label>Importance Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟠 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">
                This affects the background intensity
              </p>
            </div>

            {/* Color */}
            <div className="form-group">
              <label>Color Tag</label>
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

          {/* Days Selection */}
          <div className="form-group">
            <label>Select Days *</label>
            <div className="day-selector">
              {DAYS.map((day, idx) => (
                <label key={idx}>
                  <input
                    type="checkbox"
                    checked={formData.days.includes(idx)}
                    onChange={() => handleDayToggle(idx)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default Time Block */}
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <label className="font-semibold">Default Time Block</label>
              <button
                type="button"
                onClick={() => setShowTimingDetails(!showTimingDetails)}
                className="text-xs text-green-400 hover:text-green-300"
              >
                {showTimingDetails ? "Hide" : "Show"} per-day timing
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Per-Day Timing Details */}
          {showTimingDetails && (
            <div className="mb-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/50">
              <h4 className="font-semibold mb-4 text-sm">
                <i className="fa-solid fa-clock mr-2"></i>
                Different Times per Day
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.days.map((dayIdx) => (
                  <div
                    key={dayIdx}
                    className="flex items-center gap-3 p-3 bg-slate-600/30 rounded"
                  >
                    <span className="w-10 font-semibold text-green-400">
                      {DAYS[dayIdx]}
                    </span>
                    <input
                      type="time"
                      value={
                        formData.timings[dayIdx]?.startTime ||
                        formData.startTime
                      }
                      onChange={(e) =>
                        handleDayTimingChange(
                          dayIdx,
                          "startTime",
                          e.target.value,
                        )
                      }
                      className="form-input text-sm"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={
                        formData.timings[dayIdx]?.endTime || formData.endTime
                      }
                      onChange={(e) =>
                        handleDayTimingChange(dayIdx, "endTime", e.target.value)
                      }
                      className="form-input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary flex-1">
              <i className="fa-solid fa-check mr-2"></i>Save Commitment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition"
            >
              Cancel
            </button>
          </div>

          {editingCommitment && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full mt-4 px-4 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            >
              <i className="fa-solid fa-trash mr-2"></i>Delete Commitment
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CommitmentModal;
