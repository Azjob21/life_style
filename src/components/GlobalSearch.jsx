import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * Global Search / Filter
 * Searches across commitment templates, training programs, and content plans.
 */
function GlobalSearch({ commitmentTemplates, userId, onNavigate }) {
  const userKey = (key) => `${userId || "anonymous"}:${key}`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Gather all searchable items
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items = [];

    // Templates
    (commitmentTemplates || []).forEach((t) => {
      if (
        (t.name || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
      ) {
        items.push({
          type: "template",
          icon: "fa-solid fa-layer-group",
          color: t.color || "#3b82f6",
          name: t.name,
          detail: t.category || "general",
          view: "timetable",
        });
      }
    });

    // Training programs
    try {
      const programs = JSON.parse(
        localStorage.getItem(userKey("training-programs")) || "[]",
      );
      programs.forEach((p) => {
        if ((p.name || "").toLowerCase().includes(q)) {
          items.push({
            type: "training",
            icon: "fa-solid fa-dumbbell",
            color: "#f97316",
            name: p.name,
            detail: `${(p.days || []).length} days`,
            view: "training",
          });
        }
        // Search exercises too
        (p.days || []).forEach((d) => {
          (d.exercises || []).forEach((ex) => {
            if ((ex.name || "").toLowerCase().includes(q)) {
              items.push({
                type: "exercise",
                icon: "fa-solid fa-dumbbell",
                color: "#ef4444",
                name: ex.name,
                detail: `in ${p.name} → ${d.name}`,
                view: "training",
              });
            }
          });
        });
      });
    } catch (e) {}

    // Content plans
    try {
      const plans = JSON.parse(
        localStorage.getItem(userKey("content-plans")) || "[]",
      );
      plans.forEach((p) => {
        if ((p.name || "").toLowerCase().includes(q)) {
          items.push({
            type: "content",
            icon: "fa-solid fa-video",
            color: "#8b5cf6",
            name: p.name,
            detail: `${(p.items || []).length} items`,
            view: "content",
          });
        }
        (p.items || []).forEach((item) => {
          if ((item.title || "").toLowerCase().includes(q)) {
            items.push({
              type: "content-item",
              icon: "fa-solid fa-pen-nib",
              color: "#ec4899",
              name: item.title,
              detail: `in ${p.name} • ${item.platform || "—"}`,
              view: "content",
            });
          }
        });
      });
    } catch (e) {}

    return items.slice(0, 15);
  }, [query, commitmentTemplates, userId]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
        title="Search (Ctrl+K)"
      >
        <i className="fa-solid fa-magnifying-glass text-xs"></i>
        <span className="hidden sm:inline text-xs text-slate-400">Ctrl+K</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={() => {
        setOpen(false);
        setQuery("");
      }}
    >
      <div
        className="w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search templates, programs, content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {query.trim() && (
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <i className="fa-solid fa-search text-2xl text-slate-300 dark:text-slate-600 mb-2"></i>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No results for "{query}"
                </p>
              </div>
            ) : (
              results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate?.(item.view);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}20` }}
                  >
                    <i
                      className={item.icon}
                      style={{ color: item.color, fontSize: "12px" }}
                    ></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold capitalize flex-shrink-0">
                    {item.type}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Type to search across all your data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalSearch;
