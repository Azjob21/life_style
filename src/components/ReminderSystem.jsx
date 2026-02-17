import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * In-app Reminder System
 * Checks every 60s if any scheduled blocks are coming up within the next 30 minutes.
 * Shows in-app notification banners + optional browser push notifications.
 */
function ReminderSystem({
  dayInstances,
  commitmentTemplates,
  currentWeekStart,
}) {
  const [reminders, setReminders] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [notifPermission, setNotifPermission] = useState("default");
  const intervalRef = useRef(null);

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
    }
  };

  // Get today's day index (Mon=0 ... Sun=6)
  const getTodayIdx = useCallback(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

  const checkUpcoming = useCallback(() => {
    const todayIdx = getTodayIdx();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const instances = dayInstances[todayIdx] || [];

    const upcoming = [];
    instances.forEach((inst) => {
      const [h, m] = (inst.startTime || "00:00").split(":").map(Number);
      const startMin = h * 60 + m;
      const diff = startMin - currentMinutes;
      const key = `${inst.id}-${inst.startTime}`;

      if (diff > 0 && diff <= 30 && !dismissed.has(key)) {
        const template = (commitmentTemplates || []).find(
          (t) => t.id === inst.templateId,
        );
        if (template) {
          upcoming.push({
            id: key,
            instanceId: inst.id,
            name: template.name,
            color: template.color,
            startTime: inst.startTime,
            minutesAway: diff,
          });
        }
      }
    });

    // Send browser notification for new reminders
    if (notifPermission === "granted") {
      upcoming.forEach((r) => {
        if (!dismissed.has(`notif-${r.id}`)) {
          try {
            new Notification(`${r.name} in ${r.minutesAway} min`, {
              body: `Starting at ${r.startTime}`,
              icon: "/favicon.ico",
              tag: r.id, // prevents duplicates
            });
          } catch (e) {
            /* ignore */
          }
          setDismissed((prev) => new Set([...prev, `notif-${r.id}`]));
        }
      });
    }

    setReminders(upcoming);
  }, [
    dayInstances,
    commitmentTemplates,
    dismissed,
    getTodayIdx,
    notifPermission,
  ]);

  useEffect(() => {
    checkUpcoming();
    intervalRef.current = setInterval(checkUpcoming, 60000); // check every minute
    return () => clearInterval(intervalRef.current);
  }, [checkUpcoming]);

  const dismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  if (reminders.length === 0 && notifPermission !== "default") return null;

  return (
    <div className="space-y-2 mb-4">
      {/* Permission request banner */}
      {notifPermission === "default" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <i className="fa-solid fa-bell text-blue-500 text-lg"></i>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
              Enable Reminders
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400">
              Get notified before your commitments start
            </p>
          </div>
          <button
            onClick={requestPermission}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            Enable
          </button>
          <button
            onClick={() => setNotifPermission("denied")}
            className="text-blue-400 hover:text-blue-600 transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Active reminders */}
      {reminders.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm animate-confetti"
          style={{
            background: `${r.color}10`,
            borderColor: `${r.color}40`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${r.color}25` }}
          >
            <i className="fa-solid fa-clock" style={{ color: r.color }}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {r.name}
              <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                in {r.minutesAway} min
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Starting at {r.startTime}
            </p>
          </div>
          <button
            onClick={() => dismiss(r.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ReminderSystem;
