import React, { useState, useEffect } from "react";

// ─── Color palette for programs ───
const PROGRAM_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

// ─── Muscle group presets ───
const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Glutes",
  "Full Body",
  "Cardio",
];

const EXERCISE_PRESETS = {
  Chest: [
    "Bench Press",
    "Incline Dumbbell Press",
    "Cable Fly",
    "Push-ups",
    "Dips",
  ],
  Back: ["Lat Pulldown", "Barbell Row", "Seated Row", "Pull-ups", "Face Pull"],
  Shoulders: [
    "Shoulder Press",
    "Lateral Raises",
    "Front Raises",
    "Rear Delt Fly",
    "Arnold Press",
  ],
  Biceps: [
    "Dumbbell Curls",
    "Barbell Curls",
    "Hammer Curls",
    "Preacher Curls",
    "Concentration Curls",
  ],
  Triceps: [
    "Triceps Pushdown",
    "Skull Crushers",
    "Overhead Extension",
    "Close-grip Bench",
    "Tricep Dips",
  ],
  Legs: [
    "Squats",
    "Leg Press",
    "Romanian Deadlift",
    "Lunges",
    "Leg Curl",
    "Leg Extension",
    "Calf Raises",
  ],
  Core: [
    "Plank",
    "Hanging Knee Raises",
    "Cable Crunch",
    "Russian Twist",
    "Ab Rollout",
  ],
  Glutes: [
    "Hip Thrust",
    "Glute Bridge",
    "Sumo Deadlift",
    "Bulgarian Split Squat",
    "Cable Kickback",
  ],
  "Full Body": [
    "Deadlift",
    "Clean & Press",
    "Burpees",
    "Thrusters",
    "Kettlebell Swing",
  ],
  Cardio: ["Running", "Cycling", "Jump Rope", "Rowing", "Stair Climber"],
};

function TrainingView({
  commitmentTemplates,
  onCreateCommitment,
  dayInstances,
  completedInstances,
}) {
  // ─── State ───
  const [programs, setPrograms] = useState([]);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Physical tracking
  const [showPhysicalForm, setShowPhysicalForm] = useState(false);
  const [physicalLogs, setPhysicalLogs] = useState({});

  // Program builder state
  const [builderData, setBuilderData] = useState({
    name: "",
    type: "gym",
    color: PROGRAM_COLORS[4],
    daysPerWeek: 3,
    startTime: "08:00",
    endTime: "09:30",
    days: [],
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("training-programs");
      if (saved) setPrograms(JSON.parse(saved));
      const savedLogs = localStorage.getItem("physical-logs");
      if (savedLogs) setPhysicalLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error("Error loading training data:", e);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("training-programs", JSON.stringify(programs));
  }, [programs]);
  useEffect(() => {
    localStorage.setItem("physical-logs", JSON.stringify(physicalLogs));
  }, [physicalLogs]);

  // ═══════════════════════════════════════════════
  //  PROGRAM BUILDER
  // ═══════════════════════════════════════════════

  const openBuilder = (existing = null) => {
    if (existing) {
      setBuilderData({ ...existing });
      setEditingProgram(existing.id);
    } else {
      setBuilderData({
        name: "",
        type: "gym",
        color: PROGRAM_COLORS[4],
        daysPerWeek: 3,
        startTime: "08:00",
        endTime: "09:30",
        days: [],
      });
      setEditingProgram(null);
    }
    setShowProgramBuilder(true);
  };

  const addDayToProgram = () => {
    setBuilderData((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id: Date.now(),
          label: `Day ${prev.days.length + 1}`,
          muscleGroups: [],
          exercises: [],
        },
      ],
    }));
  };

  const removeDayFromProgram = (dayId) => {
    setBuilderData((prev) => ({
      ...prev,
      days: prev.days.filter((d) => d.id !== dayId),
    }));
  };

  const updateDay = (dayId, field, value) => {
    setBuilderData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId ? { ...d, [field]: value } : d,
      ),
    }));
  };

  const addExerciseToDay = (dayId) => {
    setBuilderData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                { id: Date.now(), name: "", sets: 3, reps: "10", rest: "60s" },
              ],
            }
          : d,
      ),
    }));
  };

  const updateExercise = (dayId, exId, field, value) => {
    setBuilderData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.id === exId ? { ...ex, [field]: value } : ex,
              ),
            }
          : d,
      ),
    }));
  };

  const removeExercise = (dayId, exId) => {
    setBuilderData((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) }
          : d,
      ),
    }));
  };

  const saveProgram = () => {
    if (!builderData.name.trim()) return alert("Enter a program name");
    if (builderData.days.length === 0)
      return alert("Add at least one training day");

    const program = {
      ...builderData,
      id: editingProgram || Date.now(),
      createdAt: editingProgram
        ? programs.find((p) => p.id === editingProgram)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingProgram) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === editingProgram ? program : p)),
      );
    } else {
      setPrograms((prev) => [...prev, program]);
    }

    // Auto-create commitment templates for each day
    if (onCreateCommitment) {
      program.days.forEach((day, idx) => {
        const exerciseList = day.exercises
          .map((ex) => `• ${ex.name} → ${ex.sets}×${ex.reps}`)
          .join("\n");
        const description = `🏋️ ${program.name} — ${day.label}\n${(day.muscleGroups || []).join(", ")}\n\n${exerciseList}`;
        const templateId = `training-${program.id}-day-${idx}`;

        // Check if template already exists
        const exists = (commitmentTemplates || []).find(
          (t) => String(t.id) === String(templateId),
        );
        if (!exists) {
          onCreateCommitment({
            id: templateId,
            name: `🏋️ ${program.name} — ${day.label}`,
            description,
            color: program.color,
            priority: "high",
            startTime: program.startTime,
            endTime: program.endTime,
            category: "training",
            icon: program.type === "gym" ? "fa-dumbbell" : "fa-person-running",
            sourceProgram: program.id,
          });
        }
      });
    }

    setShowProgramBuilder(false);
    setEditingProgram(null);
  };

  const deleteProgram = (programId) => {
    if (!confirm("Delete this program and its commitment templates?")) return;
    setPrograms((prev) => prev.filter((p) => p.id !== programId));
    if (selectedProgram?.id === programId) setSelectedProgram(null);
  };

  // ═══════════════════════════════════════════════
  //  PHYSICAL TRACKING
  // ═══════════════════════════════════════════════

  const [physForm, setPhysForm] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    arms: "",
    thighs: "",
    notes: "",
  });

  const savePhysicalEntry = () => {
    if (!selectedProgram) return;
    const weekKey = new Date().toISOString().split("T")[0];
    const entry = {
      ...physForm,
      date: weekKey,
      timestamp: Date.now(),
      programId: selectedProgram.id,
    };
    setPhysicalLogs((prev) => ({
      ...prev,
      [selectedProgram.id]: [...(prev[selectedProgram.id] || []), entry],
    }));
    setPhysForm({
      weight: "",
      bodyFat: "",
      chest: "",
      waist: "",
      arms: "",
      thighs: "",
      notes: "",
    });
    setShowPhysicalForm(false);
  };

  // ═══════════════════════════════════════════════
  //  RENDER — PROGRAM LIST
  // ═══════════════════════════════════════════════

  if (!showProgramBuilder && !selectedProgram) {
    return (
      <div className="pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <i className="fa-solid fa-dumbbell text-red-500"></i>
              Training Studio
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Build programs, track progress, transform your body
            </p>
          </div>
          <button
            onClick={() => openBuilder()}
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            New Program
          </button>
        </div>

        {programs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <i className="fa-solid fa-dumbbell text-5xl text-slate-300 dark:text-slate-700 mb-4"></i>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No Programs Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Create your first training program. Each program day automatically
              becomes a commitment template you can drag into your weekly
              schedule.
            </p>
            <button
              onClick={() => openBuilder()}
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition"
            >
              <i className="fa-solid fa-plus mr-2"></i>Create Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="glass-card p-5 cursor-pointer hover:shadow-lg transition group"
                onClick={() => setSelectedProgram(prog)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ background: prog.color }}
                    >
                      <i
                        className={`fa-solid ${prog.type === "gym" ? "fa-dumbbell" : prog.type === "calisthenics" ? "fa-person-running" : prog.type === "cardio" ? "fa-heart-pulse" : "fa-bolt"}`}
                      ></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {prog.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {prog.days.length} day
                        {prog.days.length !== 1 ? "s" : ""} •{" "}
                        {prog.type.charAt(0).toUpperCase() + prog.type.slice(1)}{" "}
                        • {prog.startTime}–{prog.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBuilder(prog);
                      }}
                      className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProgram(prog.id);
                      }}
                      className="p-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
                {/* Day chips */}
                <div className="flex flex-wrap gap-1.5">
                  {prog.days.map((day, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: `${prog.color}20`,
                        color: prog.color,
                      }}
                    >
                      {day.label}: {(day.muscleGroups || []).join(", ") || "—"}
                    </span>
                  ))}
                </div>
                {/* Physical log count */}
                {(physicalLogs[prog.id]?.length || 0) > 0 && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <i className="fa-solid fa-ruler-combined"></i>
                    {physicalLogs[prog.id].length} body measurement
                    {physicalLogs[prog.id].length !== 1 ? "s" : ""} recorded
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  //  RENDER — PROGRAM BUILDER
  // ═══════════════════════════════════════════════

  if (showProgramBuilder) {
    return (
      <div className="pb-20 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              setShowProgramBuilder(false);
              setEditingProgram(null);
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            {editingProgram ? "Edit Program" : "New Program"}
          </h2>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                Program Name *
              </label>
              <input
                type="text"
                value={builderData.name}
                onChange={(e) =>
                  setBuilderData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Push Pull Legs"
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                Type
              </label>
              <select
                value={builderData.type}
                onChange={(e) =>
                  setBuilderData((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
              >
                <option value="gym">🏋️ Gym / Weights</option>
                <option value="calisthenics">🤸 Calisthenics</option>
                <option value="hybrid">⚡ Hybrid</option>
                <option value="cardio">🏃 Cardio</option>
              </select>
            </div>
          </div>

          {/* Time & Color */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                Start Time
              </label>
              <input
                type="time"
                value={builderData.startTime}
                onChange={(e) =>
                  setBuilderData((p) => ({ ...p, startTime: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                End Time
              </label>
              <input
                type="time"
                value={builderData.endTime}
                onChange={(e) =>
                  setBuilderData((p) => ({ ...p, endTime: e.target.value }))
                }
                className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider">
                Color
              </label>
              <div className="flex gap-2">
                {PROGRAM_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBuilderData((p) => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-lg transition ${
                      builderData.color === c
                        ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900"
                        : "hover:scale-110"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Training Days */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Training Days
              </label>
              <button
                onClick={addDayToProgram}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                <i className="fa-solid fa-plus mr-1"></i>Add Day
              </button>
            </div>

            {builderData.days.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-4">
                Add training days to your program
              </p>
            )}

            <div className="space-y-4">
              {builderData.days.map((day, dayIdx) => (
                <div
                  key={day.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={day.label}
                      onChange={(e) =>
                        updateDay(day.id, "label", e.target.value)
                      }
                      className="bg-transparent font-bold text-slate-900 dark:text-white text-sm border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none px-1 py-0.5"
                    />
                    <button
                      onClick={() => removeDayFromProgram(day.id)}
                      className="text-red-400 hover:text-red-300 text-xs p-1"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>

                  {/* Muscle group tags */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 mb-1.5 block">
                      Muscle Groups
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_GROUPS.map((mg) => (
                        <button
                          key={mg}
                          onClick={() => {
                            const current = day.muscleGroups || [];
                            const updated = current.includes(mg)
                              ? current.filter((g) => g !== mg)
                              : [...current, mg];
                            updateDay(day.id, "muscleGroups", updated);
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                            (day.muscleGroups || []).includes(mg)
                              ? "text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600"
                          }`}
                          style={
                            (day.muscleGroups || []).includes(mg)
                              ? { background: builderData.color }
                              : {}
                          }
                        >
                          {mg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercises */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-slate-400">
                        Exercises
                      </label>
                      <button
                        onClick={() => addExerciseToDay(day.id)}
                        className="text-xs text-blue-500 hover:text-blue-400 font-medium"
                      >
                        <i className="fa-solid fa-plus mr-1"></i>Add Exercise
                      </button>
                    </div>

                    {/* Quick-add from muscle group presets */}
                    {(day.muscleGroups || []).length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {day.muscleGroups
                          .flatMap((mg) => EXERCISE_PRESETS[mg] || [])
                          .filter(
                            (ex, i, arr) =>
                              arr.indexOf(ex) === i &&
                              !day.exercises.some((e) => e.name === ex),
                          )
                          .slice(0, 8)
                          .map((preset) => (
                            <button
                              key={preset}
                              onClick={() => {
                                setBuilderData((prev) => ({
                                  ...prev,
                                  days: prev.days.map((d) =>
                                    d.id === day.id
                                      ? {
                                          ...d,
                                          exercises: [
                                            ...d.exercises,
                                            {
                                              id: Date.now() + Math.random(),
                                              name: preset,
                                              sets: 3,
                                              reps: "10",
                                              rest: "60s",
                                            },
                                          ],
                                        }
                                      : d,
                                  ),
                                }));
                              }}
                              className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                            >
                              + {preset}
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      {day.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center gap-2 bg-white dark:bg-slate-900/50 rounded-lg p-2 border border-slate-200 dark:border-slate-600"
                        >
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) =>
                              updateExercise(
                                day.id,
                                ex.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="Exercise name"
                            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none min-w-0"
                          />
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) =>
                              updateExercise(
                                day.id,
                                ex.id,
                                "sets",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-12 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-xs text-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                            title="Sets"
                          />
                          <span className="text-slate-400 text-xs">×</span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) =>
                              updateExercise(
                                day.id,
                                ex.id,
                                "reps",
                                e.target.value,
                              )
                            }
                            className="w-16 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-xs text-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                            placeholder="reps"
                            title="Reps"
                          />
                          <button
                            onClick={() => removeExercise(day.id, ex.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <i className="fa-solid fa-xmark text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveProgram}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition"
            >
              <i className="fa-solid fa-save mr-2"></i>
              {editingProgram ? "Update Program" : "Save & Create Templates"}
            </button>
            <button
              onClick={() => {
                setShowProgramBuilder(false);
                setEditingProgram(null);
              }}
              className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            <i className="fa-solid fa-info-circle mr-1"></i>
            Each day will be saved as a commitment template you can drag into
            your weekly schedule.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  //  RENDER — SELECTED PROGRAM DETAIL
  // ═══════════════════════════════════════════════

  if (selectedProgram) {
    const prog =
      programs.find((p) => p.id === selectedProgram.id) || selectedProgram;
    const logs = physicalLogs[prog.id] || [];

    // ─── Compute program statistics ───
    const programTemplateIds = prog.days.map(
      (_, idx) => `training-${prog.id}-day-${idx}`,
    );

    // Scan all weeks in localStorage to gather historical data
    const allWeekStats = (() => {
      const stats = {
        totalScheduled: 0,
        totalCompleted: 0,
        weeksSeen: new Set(),
        firstSeen: null,
        lastSeen: null,
        dayBreakdown: {}, // templateId -> { scheduled, completed }
        weeklyHistory: [], // [{weekKey, scheduled, completed}]
      };

      // Initialize day breakdown
      prog.days.forEach((day, idx) => {
        const tid = `training-${prog.id}-day-${idx}`;
        stats.dayBreakdown[tid] = {
          label: day.label,
          scheduled: 0,
          completed: 0,
          muscleGroups: day.muscleGroups || [],
        };
      });

      // Scan localStorage for all week-instances-* keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("week-instances-")) continue;
        const weekKey = key.replace("week-instances-", "");
        let weekInstances = {};
        let weekCompleted = {};
        try {
          weekInstances = JSON.parse(localStorage.getItem(key) || "{}");
          weekCompleted = JSON.parse(
            localStorage.getItem(`week-completed-${weekKey}`) || "{}",
          );
        } catch (e) {
          continue;
        }

        let weekScheduled = 0;
        let weekDone = 0;

        Object.entries(weekInstances).forEach(([dayIdx, instances]) => {
          if (!Array.isArray(instances)) return;
          instances.forEach((inst) => {
            if (programTemplateIds.includes(inst.templateId)) {
              stats.totalScheduled++;
              weekScheduled++;
              stats.weeksSeen.add(weekKey);

              if (stats.dayBreakdown[inst.templateId]) {
                stats.dayBreakdown[inst.templateId].scheduled++;
              }

              // Check completion
              const isCompleted =
                weekCompleted[dayIdx]?.[inst.id] ||
                weekCompleted[inst.id] ||
                false;
              if (isCompleted) {
                stats.totalCompleted++;
                weekDone++;
                if (stats.dayBreakdown[inst.templateId]) {
                  stats.dayBreakdown[inst.templateId].completed++;
                }
              }
            }
          });
        });

        if (weekScheduled > 0) {
          stats.weeklyHistory.push({
            weekKey,
            scheduled: weekScheduled,
            completed: weekDone,
          });
        }
      }

      // Also check current in-memory dayInstances
      Object.entries(dayInstances || {}).forEach(([dayIdx, instances]) => {
        if (!Array.isArray(instances)) return;
        instances.forEach((inst) => {
          if (programTemplateIds.includes(inst.templateId)) {
            // Avoid double counting (already counted from localStorage)
            // Just ensure we have at least current week data
          }
        });
      });

      // Determine first/last dates from weekKeys
      const sortedWeeks = Array.from(stats.weeksSeen).sort();
      if (sortedWeeks.length > 0) {
        stats.firstSeen = sortedWeeks[0];
        stats.lastSeen = sortedWeeks[sortedWeeks.length - 1];
      }

      // Sort weekly history
      stats.weeklyHistory.sort((a, b) => a.weekKey.localeCompare(b.weekKey));

      return stats;
    })();

    // Exercise volume totals
    const totalExercises = prog.days.reduce(
      (sum, d) => sum + d.exercises.length,
      0,
    );
    const totalSets = prog.days.reduce(
      (sum, d) =>
        sum + d.exercises.reduce((s, ex) => s + (parseInt(ex.sets) || 0), 0),
      0,
    );
    const completionRate =
      allWeekStats.totalScheduled > 0
        ? Math.round(
            (allWeekStats.totalCompleted / allWeekStats.totalScheduled) * 100,
          )
        : 0;
    const weeksActive = allWeekStats.weeksSeen.size;

    return (
      <div className="pb-20">
        {/* Back + Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProgram(null)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ background: prog.color }}
            >
              <i
                className={`fa-solid ${prog.type === "gym" ? "fa-dumbbell" : prog.type === "calisthenics" ? "fa-person-running" : prog.type === "cardio" ? "fa-heart-pulse" : "fa-bolt"}`}
              ></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {prog.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {prog.days.length} day{prog.days.length !== 1 ? "s" : ""} •{" "}
                {prog.startTime}–{prog.endTime}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openBuilder(prog)}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <i className="fa-solid fa-pen mr-1"></i>Edit
            </button>
            <button
              onClick={() => setShowPhysicalForm(true)}
              className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition"
            >
              <i className="fa-solid fa-ruler-combined mr-1"></i>Log Body
            </button>
          </div>
        </div>

        {/* Program Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {prog.days.map((day, idx) => (
            <div
              key={idx}
              className="glass-card p-5"
              style={{ borderLeft: `4px solid ${prog.color}` }}
            >
              <h3
                className="font-bold mb-1 text-sm"
                style={{ color: prog.color }}
              >
                {day.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                {(day.muscleGroups || []).join(" • ") || "—"}
              </p>
              <div className="space-y-1.5">
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {ex.name || "—"}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                      {ex.sets}×{ex.reps}
                    </span>
                  </div>
                ))}
                {day.exercises.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No exercises</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
             PROGRAM STATISTICS
           ═══════════════════════════════════════════════ */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-5">
            <i className="fa-solid fa-chart-bar text-blue-500"></i>
            Program Statistics
          </h3>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-500/20">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {allWeekStats.totalScheduled}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Days Scheduled
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 text-center border border-green-200 dark:border-green-500/20">
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                {allWeekStats.totalCompleted}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Days Completed
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-500/20">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {completionRate}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Completion Rate
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-500/20">
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                {weeksActive}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Weeks Active
              </p>
            </div>
          </div>

          {/* Application Period */}
          {allWeekStats.firstSeen && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                <i className="fa-solid fa-calendar-days mr-1"></i> Application
                Period
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {allWeekStats.firstSeen} → {allWeekStats.lastSeen}
                <span className="text-xs text-slate-400 ml-2">
                  ({weeksActive} week{weeksActive !== 1 ? "s" : ""})
                </span>
              </p>
            </div>
          )}

          {/* Volume Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-3">
              <i className="fa-solid fa-fire mr-1"></i> Volume Per Session
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {totalExercises}
                </p>
                <p className="text-xs text-slate-400">Exercises</p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {totalSets}
                </p>
                <p className="text-xs text-slate-400">Total Sets</p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {allWeekStats.totalCompleted > 0
                    ? totalSets * allWeekStats.totalCompleted
                    : totalSets}
                </p>
                <p className="text-xs text-slate-400">Lifetime Sets</p>
              </div>
            </div>
          </div>

          {/* Per-Day Breakdown */}
          {Object.values(allWeekStats.dayBreakdown).some(
            (d) => d.scheduled > 0,
          ) && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-3">
                <i className="fa-solid fa-list-check mr-1"></i> Day Breakdown
              </p>
              <div className="space-y-2">
                {Object.entries(allWeekStats.dayBreakdown).map(
                  ([tid, data]) => {
                    const dayRate =
                      data.scheduled > 0
                        ? Math.round((data.completed / data.scheduled) * 100)
                        : 0;
                    return (
                      <div
                        key={tid}
                        className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: prog.color }}
                        >
                          <i className="fa-solid fa-dumbbell"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {data.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {data.muscleGroups.join(" • ") || "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-sm font-bold"
                            style={{ color: prog.color }}
                          >
                            {data.completed}/{data.scheduled}
                          </p>
                          <p className="text-xs text-slate-400">{dayRate}%</p>
                        </div>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${dayRate}%`,
                              background: prog.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Weekly History */}
          {allWeekStats.weeklyHistory.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-3">
                <i className="fa-solid fa-timeline mr-1"></i> Weekly History
              </p>
              <div className="flex gap-1 items-end h-24">
                {allWeekStats.weeklyHistory.map((wh, idx) => {
                  const maxVal = Math.max(
                    ...allWeekStats.weeklyHistory.map((w) => w.scheduled),
                    1,
                  );
                  const height = Math.max((wh.scheduled / maxVal) * 100, 8);
                  const completedHeight =
                    wh.scheduled > 0
                      ? (wh.completed / wh.scheduled) * height
                      : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-0.5"
                      title={`${wh.weekKey}: ${wh.completed}/${wh.scheduled}`}
                    >
                      <div
                        className="w-full relative rounded-t"
                        style={{
                          height: `${height}%`,
                          background: `${prog.color}20`,
                        }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t"
                          style={{
                            height: `${completedHeight}%`,
                            background: prog.color,
                          }}
                        ></div>
                      </div>
                      <span className="text-[8px] text-slate-400 truncate w-full text-center">
                        {wh.weekKey.split("-")[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Scheduled</span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ background: `${prog.color}20` }}
                  ></span>{" "}
                  Total
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ background: prog.color }}
                  ></span>{" "}
                  Done
                </span>
              </div>
            </div>
          )}

          {allWeekStats.totalScheduled === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">
              No schedule data yet. Add training days to your weekly schedule to
              start tracking progress.
            </p>
          )}
        </div>

        {/* Physical Progress Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-green-500"></i>
              Physical Progress
            </h3>
            <button
              onClick={() => setShowPhysicalForm(true)}
              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition"
            >
              <i className="fa-solid fa-plus mr-1"></i>New Entry
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-6">
              No body measurements recorded yet. Track your physical changes as
              you follow this program.
            </p>
          ) : (
            <>
              {/* Latest vs first comparison */}
              {logs.length >= 2 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                  {[
                    "weight",
                    "bodyFat",
                    "chest",
                    "waist",
                    "arms",
                    "thighs",
                  ].map((key) => {
                    const first = parseFloat(logs[0][key]) || 0;
                    const latest = parseFloat(logs[logs.length - 1][key]) || 0;
                    const diff = latest - first;
                    const label =
                      key === "bodyFat"
                        ? "Body Fat"
                        : key.charAt(0).toUpperCase() + key.slice(1);
                    const unit =
                      key === "bodyFat" ? "%" : key === "weight" ? "kg" : "cm";
                    return (
                      <div
                        key={key}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700"
                      >
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {latest || "—"}
                          <span className="text-xs font-normal text-slate-400 ml-0.5">
                            {latest ? unit : ""}
                          </span>
                        </p>
                        {first > 0 && latest > 0 && (
                          <p
                            className={`text-xs font-medium mt-1 ${
                              diff > 0
                                ? key === "waist" || key === "bodyFat"
                                  ? "text-red-500"
                                  : "text-green-500"
                                : diff < 0
                                  ? key === "waist" || key === "bodyFat"
                                    ? "text-green-500"
                                    : "text-red-500"
                                  : "text-slate-400"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(1)} {unit}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {[...logs].reverse().map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      <i className="fa-solid fa-calendar mr-1 text-slate-400"></i>
                      {entry.date}
                    </span>
                    {entry.weight && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        ⚖️ {entry.weight}kg
                      </span>
                    )}
                    {entry.bodyFat && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        📐 {entry.bodyFat}%
                      </span>
                    )}
                    {entry.chest && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        Chest {entry.chest}cm
                      </span>
                    )}
                    {entry.arms && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        Arms {entry.arms}cm
                      </span>
                    )}
                    {entry.waist && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        Waist {entry.waist}cm
                      </span>
                    )}
                    {entry.thighs && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        Thighs {entry.thighs}cm
                      </span>
                    )}
                    {entry.notes && (
                      <span className="text-slate-500 dark:text-slate-500 text-xs italic w-full">
                        &ldquo;{entry.notes}&rdquo;
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Physical form modal */}
        {showPhysicalForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  <i className="fa-solid fa-ruler-combined text-green-500 mr-2"></i>
                  Log Body Measurements
                </h3>
                <button
                  onClick={() => setShowPhysicalForm(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { key: "weight", label: "Weight (kg)", icon: "⚖️" },
                  { key: "bodyFat", label: "Body Fat (%)", icon: "📐" },
                  { key: "chest", label: "Chest (cm)", icon: "📏" },
                  { key: "waist", label: "Waist (cm)", icon: "📏" },
                  { key: "arms", label: "Arms (cm)", icon: "💪" },
                  { key: "thighs", label: "Thighs (cm)", icon: "🦵" },
                ].map(({ key, label, icon }) => (
                  <div key={key}>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      {icon} {label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={physForm[key]}
                      onChange={(e) =>
                        setPhysForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-green-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  📝 Notes
                </label>
                <textarea
                  value={physForm.notes}
                  onChange={(e) =>
                    setPhysForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows="2"
                  placeholder="How do you feel? Any changes you notice?"
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-green-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={savePhysicalEntry}
                className="w-full px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition"
              >
                <i className="fa-solid fa-save mr-2"></i>Save Entry
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default TrainingView;
