import React, { useState } from "react";

function TimingUpdateModal({ onClose, onSave, currentStart, currentEnd }) {
  const [startTime, setStartTime] = useState(currentStart);
  const [endTime, setEndTime] = useState(currentEnd);
  const [updateAll, setUpdateAll] = useState(false);

  const handleSave = () => {
    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }
    onSave(startTime, endTime, updateAll);
  };

  return (
    <div className="modal active">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Timing</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Update scope option */}
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateAll}
                onChange={(e) => setUpdateAll(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                <span className="font-bold text-green-400">
                  Update all instances
                </span>
                <br />
                <span className="text-xs text-slate-400">
                  {updateAll
                    ? "Change this commitment in all days of the week"
                    : "Change only this specific day"}
                </span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="btn-primary flex-1">
              <i className="fa-solid fa-check mr-2"></i>Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimingUpdateModal;
