import React, { useState, useEffect } from "react";

function ContentView() {
    const [roadmap, setRoadmap] = useState([
        {
            id: 1,
            week: 1,
            title: "Why game enemies feel stupid (and how AI fixes that)",
            focus: "Recording setup, Mic, OBS basics",
            status: "completed",
        },
        {
            id: 2,
            week: 2,
            title: "Finite State Machines explained using a game enemy",
            focus: "Simple diagrams, Explaining concepts",
            status: "completed",
        },
        {
            id: 3,
            week: 3,
            title: "Pathfinding in games: why A* is everywhere",
            focus: "Visual explanation, Light code",
            status: "in-progress",
        },
        {
            id: 4,
            week: 4,
            title: "How I'm combining AI + game dev as a student",
            focus: "Storytelling, Building identity",
            status: "pending",
        },
    ]);

    // Load from localStorage
    useEffect(() => {
        const savedRoadmap = localStorage.getItem("content-roadmap");
        if (savedRoadmap) {
            setRoadmap(JSON.parse(savedRoadmap));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("content-roadmap", JSON.stringify(roadmap));
    }, [roadmap]);

    const toggleStatus = (id) => {
        setRoadmap(
            roadmap.map((item) => {
                if (item.id === id) {
                    const nextStatus =
                        item.status === "pending"
                            ? "in-progress"
                            : item.status === "in-progress"
                                ? "completed"
                                : "pending";
                    return { ...item, status: nextStatus };
                }
                return item;
            })
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-400 bg-green-400/10 border-green-400/20";
            case "in-progress":
                return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            default:
                return "text-slate-400 bg-slate-400/10 border-slate-400/20";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return "fa-check-circle";
            case "in-progress":
                return "fa-spinner fa-spin";
            default:
                return "fa-circle";
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            <div className="lg:col-span-8">
                <section className="glass-card p-6">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
                        <i className="fa-solid fa-video text-green-600"></i>30-Day Content Roadmap
                    </h2>

                    <div className="space-y-4">
                        {roadmap.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleStatus(item.id)}
                                className={`p-4 rounded-lg border transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-4 ${item.status === "completed"
                                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/20"
                                    : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                <div className="mt-1">
                                    <span
                                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${item.status === "completed"
                                            ? "bg-green-500 text-white border-green-500"
                                            : "bg-slate-700 text-slate-400 border-slate-600"
                                            }`}
                                    >
                                        W{item.week}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className={`font-bold text-lg mb-1 ${item.status === "completed"
                                            ? "text-slate-400 line-through decoration-slate-400"
                                            : "text-slate-900 dark:text-white"
                                            }`}
                                    >
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <i className="fa-solid fa-crosshairs text-xs"></i>
                                        <span>Focus: {item.focus}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${getStatusColor(
                                            item.status
                                        )}`}
                                    >
                                        <i className={`fa-solid ${getStatusIcon(item.status)}`}></i>
                                        {item.status.replace("-", " ")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="lg:col-span-4">
                <section className="glass-card p-6 sticky top-6">
                    <h3 className="text-lg font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tighter">Content Strategy</h3>
                    <div className="space-y-4 text-sm text-slate-300 dark:text-slate-300">
                        <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-transparent rounded-lg">
                            <div className="text-2xl">📊</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">1 Video / Week</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    3-6 minutes, screen + voice only. Keep it simple.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-slate-700/30 dark:bg-slate-800/30 rounded-lg">
                            <div className="text-2xl">🎥</div>
                            <div>
                                <p className="font-bold text-slate-100 dark:text-slate-100">No Editing Perfection</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Focus on clarity and value, not flashy editing.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-slate-700/30 dark:bg-slate-800/30 rounded-lg">
                            <div className="text-2xl">⏳</div>
                            <div>
                                <p className="font-bold text-slate-100 dark:text-slate-100">Weekly Workflow</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Sat: Outline & Script<br />
                                    Sun: Record & Upload
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ContentView;
