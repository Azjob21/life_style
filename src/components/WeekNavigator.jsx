import React from "react";

function WeekNavigator({ onPrevious, onToday, onNext }) {
  return (
    <div className="flex gap-3 mb-8 justify-center">
      <button
        onClick={onPrevious}
        className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2"
      >
        <i className="fa-solid fa-chevron-left"></i>
        Previous Week
      </button>

      <button
        onClick={onToday}
        className="px-4 py-2 rounded bg-green-600/20 text-green-400 hover:bg-green-600/30 transition flex items-center gap-2 border border-green-600/50"
      >
        <i className="fa-solid fa-calendar-check"></i>
        Today
      </button>

      <button
        onClick={onNext}
        className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2"
      >
        Next Week
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

export default WeekNavigator;
