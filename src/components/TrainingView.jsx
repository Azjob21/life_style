import React, { useState, useEffect } from "react";

function TrainingView() {
    const [exerciseName, setExerciseName] = useState("");
    const [setsReps, setSetsReps] = useState("");
    const [workoutLog, setWorkoutLog] = useState([]);

    // Load logs from localStorage
    useEffect(() => {
        const savedLog = localStorage.getItem("training-log");
        if (savedLog) {
            setWorkoutLog(JSON.parse(savedLog));
        }
    }, []);

    // Save logs to localStorage
    useEffect(() => {
        localStorage.setItem("training-log", JSON.stringify(workoutLog));
    }, [workoutLog]);

    const logWorkout = () => {
        if (!exerciseName || !setsReps) return;

        const newLog = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            exercise: exerciseName,
            setsReps: setsReps,
            timestamp: Date.now(),
        };

        setWorkoutLog([newLog, ...workoutLog]);
        setExerciseName("");
        setSetsReps("");
    };

    const deleteLog = (id) => {
        setWorkoutLog(workoutLog.filter((log) => log.id !== id));
    };

    const getTodayLogs = () => {
        const today = new Date().toLocaleDateString();
        return workoutLog.filter((log) => log.date === today);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {/* Gym Program */}
            <section className="glass-card p-6">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
                    <i className="fa-solid fa-dumbbell text-red-500"></i>GYM PROGRAM (3
                    Days/Week)
                </h2>
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4 border-red-500 border border-slate-200 dark:border-transparent">
                        <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">PUSH (Day 1)</h3>
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                            <li>• Bench Press / Push-ups → 3×8–12</li>
                            <li>• Shoulder Press → 3×8–10</li>
                            <li>• Lateral Raises → 3×12</li>
                            <li>• Triceps Pushdown → 3×10–12</li>
                            <li>• Plank → 3×30s</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4 border-blue-500 border border-slate-200 dark:border-transparent">
                        <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">PULL (Day 2)</h3>
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                            <li>• Lat Pulldown / Pull-ups → 3×8–10</li>
                            <li>• Seated Row → 3×10</li>
                            <li>• Face Pull → 3×12</li>
                            <li>• Dumbbell Curls → 3×10</li>
                            <li>• Dead hang → 3×30s</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4 border-green-500 border border-slate-200 dark:border-transparent">
                        <h3 className="font-bold text-green-600 dark:text-green-400 mb-2">LEGS + CORE (Day 3)</h3>
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                            <li>• Squats / Leg Press → 3×10</li>
                            <li>• Romanian Deadlift → 3×8</li>
                            <li>• Lunges → 3×10/leg</li>
                            <li>• Calf Raises → 3×15</li>
                            <li>• Hanging knee raises → 3×10</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="space-y-6">
                {/* Calisthenics Program */}
                <section className="glass-card p-6">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
                        <i className="fa-solid fa-person text-blue-500"></i>CALISTHENICS
                        (1-2 Days/Week)
                    </h2>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4 border-orange-500 border border-slate-200 dark:border-transparent">
                        <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-2">Full Body Flow</h3>
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                            <li>• Push-ups (Variations) → 3×Failure</li>
                            <li>• Pull-ups / Chin-ups → 3×Failure</li>
                            <li>• Dips → 3×10-15</li>
                            <li>• Bodyweight Squats → 3×20</li>
                            <li>• L-Sit Progression → 3×Max hold</li>
                            <li>• Handstand Practice → 10 mins</li>
                        </ul>
                    </div>
                </section>

                {/* Workout Logger */}
                <section className="glass-card p-6">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
                        <i className="fa-solid fa-plus-circle text-green-600"></i>Log Today's
                        Workout
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                                Exercise
                            </label>
                            <input
                                type="text"
                                value={exerciseName}
                                onChange={(e) => setExerciseName(e.target.value)}
                                placeholder="e.g., Bench Press"
                                className="w-full bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                                Sets x Reps
                            </label>
                            <input
                                type="text"
                                value={setsReps}
                                onChange={(e) => setSetsReps(e.target.value)}
                                placeholder="e.g., 3x8"
                                className="w-full bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={logWorkout}
                                disabled={!exerciseName || !setsReps}
                                className="w-full px-4 py-2 rounded font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-check mr-2"></i>Log
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-400 mb-2 uppercase tracking-tighter">Today's Logs</h3>
                        {getTodayLogs().length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No workouts logged today</p>
                        ) : (
                            <div className="space-y-2">
                                {getTodayLogs().map((log) => (
                                    <div key={log.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-2 rounded border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-slate-200">{log.exercise}</span>
                                            <span className="text-slate-600 dark:text-slate-400 text-sm ml-2">({log.setsReps})</span>
                                        </div>
                                        <button
                                            onClick={() => deleteLog(log.id)}
                                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default TrainingView;
