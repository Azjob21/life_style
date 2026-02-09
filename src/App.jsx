import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import WeeklyCalendar from "./components/WeeklyCalendar";
import Dashboard from "./components/Dashboard";
import CommitmentTemplateModal from "./components/CommitmentTemplateModal";
import TimingUpdateModal from "./components/TimingUpdateModal";
import TemplateManager from "./components/TemplateManager";
import StorageManager from "./components/StorageManager";
import WeekNavigator from "./components/WeekNavigator";

function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved ? saved === "dark" : true;
  });

  const [commitmentTemplates, setCommitmentTemplates] = useState([]);

  // Day instances - mapping of dayIndex -> array of instances
  const [dayInstances, setDayInstances] = useState({});

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

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showTimingUpdateModal, setShowTimingUpdateModal] = useState(false);
  const [timingUpdateContext, setTimingUpdateContext] = useState(null);
  const [weekDateRange, setWeekDateRange] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState(null);

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  // Theme persistence
  useEffect(() => {
    localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Load data from localStorage
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

  const loadData = () => {
    // Load templates (global)
    const savedTemplates = localStorage.getItem("commitment-templates");
    if (savedTemplates) {
      setCommitmentTemplates(JSON.parse(savedTemplates));
    }

    // Load week data
    const weekKey = getWeekKey(currentWeekStart);
    const savedInstances = localStorage.getItem(`week-instances-${weekKey}`);
    const savedDayProps = localStorage.getItem(`week-dayprops-${weekKey}`);

    if (savedInstances) {
      setDayInstances(JSON.parse(savedInstances));
    } else {
      setDayInstances({});
    }

    if (savedDayProps) {
      setDayProperties(JSON.parse(savedDayProps));
    }
  };

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem(
      "commitment-templates",
      JSON.stringify(commitmentTemplates),
    );
  }, [commitmentTemplates]);

  // Save week data to localStorage
  useEffect(() => {
    const weekKey = getWeekKey(currentWeekStart);
    localStorage.setItem(
      `week-instances-${weekKey}`,
      JSON.stringify(dayInstances),
    );
    localStorage.setItem(
      `week-dayprops-${weekKey}`,
      JSON.stringify(dayProperties),
    );
  }, [dayInstances, dayProperties, currentWeekStart]);

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
    if (confirm("Delete this commitment template?")) {
      setCommitmentTemplates(commitmentTemplates.filter((t) => t.id !== id));
      // Remove all instances of this template from days
      const newInstances = { ...dayInstances };
      Object.keys(newInstances).forEach((dayIdx) => {
        newInstances[dayIdx] = newInstances[dayIdx].filter(
          (inst) => inst.templateId !== id,
        );
      });
      setDayInstances(newInstances);
    }
  };

  const editingTemplate = editingTemplateId
    ? commitmentTemplates.find((t) => t.id === editingTemplateId)
    : null;

  // Day instance management
  const addInstanceToDay = (templateId, dayIdx, startTime, endTime) => {
    const newInstance = {
      id: `${templateId}-${dayIdx}-${Date.now()}`,
      templateId,
      startTime,
      endTime,
    };

    setDayInstances((prev) => ({
      ...prev,
      [dayIdx]: [...(prev[dayIdx] || []), newInstance],
    }));
  };

  const removeInstanceFromDay = (dayIdx, instanceId) => {
    setDayInstances((prev) => ({
      ...prev,
      [dayIdx]: prev[dayIdx].filter((inst) => inst.id !== instanceId),
    }));
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
          alert("Invalid file format. Please select a valid schedule export.");
          return;
        }

        // Update state with imported data
        setCommitmentTemplates(importedData.templates || []);
        setDayInstances(importedData.instances || {});
        setDayProperties(importedData.dayProperties || {});

        // Save to localStorage
        localStorage.setItem(
          "commitment-templates",
          JSON.stringify(importedData.templates),
        );
        const weekKey =
          importedData.weekKey || getWeekKey(new Date(importedData.weekStart));
        localStorage.setItem(
          `week-instances-${weekKey}`,
          JSON.stringify(importedData.instances),
        );
        localStorage.setItem(
          `week-dayprops-${weekKey}`,
          JSON.stringify(importedData.dayProperties),
        );

        alert("Schedule imported successfully!");
      } catch (error) {
        alert("Error reading file: " + error.message);
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
      "commitment-templates",
      JSON.stringify(data.templates),
    );
    const weekKey = data.weekKey || getWeekKey(new Date(data.weekStart));
    localStorage.setItem(
      `week-instances-${weekKey}`,
      JSON.stringify(data.instances),
    );
    localStorage.setItem(
      `week-dayprops-${weekKey}`,
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-50 dark:via-slate-100 dark:to-slate-50">
      <Sidebar
        templates={commitmentTemplates}
        onAddTemplate={openAddTemplateModal}
        onEditTemplate={editTemplate}
        onDeleteTemplate={deleteTemplate}
        onDragStart={(template) => setDraggedTemplate(template)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 text-slate-100 dark:text-slate-900">
                Weekly Schedule
              </h2>
              <p className="text-slate-400 dark:text-slate-600 text-sm">
                {weekDateRange}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-4 py-2 rounded bg-slate-700 dark:bg-slate-300 hover:bg-slate-600 dark:hover:bg-slate-200 transition text-sm text-slate-100 dark:text-slate-900"
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
              <button
                onClick={exportWeeklyProgram}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition text-sm text-white"
              >
                <i className="fa-solid fa-download mr-2"></i>Export
              </button>
              <label className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition text-sm text-white cursor-pointer">
                <i className="fa-solid fa-upload mr-2"></i>Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      importWeeklyProgram(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowStorageManager(true)}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 transition text-sm text-white"
              >
                <i className="fa-solid fa-folder mr-2"></i>Library
              </button>
              <button
                onClick={() => setShowTemplateManager(true)}
                className="px-4 py-2 rounded bg-slate-700 dark:bg-slate-300 hover:bg-slate-600 dark:hover:bg-slate-200 transition text-sm text-slate-100 dark:text-slate-900"
              >
                <i className="fa-solid fa-cogs mr-2"></i>Templates
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <WeekNavigator
            onPrevious={() => changeWeek(-1)}
            onToday={goToToday}
            onNext={() => changeWeek(1)}
          />

          {/* Weekly Calendar */}
          <WeeklyCalendar
            dayInstances={dayInstances}
            commitmentTemplates={commitmentTemplates}
            dayProperties={dayProperties}
            onUpdateDayProperty={updateDayProperty}
            onAddInstance={addInstanceToDay}
            onRemoveInstance={removeInstanceFromDay}
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
          />

          {/* Dashboard */}
          <Dashboard
            dayInstances={dayInstances}
            commitmentTemplates={commitmentTemplates}
            onEditTemplate={editTemplate}
          />
        </div>
      </div>

      {/* Template Modal */}
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
        />
      )}

      {/* Storage Manager Modal */}
      <StorageManager
        isOpen={showStorageManager}
        onClose={() => setShowStorageManager(false)}
        onLoad={handleLoadScheduleData}
        scheduleData={currentScheduleData}
      />
    </div>
  );
}

export default App;
