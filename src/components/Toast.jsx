import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: "fa-solid fa-check-circle",
  error: "fa-solid fa-circle-exclamation",
  warning: "fa-solid fa-triangle-exclamation",
  info: "fa-solid fa-circle-info",
  undo: "fa-solid fa-rotate-left",
};

const COLORS = {
  success: "from-green-500 to-emerald-600",
  error: "from-red-500 to-rose-600",
  warning: "from-amber-500 to-orange-600",
  info: "from-blue-500 to-indigo-600",
  undo: "from-violet-500 to-purple-600",
};

const BG = {
  success:
    "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  warning:
    "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
  info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
  undo: "bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800",
};

const TEXT_COLOR = {
  success: "text-green-700 dark:text-green-300",
  error: "text-red-700 dark:text-red-300",
  warning: "text-amber-700 dark:text-amber-300",
  info: "text-blue-700 dark:text-blue-300",
  undo: "text-violet-700 dark:text-violet-300",
};

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast.persistent) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 max-w-sm w-full ${BG[toast.type] || BG.info} ${
        exiting
          ? "opacity-0 translate-x-8 scale-95"
          : "opacity-100 translate-x-0 scale-100"
      }`}
      style={{ animation: exiting ? "none" : "slideIn 0.3s ease-out" }}
    >
      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${COLORS[toast.type] || COLORS.info} flex items-center justify-center flex-shrink-0`}
      >
        <i
          className={`${ICONS[toast.type] || ICONS.info} text-white text-sm`}
        ></i>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold ${TEXT_COLOR[toast.type] || TEXT_COLOR.info}`}
        >
          {toast.message}
        </p>
        {toast.detail && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {toast.detail}
          </p>
        )}
      </div>
      {toast.onUndo && (
        <button
          onClick={() => {
            toast.onUndo();
            handleDismiss();
          }}
          className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex-shrink-0"
        >
          Undo
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition flex-shrink-0 ml-1"
      >
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", options = {}) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, ...options }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, options = {}) => addToast(message, "info", options),
    [addToast],
  );
  toast.success = (message, options) => addToast(message, "success", options);
  toast.error = (message, options) => addToast(message, "error", options);
  toast.warning = (message, options) => addToast(message, "warning", options);
  toast.info = (message, options) => addToast(message, "info", options);
  toast.undo = (message, onUndo, options) =>
    addToast(message, "undo", { onUndo, duration: 6000, ...options });

  // Custom confirm replacement
  toast.confirm = (message, onConfirm, onCancel) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: "warning",
        persistent: true,
        isConfirm: true,
        onConfirm: () => {
          dismissToast(id);
          onConfirm?.();
        },
        onCancel: () => {
          dismissToast(id);
          onCancel?.();
        },
      },
    ]);
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) =>
          t.isConfirm ? (
            <div
              key={t.id}
              className={`pointer-events-auto flex flex-col gap-2 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm max-w-sm w-full ${BG.warning}`}
              style={{ animation: "slideIn 0.3s ease-out" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-triangle-exclamation text-white text-sm"></i>
                </div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {t.message}
                </p>
              </div>
              <div className="flex gap-2 ml-11">
                <button
                  onClick={t.onConfirm}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                >
                  Confirm
                </button>
                <button
                  onClick={t.onCancel}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismissToast} />
            </div>
          ),
        )}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
