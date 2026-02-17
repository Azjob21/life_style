import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import WeeklyCalendar from "./components/WeeklyCalendar";
import Dashboard from "./components/Dashboard";
import CommitmentTemplateModal from "./components/CommitmentTemplateModal";
import TimingUpdateModal from "./components/TimingUpdateModal";
import TemplateManager from "./components/TemplateManager";
import StorageManager from "./components/StorageManager";
import TrainingView from "./components/TrainingView";
import ContentView from "./components/ContentView";
import StatsView from "./components/StatsView";
import DayView from "./components/DayView";
import AuthScreen from "./components/AuthScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider, useToast } from "./components/Toast";
import ReminderSystem from "./components/ReminderSystem";
import GoalsPanel from "./components/GoalsPanel";
import HabitStreaks from "./components/HabitStreaks";
import GlobalSearch from "./components/GlobalSearch";
import OnboardingGuide from "./components/OnboardingGuide";
import useBackend from "./utils/useBackend";
import supabase from "./utils/supabaseClient";

function App() {
  // Auth state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check current session with timeout
    const timeout = setTimeout(() => {
      console.warn("Auth check timed out");
      setAuthLoading(false);
    }, 5000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        setSession(session);
        setAuthLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error("Auth error:", err);
        setAuthLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <MainApp session={session} onSignOut={handleSignOut} />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function MainApp({ session, onSignOut }) {
  // Backend integration
  const backend = useBackend();
  const toast = useToast();

  // User-scoped localStorage key helper
  const userId = session?.user?.id || "anonymous";
  const userKey = (key) => `${userId}:${key}`;

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved ? saved === "dark" : false;
  });

  const [commitmentTemplates, setCommitmentTemplates] = useState([]);

  // Day instances - mapping of dayIndex -> array of instances
  const [dayInstances, setDayInstances] = useState({});

  // Completion tracking - mapping of dayIndex -> { instanceId: boolean }
  const [completedInstances, setCompletedInstances] = useState({});

  // Day properties (available time per day)
  const [dayProperties, setDayProperties] = useState({
    0: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    1: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    2: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    3: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    4: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    5: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
    6: { availableTimeStart: "08:00", availableTimeEnd: "22:00" },
  });

  // Progression tracking
  const [userProgress, setUserProgress] = useState({});
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [pendingInsights, setPendingInsights] = useState([]);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showTimingUpdateModal, setShowTimingUpdateModal] = useState(false);
  const [timingUpdateContext, setTimingUpdateContext] = useState(null);
  const [weekDateRange, setWeekDateRange] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState(null);
  const [currentView, setCurrentView] = useState("timetable"); // 'timetable', 'training', 'content', 'stats'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Day View specific state
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [dayNotes, setDayNotes] = useState({});
  const [dayMarked, setDayMarked] = useState({});

  // Block-level notes: { instanceId: "note text" }
  const [blockNotes, setBlockNotes] = useState({});

  // Undo stack
  const [undoStack, setUndoStack] = useState([]);

  // Recurring schedule toggle
  const [recurringEnabled, setRecurringEnabled] = useState(() => {
    return localStorage.getItem(userKey("recurring-enabled")) === "true";
  });

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Load data from backend + localStorage
  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  useEffect(() => {
    updateWeekDateRange();
  }, [currentWeekStart]);

  const getWeekKey = (date) => {
    const year = date.getFullYear();
    const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
    return `${year}-W${weekNum}`;
  };

  const loadData = async () => {
    try {
      // Load templates from backend
      const templates = await backend.getCommitments();
      if (templates && templates.length > 0) {
        setCommitmentTemplates(templates);
      } else {
        // Fallback to localStorage
        const savedTemplates = localStorage.getItem(
          userKey("commitment-templates"),
        );
        if (savedTemplates) {
          setCommitmentTemplates(JSON.parse(savedTemplates));
        }
      }

      // Load week data
      const weekKey = getWeekKey(currentWeekStart);

      // Get instances from backend
      const instances = await backend.getScheduleInstancesForWeek(weekKey);
      if (instances && instances.length > 0) {
        // Convert flat array to day-indexed format
        const byDay = {};
        instances.forEach((inst) => {
          if (!byDay[inst.dayIndex]) byDay[inst.dayIndex] = [];
          byDay[inst.dayIndex].push(inst);
        });
        setDayInstances(byDay);
      } else {
        // Fallback to localStorage
        const savedInstances = localStorage.getItem(
          userKey(`week-instances-${weekKey}`),
        );
        if (savedInstances) {
          setDayInstances(JSON.parse(savedInstances));
        } else if (recurringEnabled) {
          // Auto-populate from previous week if recurring is enabled
          const prevWeekDate = new Date(currentWeekStart);
          prevWeekDate.setDate(prevWeekDate.getDate() - 7);
          const prevWeekKey = getWeekKey(prevWeekDate);
          const prevSaved = localStorage.getItem(
            userKey(`week-instances-${prevWeekKey}`),
          );
          if (prevSaved) {
            const prevInstances = JSON.parse(prevSaved);
            // Re-key instance IDs so they're unique
            const copied = {};
            Object.entries(prevInstances).forEach(([dayIdx, insts]) => {
              if (Array.isArray(insts)) {
                copied[dayIdx] = insts.map((inst) => ({
                  ...inst,
                  id: `${inst.templateId}-${dayIdx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                }));
              }
            });
            setDayInstances(copied);
            toast.info("Recurring schedule applied from last week");
          } else {
            setDayInstances({});
          }
        } else {
          setDayInstances({});
        }
      }

      // Load day properties from backend
      if (backend.getDayProperties) {
        const dbDayProps = await backend.getDayProperties(weekKey);
        if (dbDayProps && Object.keys(dbDayProps).length > 0) {
          // Merge with defaults
          const merged = { ...dayProperties };
          Object.entries(dbDayProps).forEach(([idx, props]) => {
            merged[idx] = { ...merged[idx], ...props };
          });
          setDayProperties(merged);
        }
      } else {
        const savedDayProps = localStorage.getItem(
          userKey(`week-dayprops-${weekKey}`),
        );
        if (savedDayProps) {
          setDayProperties(JSON.parse(savedDayProps));
        }
      }

      // Load completions from backend
      const completions = await backend.getCompletionsForWeek(weekKey);
      if (completions && completions.length > 0) {
        // Convert to completed state format
        const completed = {};
        completions.forEach((c) => {
          if (c.completed) completed[c.instanceId] = true;
        });
        setCompletedInstances(completed);
      } else {
        // Fallback to localStorage
        const savedCompleted = localStorage.getItem(
          userKey(`week-completed-${weekKey}`),
        );
        if (savedCompleted) {
          setCompletedInstances(JSON.parse(savedCompleted));
        } else {
          setCompletedInstances({});
        }
      }

      // Load notes from backend
      if (backend.getWeeklyNotes) {
        const notes = await backend.getWeeklyNotes(weekKey);
        setDayNotes(notes || {});
      } else {
        const savedNotes = localStorage.getItem(
          userKey(`week-notes-${weekKey}`),
        );
        setDayNotes(savedNotes ? JSON.parse(savedNotes) : {});
      }

      // Load marked days from backend
      if (backend.getDayMarked) {
        const marked = await backend.getDayMarked(weekKey);
        setDayMarked(marked || {});
      } else {
        const savedMarked = localStorage.getItem(
          userKey(`week-marked-${weekKey}`),
        );
        setDayMarked(savedMarked ? JSON.parse(savedMarked) : {});
      }

      // Load weekly stats
      const stats = await backend.getWeeklyStats(weekKey);
      if (stats) {
        setWeeklyStats(stats);
      }

      // Load insights
      const insights = await backend.getInsights(weekKey);
      if (insights && insights.length > 0) {
        setPendingInsights(insights);
      }
    } catch (error) {
      console.error("Error loading application data:", error);
      // Fallback to defaults
      setDayInstances({});
      setCompletedInstances({});
      setDayNotes({});
      setDayMarked({});
    }
  };

  const saveDayNote = async (dayIdx, note) => {
    const weekKey = getWeekKey(currentWeekStart);
    const newNotes = { ...dayNotes, [dayIdx]: note };
    setDayNotes(newNotes);

    // Save to backend
    await backend.saveDailyNote(weekKey, dayIdx, note);

    // Save to localStorage fallback
    localStorage.setItem(
      userKey(`week-notes-${weekKey}`),
      JSON.stringify(newNotes),
    );
  };

  const toggleDayStatus = (dayIdx) => {
    const weekKey = getWeekKey(currentWeekStart);
    const newValue = !dayMarked[dayIdx];
    const newMarked = { ...dayMarked, [dayIdx]: newValue };
    setDayMarked(newMarked);

    // Save to backend
    if (backend.saveDayMarked) {
      backend
        .saveDayMarked(weekKey, dayIdx, newValue)
        .catch((err) => console.error("Error saving day marked:", err));
    }
    localStorage.setItem(
      userKey(`week-marked-${weekKey}`),
      JSON.stringify(newMarked),
    );
  };

  // Save templates to backend + localStorage
  useEffect(() => {
    if (commitmentTemplates.length > 0) {
      // Save each to backend
      commitmentTemplates.forEach((template) => {
        backend
          .saveCommitment(template)
          .catch((err) => console.error("Error saving template:", err));
      });
    }
    // Save to localStorage fallback
    localStorage.setItem(
      userKey("commitment-templates"),
      JSON.stringify(commitmentTemplates),
    );
  }, [commitmentTemplates]);

  // Save week data to backend + localStorage
  useEffect(() => {
    const weekKey = getWeekKey(currentWeekStart);

    // Save instances to backend (use Object.entries to preserve dayIndex)
    Object.entries(dayInstances).forEach(([dayIdx, dayInsts]) => {
      if (Array.isArray(dayInsts)) {
        dayInsts.forEach((inst) => {
          const instanceWithWeek = {
            ...inst,
            weekId: weekKey,
            dayIndex:
              inst.dayIndex !== undefined ? inst.dayIndex : Number(dayIdx),
          };
          backend
            .saveScheduleInstance(instanceWithWeek)
            .catch((err) => console.error("Error saving instance:", err));
        });
      }
    });

    // Save to localStorage fallback
    localStorage.setItem(
      userKey(`week-instances-${weekKey}`),
      JSON.stringify(dayInstances),
    );
    localStorage.setItem(
      userKey(`week-dayprops-${weekKey}`),
      JSON.stringify(dayProperties),
    );
    localStorage.setItem(
      userKey(`week-completed-${weekKey}`),
      JSON.stringify(completedInstances),
    );
  }, [dayInstances, dayProperties, completedInstances, currentWeekStart]);

  // Track completions to backend
  useEffect(() => {
    const weekKey = getWeekKey(currentWeekStart);

    Object.entries(completedInstances).forEach(([instanceId, completed]) => {
      backend
        .markCompletion({
          id: `completion-${instanceId}-${weekKey}`,
          instanceId,
          weekId: weekKey,
          completed,
          completionTime: completed ? new Date().toISOString() : null,
        })
        .catch((err) => console.error("Error marking completion:", err));
    });
  }, [completedInstances, currentWeekStart]);

  const updateWeekDateRange = () => {
    const startOfWeek = new Date(currentWeekStart);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(
      currentWeekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
    );

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options = { month: "short", day: "numeric" };
    const start = startOfWeek.toLocaleDateString("en-US", options);
    const end = endOfWeek.toLocaleDateString("en-US", options);

    setWeekDateRange(`${start} - ${end}, ${endOfWeek.getFullYear()}`);
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    setCurrentWeekStart(new Date());
  };

  // Template management
  const openAddTemplateModal = () => {
    setEditingTemplateId(null);
    setShowTemplateModal(true);
  };

  const editTemplate = (id) => {
    setEditingTemplateId(id);
    setShowTemplateModal(true);
  };

  const saveTemplate = (data) => {
    if (editingTemplateId) {
      setCommitmentTemplates(
        commitmentTemplates.map((t) =>
          t.id === editingTemplateId ? { ...data, id: editingTemplateId } : t,
        ),
      );
    } else {
      setCommitmentTemplates([
        ...commitmentTemplates,
        { ...data, id: Date.now() },
      ]);
    }
    setShowTemplateModal(false);
    setEditingTemplateId(null);
  };

  const deleteTemplate = (id) => {
    toast.confirm("Delete this commitment template?", async () => {
      const deletedTemplate = commitmentTemplates.find((t) => t.id === id);
      await backend.deleteCommitment(id);

      setCommitmentTemplates(commitmentTemplates.filter((t) => t.id !== id));
      const newInstances = { ...dayInstances };
      const weekKey = getWeekKey(currentWeekStart);

      Object.keys(newInstances).forEach((dayIdx) => {
        const instancesToRemove = newInstances[dayIdx].filter(
          (inst) => inst.templateId === id,
        );
        instancesToRemove.forEach((inst) => {
          backend
            .removeScheduleInstance(weekKey, dayIdx, inst.id)
            .catch((err) => console.error("Error removing instance:", err));
        });

        newInstances[dayIdx] = newInstances[dayIdx].filter(
          (inst) => inst.templateId !== id,
        );
      });
      setDayInstances(newInstances);

      if (deletedTemplate) {
        toast.undo(`Deleted "${deletedTemplate.name}"`, () => {
          setCommitmentTemplates((prev) => [...prev, deletedTemplate]);
        });
      }
    });
  };

  const editingTemplate = editingTemplateId
    ? commitmentTemplates.find((t) => t.id === editingTemplateId)
    : null;

  // Day instance management
  const addInstanceToDay = (templateId, dayIdx, startTime, endTime) => {
    const newInstance = {
      id: `${templateId}-${dayIdx}-${Date.now()}`,
      templateId,
      dayIndex: dayIdx,
      startTime,
      endTime,
    };

    setDayInstances((prev) => ({
      ...prev,
      [dayIdx]: [...(prev[dayIdx] || []), newInstance],
    }));
  };

  const removeInstanceFromDay = (dayIdx, instanceId) => {
    // Save for undo
    const removed = dayInstances[dayIdx]?.find(
      (inst) => inst.id === instanceId,
    );
    const template = removed
      ? commitmentTemplates.find(
          (t) => String(t.id) === String(removed.templateId),
        )
      : null;

    const weekKey = getWeekKey(currentWeekStart);
    backend
      .removeScheduleInstance(weekKey, dayIdx, instanceId)
      .catch((err) =>
        console.error("Error removing instance from backend:", err),
      );

    setDayInstances((prev) => ({
      ...prev,
      [dayIdx]: prev[dayIdx].filter((inst) => inst.id !== instanceId),
    }));

    if (removed) {
      toast.undo(`Removed "${template?.name || "block"}"`, () => {
        setDayInstances((prev) => ({
          ...prev,
          [dayIdx]: [...(prev[dayIdx] || []), removed],
        }));
      });
    }
  };

  // Block notes management
  const saveBlockNote = (instanceId, note) => {
    const newNotes = { ...blockNotes, [instanceId]: note };
    setBlockNotes(newNotes);
    const weekKey = getWeekKey(currentWeekStart);
    localStorage.setItem(
      userKey(`block-notes-${weekKey}`),
      JSON.stringify(newNotes),
    );
  };

  // Load block notes when week changes
  useEffect(() => {
    const weekKey = getWeekKey(currentWeekStart);
    const saved = localStorage.getItem(userKey(`block-notes-${weekKey}`));
    setBlockNotes(saved ? JSON.parse(saved) : {});
  }, [currentWeekStart]);

  const clearWeekSchedule = () => {
    toast.confirm(
      "Clear ALL commitments from this week? This cannot be undone.",
      () => {
        const weekKey = getWeekKey(currentWeekStart);
        const savedInstances = { ...dayInstances };
        const savedCompleted = { ...completedInstances };

        Object.entries(dayInstances).forEach(([dayIdx, instances]) => {
          if (Array.isArray(instances)) {
            instances.forEach((inst) => {
              backend
                .removeScheduleInstance(weekKey, dayIdx, inst.id)
                .catch((err) => console.error("Error clearing instance:", err));
            });
          }
        });

        Object.entries(completedInstances).forEach(([dayIdx, dayCompleted]) => {
          if (typeof dayCompleted === "object" && dayCompleted !== null) {
            Object.keys(dayCompleted).forEach((instanceId) => {
              backend
                .markCompletion({
                  id: `completion-${instanceId}-${weekKey}`,
                  instanceId,
                  weekId: weekKey,
                  completed: false,
                  completionTime: null,
                })
                .catch((err) =>
                  console.error("Error clearing completion:", err),
                );
            });
          }
        });

        setDayInstances({});
        setCompletedInstances({});
        localStorage.removeItem(userKey(`week-instances-${weekKey}`));
        localStorage.removeItem(userKey(`week-completed-${weekKey}`));

        toast.undo("Week schedule cleared", () => {
          setDayInstances(savedInstances);
          setCompletedInstances(savedCompleted);
        });
      },
    );
  };

  const updateInstanceTiming = (
    dayIdx,
    instanceId,
    startTime,
    endTime,
    updateAll,
  ) => {
    if (updateAll) {
      // Update this template in all days
      const instance = dayInstances[dayIdx].find(
        (inst) => inst.id === instanceId,
      );
      if (instance) {
        const newInstances = { ...dayInstances };
        Object.keys(newInstances).forEach((d) => {
          newInstances[d] = newInstances[d].map((inst) =>
            inst.templateId === instance.templateId
              ? { ...inst, startTime, endTime }
              : inst,
          );
        });
        setDayInstances(newInstances);
      }
    } else {
      // Update only this instance
      setDayInstances((prev) => ({
        ...prev,
        [dayIdx]: prev[dayIdx].map((inst) =>
          inst.id === instanceId ? { ...inst, startTime, endTime } : inst,
        ),
      }));
    }
    setShowTimingUpdateModal(false);
    setTimingUpdateContext(null);
  };

  const updateDayProperty = (dayIdx, field, value) => {
    setDayProperties((prev) => ({
      ...prev,
      [dayIdx]: { ...prev[dayIdx], [field]: value },
    }));
  };

  const toggleCompletion = (dayIdx, instanceId) => {
    setCompletedInstances((prev) => {
      const dayCompleted = prev[dayIdx] || {};
      const isCompleted = dayCompleted[instanceId];
      const newState = !isCompleted;

      // Find the instance to get commitment info
      const instance = dayInstances[dayIdx]?.find((i) => i.id === instanceId);
      if (instance) {
        const weekKey = getWeekKey(currentWeekStart);

        // Track to backend
        backend
          .markCompletion({
            id: `completion-${instanceId}-${weekKey}`,
            instanceId: instanceId,
            weekId: weekKey,
            dayIndex: dayIdx,
            completed: newState,
            completionTime: newState ? new Date().toISOString() : null,
          })
          .catch((err) => console.error("Error marking completion:", err));
      }

      return {
        ...prev,
        [dayIdx]: {
          ...dayCompleted,
          [instanceId]: newState,
        },
      };
    });
  };

  const addInstanceViaDropZone = (templateId, dayIdx) => {
    const template = commitmentTemplates.find((t) => t.id === templateId);
    if (template) {
      addInstanceToDay(
        templateId,
        dayIdx,
        template.startTime,
        template.endTime,
      );
    }
  };

  // Export weekly program as JSON
  const exportWeeklyProgram = () => {
    const weekKey = getWeekKey(currentWeekStart);
    const exportData = {
      weekStart: currentWeekStart.toISOString().split("T")[0],
      weekKey: weekKey,
      templates: commitmentTemplates,
      instances: dayInstances,
      dayProperties: dayProperties,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule-${weekKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import weekly program from JSON
  const importWeeklyProgram = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate structure
        if (!importedData.templates || !importedData.instances) {
          toast.error(
            "Invalid file format. Please select a valid schedule export.",
          );
          return;
        }

        // Update state with imported data
        setCommitmentTemplates(importedData.templates || []);
        setDayInstances(importedData.instances || {});
        setDayProperties(importedData.dayProperties || {});

        // Save to localStorage
        localStorage.setItem(
          userKey("commitment-templates"),
          JSON.stringify(importedData.templates),
        );
        const weekKey =
          importedData.weekKey || getWeekKey(new Date(importedData.weekStart));
        localStorage.setItem(
          userKey(`week-instances-${weekKey}`),
          JSON.stringify(importedData.instances),
        );
        localStorage.setItem(
          userKey(`week-dayprops-${weekKey}`),
          JSON.stringify(importedData.dayProperties),
        );

        toast.success("Schedule imported successfully!");
      } catch (error) {
        toast.error("Error reading file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Handle loading schedule data
  const handleLoadScheduleData = (data) => {
    setCommitmentTemplates(data.templates || []);
    setDayInstances(data.instances || {});
    setDayProperties(data.dayProperties || {});

    // Save to localStorage
    localStorage.setItem(
      userKey("commitment-templates"),
      JSON.stringify(data.templates),
    );
    const weekKey = data.weekKey || getWeekKey(new Date(data.weekStart));
    localStorage.setItem(
      userKey(`week-instances-${weekKey}`),
      JSON.stringify(data.instances),
    );
    localStorage.setItem(
      userKey(`week-dayprops-${weekKey}`),
      JSON.stringify(data.dayProperties),
    );
  };

  // Current schedule data for saving
  const currentScheduleData = {
    weekStart: currentWeekStart.toISOString().split("T")[0],
    weekKey: getWeekKey(currentWeekStart),
    templates: commitmentTemplates,
    instances: dayInstances,
    dayProperties: dayProperties,
    exportedAt: new Date().toISOString(),
  };

  // ─── Export training programs ───
  const exportTrainingPrograms = () => {
    try {
      const saved = localStorage.getItem(userKey("training-programs"));
      const programs = saved ? JSON.parse(saved) : [];
      if (!programs.length)
        return toast.warning("No training programs to export.");
      const blob = new Blob(
        [
          JSON.stringify(
            {
              type: "training-programs",
              data: programs,
              exportedAt: new Date().toISOString(),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "training-programs.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Error exporting training programs: " + e.message);
    }
  };

  // ─── Import training programs ───
  const importTrainingPrograms = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const programs = parsed.data || parsed;
        if (!Array.isArray(programs))
          return toast.error("Invalid training programs file.");
        localStorage.setItem(
          userKey("training-programs"),
          JSON.stringify(programs),
        );
        toast.success(
          `Imported ${programs.length} training program(s)! Revisit Training Studio to see them.`,
        );
      } catch (err) {
        toast.error("Error reading file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ─── Export content plans ───
  const exportContentPlans = () => {
    try {
      const saved = localStorage.getItem(userKey("content-plans"));
      const plans = saved ? JSON.parse(saved) : [];
      if (!plans.length) return toast.warning("No content plans to export.");
      const blob = new Blob(
        [
          JSON.stringify(
            {
              type: "content-plans",
              data: plans,
              exportedAt: new Date().toISOString(),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "content-plans.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Error exporting content plans: " + e.message);
    }
  };

  // ─── Import content plans ───
  const importContentPlans = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const plans = parsed.data || parsed;
        if (!Array.isArray(plans))
          return toast.error("Invalid content plans file.");
        localStorage.setItem(userKey("content-plans"), JSON.stringify(plans));
        toast.success(
          `Imported ${plans.length} content plan(s)! Revisit Content Studio to see them.`,
        );
      } catch (err) {
        toast.error("Error reading file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ─── Export templates only ───
  const exportTemplates = () => {
    if (!commitmentTemplates.length)
      return toast.warning("No templates to export.");
    const blob = new Blob(
      [
        JSON.stringify(
          {
            type: "templates",
            data: commitmentTemplates,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commitment-templates.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Import templates only ───
  const importTemplates = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const templates = parsed.data || parsed;
        if (!Array.isArray(templates))
          return toast.error("Invalid templates file.");
        setCommitmentTemplates((prev) => {
          const merged = [...prev];
          templates.forEach((t) => {
            if (!merged.some((m) => String(m.id) === String(t.id)))
              merged.push(t);
          });
          return merged;
        });
        toast.success(`Imported ${templates.length} template(s)!`);
      } catch (err) {
        toast.error("Error reading file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ─── Full backup (everything) ───
  const exportFullBackup = () => {
    try {
      const backup = {
        type: "full-backup",
        schedule: currentScheduleData,
        trainingPrograms: JSON.parse(
          localStorage.getItem(userKey("training-programs")) || "[]",
        ),
        contentPlans: JSON.parse(
          localStorage.getItem(userKey("content-plans")) || "[]",
        ),
        bodyTracking: JSON.parse(
          localStorage.getItem(userKey("body-measurements")) || "[]",
        ),
        trainingLog: JSON.parse(
          localStorage.getItem(userKey("training-log")) || "[]",
        ),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lifestyle-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Error creating backup: " + e.message);
    }
  };

  // ─── Import full backup ───
  const importFullBackup = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.type !== "full-backup") {
          toast.error(
            "Invalid backup file. Please select a full backup export.",
          );
          return;
        }
        toast.confirm(
          "This will overwrite your current data. Continue?",
          () => {
            // Schedule
            if (backup.schedule) {
              setCommitmentTemplates(backup.schedule.templates || []);
              setDayInstances(backup.schedule.instances || {});
              setDayProperties(backup.schedule.dayProperties || {});
              localStorage.setItem(
                userKey("commitment-templates"),
                JSON.stringify(backup.schedule.templates || []),
              );
              const wk =
                backup.schedule.weekKey || getWeekKey(currentWeekStart);
              localStorage.setItem(
                userKey(`week-instances-${wk}`),
                JSON.stringify(backup.schedule.instances || {}),
              );
              localStorage.setItem(
                userKey(`week-dayprops-${wk}`),
                JSON.stringify(backup.schedule.dayProperties || {}),
              );
            }
            // Training
            if (backup.trainingPrograms)
              localStorage.setItem(
                userKey("training-programs"),
                JSON.stringify(backup.trainingPrograms),
              );
            if (backup.trainingLog)
              localStorage.setItem(
                userKey("training-log"),
                JSON.stringify(backup.trainingLog),
              );
            // Content
            if (backup.contentPlans)
              localStorage.setItem(
                userKey("content-plans"),
                JSON.stringify(backup.contentPlans),
              );
            // Body
            if (backup.bodyTracking)
              localStorage.setItem(
                userKey("body-measurements"),
                JSON.stringify(backup.bodyTracking),
              );

            toast.success("Full backup restored! Refresh to see all changes.");
          },
        );
      } catch (err) {
        toast.error("Error restoring backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ─── Trigger file input helper ───
  const triggerFileInput = (acceptCb) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = (e) => {
      if (e.target.files[0]) acceptCb(e.target.files[0]);
    };
    input.click();
  };

  // ─── Download helper ───
  const downloadFile = (content, filename, type = "application/json") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── CSV helpers ───
  const escapeCSV = (val) => {
    const s = String(val ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const arrayToCSV = (headers, rows) => {
    const lines = [headers.map(escapeCSV).join(",")];
    rows.forEach((row) => lines.push(row.map(escapeCSV).join(",")));
    return lines.join("\n");
  };

  // ─── PDF helper (generates printable HTML that triggers print dialog) ───
  const exportAsPDF = (title, htmlContent) => {
    const win = window.open("", "_blank");
    if (!win) return toast.warning("Please allow popups to export as PDF.");
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; }
        h1 { font-size: 22px; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; margin-bottom: 20px; }
        h2 { font-size: 16px; color: #475569; margin-top: 24px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700; }
        td { padding: 6px 12px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .metric { display: inline-block; padding: 12px 20px; margin: 4px; border-radius: 8px; background: #f1f5f9; text-align: center; }
        .metric .value { font-size: 28px; font-weight: 900; }
        .metric .label { font-size: 11px; text-transform: uppercase; color: #64748b; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>${title}</h1>
      ${htmlContent}
      <div class="footer">Exported from LifeStyle App — ${new Date().toLocaleString()}</div>
      <script>window.onload = function() { window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  // ─── Export Schedule as CSV ───
  const exportScheduleCSV = () => {
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const headers = [
      "Day",
      "Template",
      "Category",
      "Start",
      "End",
      "Completed",
    ];
    const rows = [];
    Object.keys(dayInstances).forEach((dayIdx) => {
      const insts = dayInstances[dayIdx] || [];
      insts.forEach((inst) => {
        const tpl = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(inst.templateId),
        );
        rows.push([
          DAYS[dayIdx] || `Day ${dayIdx}`,
          tpl?.name || inst.templateId || "",
          tpl?.category || "",
          inst.startTime || "",
          inst.endTime || "",
          completedInstances?.[dayIdx]?.[inst.id] ? "Yes" : "No",
        ]);
      });
    });
    if (!rows.length) return toast.warning("No schedule data to export.");
    downloadFile(
      arrayToCSV(headers, rows),
      `schedule-${getWeekKey(currentWeekStart)}.csv`,
      "text/csv",
    );
  };

  // ─── Export Schedule as PDF ───
  const exportSchedulePDF = () => {
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let html = `<h2>Week of ${currentWeekStart.toLocaleDateString()}</h2><table><tr><th>Day</th><th>Commitment</th><th>Category</th><th>Time</th><th>Status</th></tr>`;
    Object.keys(dayInstances).forEach((dayIdx) => {
      const insts = dayInstances[dayIdx] || [];
      insts.forEach((inst) => {
        const tpl = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(inst.templateId),
        );
        const done = completedInstances?.[dayIdx]?.[inst.id];
        html += `<tr><td>${DAYS[dayIdx] || "Day " + dayIdx}</td><td>${tpl?.name || inst.templateId || "—"}</td><td>${tpl?.category || "—"}</td><td>${inst.startTime || ""} – ${inst.endTime || ""}</td><td>${done ? "✅ Done" : "⬜ Pending"}</td></tr>`;
      });
    });
    html += "</table>";
    exportAsPDF("Weekly Schedule", html);
  };

  // ─── Export Statistics as CSV ───
  const exportStatsCSV = () => {
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const headers = ["Day", "Total Tasks", "Completed", "Completion %"];
    const rows = [];
    let totalAll = 0,
      completedAll = 0;
    DAYS.forEach((name, idx) => {
      const insts = dayInstances[idx] || [];
      const total = insts.length;
      const completed = insts.filter(
        (i) => completedInstances?.[idx]?.[i.id],
      ).length;
      totalAll += total;
      completedAll += completed;
      rows.push([
        name,
        total,
        completed,
        total > 0 ? Math.round((completed / total) * 100) + "%" : "—",
      ]);
    });
    rows.push([
      "TOTAL",
      totalAll,
      completedAll,
      totalAll > 0 ? Math.round((completedAll / totalAll) * 100) + "%" : "—",
    ]);

    // Category breakdown
    const catRows = [];
    const catHeaders = ["Category", "Total", "Completed", "Rate"];
    const categories = {};
    Object.keys(dayInstances).forEach((dayIdx) => {
      (dayInstances[dayIdx] || []).forEach((inst) => {
        const tpl = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(inst.templateId),
        );
        const cat = tpl?.category || "uncategorized";
        if (!categories[cat]) categories[cat] = { total: 0, completed: 0 };
        categories[cat].total++;
        if (completedInstances?.[dayIdx]?.[inst.id])
          categories[cat].completed++;
      });
    });
    Object.entries(categories).forEach(([cat, data]) => {
      catRows.push([
        cat,
        data.total,
        data.completed,
        data.total > 0
          ? Math.round((data.completed / data.total) * 100) + "%"
          : "—",
      ]);
    });

    const csv =
      arrayToCSV(headers, rows) + "\n\n" + arrayToCSV(catHeaders, catRows);
    downloadFile(
      csv,
      `statistics-${getWeekKey(currentWeekStart)}.csv`,
      "text/csv",
    );
  };

  // ─── Export Statistics as PDF ───
  const exportStatsPDF = () => {
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let totalAll = 0,
      completedAll = 0;

    // Summary metrics
    let html = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px">`;
    DAYS.forEach((_, idx) => {
      const insts = dayInstances[idx] || [];
      totalAll += insts.length;
      completedAll += insts.filter(
        (i) => completedInstances?.[idx]?.[i.id],
      ).length;
    });
    const overallPct =
      totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;
    html += `<div class="metric"><div class="value">${overallPct}%</div><div class="label">Overall Completion</div></div>`;
    html += `<div class="metric"><div class="value">${totalAll}</div><div class="label">Total Tasks</div></div>`;
    html += `<div class="metric"><div class="value">${completedAll}</div><div class="label">Completed</div></div>`;
    html += `</div>`;

    // Daily table
    html += `<h2>Daily Breakdown</h2><table><tr><th>Day</th><th>Tasks</th><th>Completed</th><th>Rate</th></tr>`;
    DAYS.forEach((name, idx) => {
      const insts = dayInstances[idx] || [];
      const total = insts.length;
      const completed = insts.filter(
        (i) => completedInstances?.[idx]?.[i.id],
      ).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      html += `<tr><td>${name}</td><td>${total}</td><td>${completed}</td><td>${pct}%</td></tr>`;
    });
    html += "</table>";

    // Category table
    const categories = {};
    Object.keys(dayInstances).forEach((dayIdx) => {
      (dayInstances[dayIdx] || []).forEach((inst) => {
        const tpl = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(inst.templateId),
        );
        const cat = tpl?.category || "uncategorized";
        if (!categories[cat]) categories[cat] = { total: 0, completed: 0 };
        categories[cat].total++;
        if (completedInstances?.[dayIdx]?.[inst.id])
          categories[cat].completed++;
      });
    });
    if (Object.keys(categories).length > 0) {
      html += `<h2>Category Breakdown</h2><table><tr><th>Category</th><th>Total</th><th>Completed</th><th>Rate</th></tr>`;
      Object.entries(categories).forEach(([cat, d]) => {
        html += `<tr><td style="text-transform:capitalize">${cat}</td><td>${d.total}</td><td>${d.completed}</td><td>${d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0}%</td></tr>`;
      });
      html += "</table>";
    }

    // Training programs summary
    try {
      const programs = JSON.parse(
        localStorage.getItem(userKey("training-programs")) || "[]",
      );
      if (programs.length) {
        html += `<h2>Training Programs</h2><table><tr><th>Program</th><th>Days</th><th>Exercises</th></tr>`;
        programs.forEach((p) => {
          const exCount = (p.days || []).reduce(
            (sum, d) => sum + (d.exercises?.length || 0),
            0,
          );
          html += `<tr><td>${p.name || "—"}</td><td>${(p.days || []).length}</td><td>${exCount}</td></tr>`;
        });
        html += "</table>";
      }
    } catch (e) {}

    // Content plans summary
    try {
      const plans = JSON.parse(
        localStorage.getItem(userKey("content-plans")) || "[]",
      );
      if (plans.length) {
        html += `<h2>Content Plans</h2><table><tr><th>Plan</th><th>Items</th><th>Published</th></tr>`;
        plans.forEach((p) => {
          const pub = (p.items || []).filter(
            (i) => i.status === "published",
          ).length;
          html += `<tr><td>${p.name || "—"}</td><td>${(p.items || []).length}</td><td>${pub}</td></tr>`;
        });
        html += "</table>";
      }
    } catch (e) {}

    exportAsPDF("Performance & Statistics Report", html);
  };

  // ─── Export Training as CSV ───
  const exportTrainingCSV = () => {
    try {
      const programs = JSON.parse(
        localStorage.getItem(userKey("training-programs")) || "[]",
      );
      if (!programs.length)
        return toast.warning("No training programs to export.");
      const headers = [
        "Program",
        "Day Name",
        "Exercise",
        "Sets",
        "Reps",
        "Muscle Group",
      ];
      const rows = [];
      programs.forEach((prog) => {
        (prog.days || []).forEach((day) => {
          (day.exercises || []).forEach((ex) => {
            rows.push([
              prog.name || "",
              day.name || "",
              ex.name || "",
              ex.sets || "",
              ex.reps || "",
              ex.muscleGroup || "",
            ]);
          });
        });
      });
      downloadFile(
        arrayToCSV(headers, rows),
        "training-programs.csv",
        "text/csv",
      );
    } catch (e) {
      toast.error("Error: " + e.message);
    }
  };

  // ─── Export Content Plans as CSV ───
  const exportContentCSV = () => {
    try {
      const plans = JSON.parse(
        localStorage.getItem(userKey("content-plans")) || "[]",
      );
      if (!plans.length) return toast.warning("No content plans to export.");
      const headers = [
        "Plan",
        "Day",
        "Title",
        "Platform",
        "Type",
        "Status",
        "Start",
        "End",
      ];
      const rows = [];
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      plans.forEach((plan) => {
        (plan.items || []).forEach((item) => {
          rows.push([
            plan.name || "",
            dayNames[item.dayIndex % 7] || "",
            item.title || "",
            item.platform || "",
            item.contentType || "",
            item.status || "",
            item.startTime || "",
            item.endTime || "",
          ]);
        });
      });
      downloadFile(arrayToCSV(headers, rows), "content-plans.csv", "text/csv");
    } catch (e) {
      toast.error("Error: " + e.message);
    }
  };

  // ─── Export Templates as CSV ───
  const exportTemplatesCSV = () => {
    if (!commitmentTemplates.length)
      return toast.warning("No templates to export.");
    const headers = [
      "Name",
      "Description",
      "Category",
      "Priority",
      "Color",
      "Start Time",
      "End Time",
    ];
    const rows = commitmentTemplates.map((t) => [
      t.name || "",
      t.description || "",
      t.category || "",
      t.priority || "",
      t.color || "",
      t.startTime || "",
      t.endTime || "",
    ]);
    downloadFile(
      arrayToCSV(headers, rows),
      "commitment-templates.csv",
      "text/csv",
    );
  };

  return (
    <div className="flex h-screen transition-colors duration-300 bg-white dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown via toggle */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          templates={commitmentTemplates}
          dayInstances={dayInstances}
          onAddTemplate={() => {
            openAddTemplateModal();
            setSidebarOpen(false);
          }}
          onEditTemplate={(id) => {
            editTemplate(id);
            setSidebarOpen(false);
          }}
          onDeleteTemplate={deleteTemplate}
          onDragStart={(template) => setDraggedTemplate(template)}
        />
      </div>

      <div className="flex-1 overflow-y-auto w-full bg-white dark:bg-slate-950">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-start gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex-shrink-0"
              >
                <i className="fa-solid fa-bars text-lg"></i>
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl md:text-4xl font-black mb-0.5 sm:mb-2 text-slate-900 dark:text-white tracking-tighter uppercase truncate">
                  Weekly Schedule
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => changeWeek(-1)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-400 dark:text-slate-500"
                    title="Previous Week"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm font-medium whitespace-nowrap">
                    {weekDateRange}
                  </p>
                  <button
                    onClick={() => changeWeek(1)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-400 dark:text-slate-500"
                    title="Next Week"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 items-center flex-shrink-0">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-300 hover:bg-slate-200 dark:hover:bg-slate-200 transition text-sm text-slate-900 dark:text-slate-900 border border-slate-200 dark:border-transparent"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <i className="fa-solid fa-sun"></i>
                ) : (
                  <i className="fa-solid fa-moon"></i>
                )}
              </button>

              {/* Search button */}
              <GlobalSearch
                commitmentTemplates={commitmentTemplates}
                userId={userId}
                onNavigate={(view) => setCurrentView(view)}
              />

              {/* Profile button */}
              <button
                onClick={() => setShowProfile(true)}
                className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title="Profile"
              >
                <i className="fa-solid fa-user"></i>
              </button>

              {/* Three-dot options menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  title="Options"
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>

                {showOptionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOptionsMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-[300px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                      {/* ── EXPORT ── */}
                      <div className="px-3 pt-3 pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Export
                        </span>
                      </div>

                      {/* Schedule */}
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                        Schedule
                      </div>
                      <div className="flex px-4 gap-1.5 pb-1">
                        <button
                          onClick={() => {
                            exportWeeklyProgram();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-code text-[10px]"></i> JSON
                        </button>
                        <button
                          onClick={() => {
                            exportScheduleCSV();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-table text-[10px]"></i> CSV
                        </button>
                        <button
                          onClick={() => {
                            exportSchedulePDF();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-file-pdf text-[10px]"></i>{" "}
                          PDF
                        </button>
                      </div>

                      {/* Templates */}
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                        Templates
                      </div>
                      <div className="flex px-4 gap-1.5 pb-1">
                        <button
                          onClick={() => {
                            exportTemplates();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-code text-[10px]"></i> JSON
                        </button>
                        <button
                          onClick={() => {
                            exportTemplatesCSV();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-table text-[10px]"></i> CSV
                        </button>
                      </div>

                      {/* Training */}
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                        Training Programs
                      </div>
                      <div className="flex px-4 gap-1.5 pb-1">
                        <button
                          onClick={() => {
                            exportTrainingPrograms();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-code text-[10px]"></i> JSON
                        </button>
                        <button
                          onClick={() => {
                            exportTrainingCSV();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-table text-[10px]"></i> CSV
                        </button>
                      </div>

                      {/* Content */}
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                        Content Plans
                      </div>
                      <div className="flex px-4 gap-1.5 pb-1">
                        <button
                          onClick={() => {
                            exportContentPlans();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-code text-[10px]"></i> JSON
                        </button>
                        <button
                          onClick={() => {
                            exportContentCSV();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-table text-[10px]"></i> CSV
                        </button>
                      </div>

                      {/* Statistics */}
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                        Statistics Report
                      </div>
                      <div className="flex px-4 gap-1.5 pb-1">
                        <button
                          onClick={() => {
                            exportStatsCSV();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-table text-[10px]"></i> CSV
                        </button>
                        <button
                          onClick={() => {
                            exportStatsPDF();
                            setShowOptionsMenu(false);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-file-pdf text-[10px]"></i>{" "}
                          PDF
                        </button>
                      </div>

                      {/* Full Backup */}
                      <div className="px-4 pt-1 pb-1">
                        <button
                          onClick={() => {
                            exportFullBackup();
                            setShowOptionsMenu(false);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 transition flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-cloud-arrow-down"></i> Full
                          Backup (All Data · JSON)
                        </button>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                      {/* ── IMPORT ── */}
                      <div className="px-3 pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Import
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          triggerFileInput(importWeeklyProgram);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-calendar-week text-blue-500 w-4 text-center"></i>
                        Weekly Schedule
                        <span className="ml-auto text-xs text-slate-400">
                          JSON
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          triggerFileInput(importTemplates);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-shapes text-purple-500 w-4 text-center"></i>
                        Commitment Templates
                        <span className="ml-auto text-xs text-slate-400">
                          JSON
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          triggerFileInput(importTrainingPrograms);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-dumbbell text-orange-500 w-4 text-center"></i>
                        Training Programs
                        <span className="ml-auto text-xs text-slate-400">
                          JSON
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          triggerFileInput(importContentPlans);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-video text-pink-500 w-4 text-center"></i>
                        Content Plans
                        <span className="ml-auto text-xs text-slate-400">
                          JSON
                        </span>
                      </button>
                      <div className="px-4 pb-1 pt-1">
                        <button
                          onClick={() => {
                            triggerFileInput(importFullBackup);
                            setShowOptionsMenu(false);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 transition flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-cloud-arrow-up"></i> Restore
                          Full Backup
                        </button>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                      {/* ── TOOLS ── */}
                      <div className="px-3 pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Tools
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowStorageManager(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-folder text-amber-500 w-4 text-center"></i>
                        Schedule Library
                      </button>
                      <button
                        onClick={() => {
                          setShowTemplateManager(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i className="fa-solid fa-cogs text-slate-500 w-4 text-center"></i>
                        Manage Templates
                      </button>
                      <button
                        onClick={() => {
                          clearWeekSchedule();
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 text-red-500 dark:text-red-400 transition"
                      >
                        <i className="fa-solid fa-broom text-red-400 w-4 text-center"></i>
                        Clear Week Schedule
                      </button>
                      <button
                        onClick={() => {
                          setRecurringEnabled(!recurringEnabled);
                          localStorage.setItem(
                            userKey("recurring-enabled"),
                            JSON.stringify(!recurringEnabled),
                          );
                          toast.info(
                            recurringEnabled
                              ? "Recurring schedule disabled"
                              : "Recurring schedule enabled — empty weeks will copy from the previous week",
                          );
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 transition"
                      >
                        <i
                          className={`fa-solid fa-repeat w-4 text-center ${recurringEnabled ? "text-green-500" : "text-slate-400"}`}
                        ></i>
                        Repeat Weekly
                        {recurringEnabled && (
                          <span className="ml-auto text-[10px] text-green-500 font-bold">
                            ON
                          </span>
                        )}
                      </button>

                      <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                      <button
                        onClick={() => {
                          onSignOut();
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 text-red-500 transition mb-1"
                      >
                        <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>
                        Sign Out
                        <span className="ml-auto text-xs text-slate-400 truncate max-w-[120px]">
                          {session?.user?.email}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-4 sm:mb-8 flex gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-3 sm:pb-4 overflow-x-auto no-scrollbar">
            {[
              { key: "timetable", icon: "fa-clock", label: "Timetable" },
              { key: "training", icon: "fa-dumbbell", label: "Training" },
              { key: "content", icon: "fa-video", label: "Content" },
              { key: "stats", icon: "fa-chart-line", label: "Stats" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentView(tab.key)}
                className={`px-3 sm:px-4 py-2 rounded border transition text-sm whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
                  currentView === tab.key
                    ? "bg-blue-600 dark:bg-slate-300 border-blue-600 dark:border-slate-400 text-white dark:text-slate-900"
                    : "border-slate-300 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* VIEW: TIMETABLE */}
          {currentView === "timetable" && (
            <>
              {/* Onboarding Guide for new users */}
              <OnboardingGuide
                commitmentTemplates={commitmentTemplates}
                dayInstances={dayInstances}
                completedInstances={completedInstances}
                onCreateTemplate={openAddTemplateModal}
              />

              {/* Reminders */}
              <ReminderSystem
                dayInstances={dayInstances}
                commitmentTemplates={commitmentTemplates}
                currentWeekStart={currentWeekStart}
              />

              {/* Weekly Calendar */}
              <WeeklyCalendar
                dayInstances={dayInstances}
                commitmentTemplates={commitmentTemplates}
                dayProperties={dayProperties}
                completedInstances={completedInstances}
                currentWeekStart={currentWeekStart}
                onUpdateDayProperty={updateDayProperty}
                onAddInstance={addInstanceToDay}
                onRemoveInstance={removeInstanceFromDay}
                onToggleCompletion={toggleCompletion}
                onUpdateInstanceTiming={(dayIdx, instanceId, start, end) => {
                  setTimingUpdateContext({
                    dayIdx,
                    instanceId,
                    currentStart: start,
                    currentEnd: end,
                  });
                  setShowTimingUpdateModal(true);
                }}
                onDropZone={addInstanceViaDropZone}
                draggedTemplate={draggedTemplate}
                onOpenDayView={(dayIdx) => setSelectedDayIdx(dayIdx)}
              />

              {/* Goals Panel */}
              <GoalsPanel
                dayInstances={dayInstances}
                completedInstances={completedInstances}
                commitmentTemplates={commitmentTemplates}
                userId={userId}
                toast={toast}
              />

              {/* Dashboard */}
              <Dashboard
                dayInstances={dayInstances}
                commitmentTemplates={commitmentTemplates}
                completedInstances={completedInstances}
                onEditTemplate={editTemplate}
              />
            </>
          )}

          {/* VIEW: TRAINING */}
          {currentView === "training" && (
            <TrainingView
              commitmentTemplates={commitmentTemplates}
              dayInstances={dayInstances}
              completedInstances={completedInstances}
              userId={userId}
              onCreateCommitment={(template) => {
                setCommitmentTemplates((prev) => {
                  // Avoid duplicates
                  if (prev.some((t) => String(t.id) === String(template.id))) {
                    return prev;
                  }
                  return [...prev, template];
                });
              }}
              onApplyToSchedule={(instances) => {
                instances.forEach((inst) => {
                  addInstanceToDay(
                    inst.templateId,
                    inst.dayIndex,
                    inst.startTime,
                    inst.endTime,
                  );
                });
              }}
            />
          )}

          {/* VIEW: CONTENT */}
          {currentView === "content" && (
            <ContentView
              commitmentTemplates={commitmentTemplates}
              userId={userId}
              onCreateCommitment={(template) => {
                setCommitmentTemplates((prev) => {
                  if (prev.some((t) => String(t.id) === String(template.id))) {
                    return prev;
                  }
                  return [...prev, template];
                });
              }}
              onApplyContentPlan={(instances) => {
                instances.forEach((inst) => {
                  addInstanceToDay(
                    inst.templateId,
                    inst.dayIndex,
                    inst.startTime,
                    inst.endTime,
                  );
                });
              }}
            />
          )}

          {/* VIEW: STATS */}
          {currentView === "stats" && (
            <>
              <StatsView
                dayInstances={dayInstances}
                completedInstances={completedInstances}
                commitmentTemplates={commitmentTemplates}
                userId={userId}
              />

              {/* Habit Streaks */}
              <HabitStreaks
                dayInstances={dayInstances}
                completedInstances={completedInstances}
                commitmentTemplates={commitmentTemplates}
                userId={userId}
              />
            </>
          )}
        </div>
      </div>

      {/* Template Modal */}

      {/* Profile Panel — Horizontal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Compact Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl font-black text-white">
                    {(session?.user?.email?.[0] || "U").toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                    <i className="fa-solid fa-user-circle mr-1.5 sm:mr-2"></i>
                    Profile
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/70 truncate max-w-[150px] sm:max-w-[250px]">
                    {session?.user?.email || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onSignOut();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold transition"
                >
                  <i className="fa-solid fa-right-from-bracket mr-1"></i>Sign
                  Out
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-white/70 hover:text-white text-lg transition p-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Horizontal Body */}
            <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Column 1: Account Info */}
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">
                    <i className="fa-solid fa-shield-halved mr-1"></i>Account
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Provider
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {session?.user?.app_metadata?.provider || "email"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Joined
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {session?.user?.created_at
                          ? new Date(
                              session.user.created_at,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Last Sign In
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {session?.user?.last_sign_in_at
                          ? new Date(
                              session.user.last_sign_in_at,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Verified
                      </span>
                      <span
                        className={`font-medium ${session?.user?.email_confirmed_at ? "text-green-600 dark:text-green-400" : "text-orange-500"}`}
                      >
                        {session?.user?.email_confirmed_at
                          ? "✓ Yes"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">
                    <i className="fa-solid fa-fingerprint mr-1"></i>User ID
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all">
                    {session?.user?.id || "—"}
                  </p>
                </div>
              </div>

              {/* Column 2: Commitment Journey */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase text-blue-500 dark:text-blue-400 tracking-widest mb-3">
                  <i className="fa-solid fa-fire mr-1"></i>Commitment Journey
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {(() => {
                        const joined = session?.user?.created_at;
                        if (!joined) return "—";
                        return Math.floor(
                          (Date.now() - new Date(joined).getTime()) / 86400000,
                        );
                      })()}
                    </p>
                    <p className="text-[10px] text-blue-400 dark:text-blue-500 font-bold uppercase">
                      Days Committed
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      since{" "}
                      {session?.user?.created_at
                        ? new Date(session.user.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">
                      {(() => {
                        const totalScheduled = Object.values(
                          dayInstances,
                        ).reduce(
                          (sum, arr) =>
                            sum + (Array.isArray(arr) ? arr.length : 0),
                          0,
                        );
                        const totalCompleted = Object.values(
                          completedInstances,
                        ).reduce((sum, day) => {
                          if (typeof day === "object" && day !== null)
                            return (
                              sum + Object.values(day).filter(Boolean).length
                            );
                          return sum + (day ? 1 : 0);
                        }, 0);
                        return totalScheduled > 0
                          ? Math.round((totalCompleted / totalScheduled) * 100)
                          : 0;
                      })()}
                      %
                    </p>
                    <p className="text-[10px] text-green-500 font-bold uppercase">
                      Completion Rate
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      this week
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Data Stats */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3">
                  <i className="fa-solid fa-chart-pie mr-1"></i>Your Data
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                      {commitmentTemplates.length}
                    </p>
                    <p className="text-[10px] text-slate-400">Templates</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                      {Object.values(dayInstances).reduce(
                        (sum, arr) =>
                          sum + (Array.isArray(arr) ? arr.length : 0),
                        0,
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">Scheduled</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xl font-black text-green-600 dark:text-green-400">
                      {Object.values(completedInstances).reduce((sum, day) => {
                        if (typeof day === "object" && day !== null)
                          return (
                            sum + Object.values(day).filter(Boolean).length
                          );
                        return sum + (day ? 1 : 0);
                      }, 0)}
                    </p>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                      {
                        commitmentTemplates.filter(
                          (t) => t.category === "training",
                        ).length
                      }
                    </p>
                    <p className="text-[10px] text-slate-400">Training</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommitmentTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplateId(null);
        }}
        onSave={saveTemplate}
        onDelete={() => {
          if (editingTemplateId) {
            deleteTemplate(editingTemplateId);
          }
        }}
        editingTemplate={editingTemplate}
        colors={COLORS}
      />

      {/* Timing Update Modal */}
      {showTimingUpdateModal && timingUpdateContext && (
        <TimingUpdateModal
          onClose={() => {
            setShowTimingUpdateModal(false);
            setTimingUpdateContext(null);
          }}
          onSave={(startTime, endTime, updateAll) => {
            updateInstanceTiming(
              timingUpdateContext.dayIdx,
              timingUpdateContext.instanceId,
              startTime,
              endTime,
              updateAll,
            );
          }}
          currentStart={timingUpdateContext.currentStart}
          currentEnd={timingUpdateContext.currentEnd}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          onClose={() => setShowTemplateManager(false)}
          dayInstances={dayInstances}
          commitmentTemplates={commitmentTemplates}
          userId={userId}
        />
      )}

      {/* Storage Manager Modal */}
      <StorageManager
        isOpen={showStorageManager}
        onClose={() => setShowStorageManager(false)}
        onLoad={handleLoadScheduleData}
        scheduleData={currentScheduleData}
      />

      {/* Day View Modal */}
      {selectedDayIdx !== null && (
        <DayView
          dayIdx={selectedDayIdx}
          dayName={
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ][selectedDayIdx]
          }
          instances={dayInstances[selectedDayIdx] || []}
          dayNote={dayNotes[selectedDayIdx] || ""}
          isDayMarked={!!dayMarked[selectedDayIdx]}
          onClose={() => setSelectedDayIdx(null)}
          onToggleCompletion={toggleCompletion}
          onRemoveInstance={removeInstanceFromDay}
          onUpdateInstanceTiming={(dayIdx, instanceId, start, end) => {
            setSelectedDayIdx(null); // Close DayView to show timing modal
            setTimingUpdateContext({
              dayIdx,
              instanceId,
              currentStart: start,
              currentEnd: end,
            });
            setShowTimingUpdateModal(true);
          }}
          onAddNote={saveDayNote}
          onToggleDayStatus={() => toggleDayStatus(selectedDayIdx)}
        />
      )}
    </div>
  );
}

export default App;
