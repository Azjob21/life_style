import React from "react";

function WeekNavigator({ onPrevious, onToday, onNext }) {
  return (
    <div className="flex gap-4 mb-8 justify-center items-center">
      <button
        onClick={onPrevious}
        className="p-3 rounded-full bg-slate-700 dark:bg-slate-300 hover:bg-slate-600 dark:hover:bg-slate-200 transition text-slate-100 dark:text-slate-900"
        title="Previous Week"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <button
        onClick={onToday}
        className="px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 dark:bg-blue-600/20 dark:text-blue-600 hover:bg-blue-600/30 dark:hover:bg-blue-600/30 transition text-sm font-semibold border border-blue-600/50"
        title="Go to Today"
      >
        Today
      </button>

      <button
        onClick={onNext}
        className="p-3 rounded-full bg-slate-700 dark:bg-slate-300 hover:bg-slate-600 dark:hover:bg-slate-200 transition text-slate-100 dark:text-slate-900"
        title="Next Week"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default WeekNavigator;
