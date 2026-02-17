import React, { useState } from "react";
import useBackend from "../utils/useBackend";

function DayView({
  dayIdx,
  dayName,
  instances,
  onClose,
  onToggleCompletion,
  onRemoveInstance,
  onUpdateInstanceTiming,
  onAddNote,
  dayNote = "",
  onToggleDayStatus,
  isDayMarked = false,
}) {
  const backend = useBackend();
  const [noteText, setNoteText] = useState(dayNote);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-4xl max-h-[95vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-blue-600 dark:text-blue-400">
                {dayName}
              </span>
              <span className="text-slate-300 dark:text-slate-700">
                Detailed View
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your daily priorities and notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Schedule Column */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <i className="fa-solid fa-calendar-day"></i> Schedule
            </h3>

            <div className="space-y-3">
              {instances.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <i className="fa-solid fa-ghost text-4xl text-slate-200 dark:text-slate-800 mb-4 block"></i>
                  <p className="text-slate-400 dark:text-slate-600 font-medium">
                    No commitments for this day.
                  </p>
                </div>
              ) : (
                instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="group bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-400/50 transition-all shadow-sm"
                  >
                    <div
                      className="w-1.5 h-12 rounded-full"
                      style={{ backgroundColor: instance.color }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {instance.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {instance.startTime} — {instance.endTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onToggleCompletion(dayIdx, instance.id)}
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                      <button
                        onClick={() => onRemoveInstance(dayIdx, instance.id)}
                        className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls & Notes Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Day Status */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                Day Performance
              </h3>
              <button
                onClick={onToggleDayStatus}
                className={`w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isDayMarked
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white"
                }`}
              >
                <i
                  className={`fa-solid ${isDayMarked ? "fa-award" : "fa-bullseye"} mr-2`}
                ></i>
                {isDayMarked ? "TARGET HIT" : "MARK AS HIT"}
              </button>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex justify-between">
                <span>Notes</span>
                {noteText !== dayNote && (
                  <span className="text-blue-500 animate-pulse text-[10px]">
                    Unsaved
                  </span>
                )}
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={async () => {
                  onAddNote(dayIdx, noteText);
                  // Also save to backend
                  try {
                    const weekId =
                      new Date().getFullYear() +
                      "-W" +
                      String(
                        Math.ceil(
                          (new Date().getDate() - new Date().getDay() + 1) / 7,
                        ),
                      ).padStart(2, "0");
                    await backend.saveDailyNote(weekId, dayIdx, noteText);
                  } catch (error) {
                    console.error("Error saving note to backend:", error);
                  }
                }}
                className="w-full h-48 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl text-sm italic text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Write down any lessons or specific thoughts for this day..."
              ></textarea>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 px-2 italic font-medium">
                Auto-saves to backend when you click out of the box.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
            "Excellence is a habit, not an act."
          </p>
        </div>
      </div>
    </div>
  );
}

export default DayView;
