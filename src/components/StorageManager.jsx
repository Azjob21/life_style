import React, { useState, useEffect } from "react";
import {
  isElectron,
  saveScheduleFile,
  loadScheduleFile,
  listSavedSchedules,
  deleteScheduleFile,
} from "../utils/electronAPI";

function StorageManager({ isOpen, onClose, onLoad, scheduleData }) {
  const [savedFiles, setSavedFiles] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isElectronApp = isElectron();

  useEffect(() => {
    if (isOpen && isElectronApp) {
      loadSavedFiles();
    }
  }, [isOpen, isElectronApp]);

  const loadSavedFiles = async () => {
    try {
      setIsLoading(true);
      const files = await listSavedSchedules();
      setSavedFiles(files);
    } catch (error) {
      alert("Error loading files: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!newFileName.trim()) {
      alert("Please enter a filename");
      return;
    }

    const filename = newFileName.endsWith(".json")
      ? newFileName
      : `${newFileName}.json`;

    try {
      setIsLoading(true);
      await saveScheduleFile(filename, scheduleData);
      setNewFileName("");
      if (isElectronApp) {
        await loadSavedFiles();
      }
    } catch (error) {
      alert("Error saving file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSchedule = async (filename) => {
    try {
      setIsLoading(true);
      const data = await loadScheduleFile(filename);
      onLoad(data);
      onClose();
    } catch (error) {
      alert("Error loading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (confirm(`Delete ${filename}?`)) {
      try {
        setIsLoading(true);
        await deleteScheduleFile(filename);
        await loadSavedFiles();
      } catch (error) {
        alert("Error deleting file: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
      <div className="modal-content w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isElectronApp ? "Schedule Library" : "Import/Export Schedule"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {isElectronApp ? (
          <>
            {/* Electron version with full file management */}
            <div className="space-y-6">
              {/* Save new schedule */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">
                  Save Current Schedule
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter filename (e.g., Week1, Q1-Plan)"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="form-input flex-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSaveSchedule}
                    disabled={isLoading || !newFileName.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-white font-semibold transition"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  📁 Files saved to: Documents/Schedule App/
                </p>
              </div>

              {/* Saved schedules list */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">
                  Saved Schedules ({savedFiles.length})
                </h3>
                {isLoading && savedFiles.length === 0 ? (
                  <p className="text-slate-500">Loading files...</p>
                ) : savedFiles.length === 0 ? (
                  <p className="text-slate-500">No saved schedules yet</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-white/10 hover:border-white/20 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-100">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Modified: {file.modified} • {file.size} bytes
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadSchedule(file.name)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-white text-sm transition"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded text-white text-sm transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Browser version with standard import/export */}
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                You're using the browser version. Use the Export/Import buttons
                in the header for file management.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StorageManager;
