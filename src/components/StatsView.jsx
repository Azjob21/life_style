import React, { useState, useEffect } from "react";

function StatsView({ dayInstances, completedInstances }) {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const [gymLogs, setGymLogs] = useState([]);
    const [contentRoadmap, setContentRoadmap] = useState([]);

    // Load gym and content data for cross-reference
    useEffect(() => {
        const savedGym = localStorage.getItem("training-log");
        if (savedGym) setGymLogs(JSON.parse(savedGym));

        const savedContent = localStorage.getItem("content-roadmap");
        if (savedContent) setContentRoadmap(JSON.parse(savedContent));
    }, []);

    // Calculate Metrics
    const calculateMetrics = () => {
        let focusTotal = 0;
        let focusCompleted = 0;
        let quranTotal = 0;
        let quranCompleted = 0;
        let trainingTotal = 0; // Planned via schedule
        let trainingCompleted = 0; // Completed via schedule check

        // Iterate through all days
        Object.keys(dayInstances).forEach((dayIdx) => {
            const instances = dayInstances[dayIdx] || [];
            instances.forEach((inst) => {
                const isCompleted = completedInstances[dayIdx]?.[inst.id];
                const title = inst.title.toLowerCase();

                // Focus Block Logic
                if (title.includes("focus") || title.includes("deep work")) {
                    focusTotal++;
                    if (isCompleted) focusCompleted++;
                }

                // Quran Logic
                if (title.includes("quran")) {
                    quranTotal++;
                    if (isCompleted) quranCompleted++;
                }

                // Training Logic (Scheduled)
                if (title.includes("gym") || title.includes("calisthenics") || title.includes("training")) {
                    trainingTotal++;
                    if (isCompleted) trainingCompleted++;
                }
            });
        });

        return {
            focus: focusTotal > 0 ? Math.round((focusCompleted / focusTotal) * 100) : 0,
            quran: quranTotal > 0 ? Math.round((quranCompleted / quranTotal) * 100) : 0,
            training: trainingTotal > 0 ? Math.round((trainingCompleted / trainingTotal) * 100) : 0,
        };
    };

    const metrics = calculateMetrics();

    // Helper for progress bars
    const ProgressBar = ({ label, percentage, colorClass }) => (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-slate-900 dark:text-slate-400 font-black text-sm uppercase tracking-tighter">{label}</span>
                <span className={`font-black ${colorClass}`}>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="pb-20 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Streak Card - Reused logic for consistency */}
                <div className="glass-card p-6 border-l-4 border-orange-500">
                    <div className="text-xs text-slate-900 dark:text-slate-400 mb-2 font-black uppercase tracking-widest">Current Streak</div>
                    <div className="text-3xl font-black text-orange-400 flex items-center gap-2">
                        {(() => {
                            let streak = 0;
                            const today = new Date().getDay(); // 0 is Sunday, but our array is 0=Mon
                            const todayIdx = today === 0 ? 6 : today - 1;
                            for (let i = todayIdx; i >= 0; i--) {
                                const dayInsts = dayInstances[i] || [];
                                if (dayInsts.length > 0) {
                                    const completed = dayInsts.filter(item => completedInstances[i]?.[item.id]).length;
                                    if (completed > 0) streak++;
                                    else break;
                                }
                            }
                            return streak;
                        })()}
                        <span className="text-lg">days</span>
                        <i className="fa-solid fa-fire text-orange-500 animate-pulse text-xl"></i>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-500 mt-2 font-bold">Keep the system alive</p>
                </div>

                {/* This Week Completion */}
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="text-xs text-slate-900 dark:text-slate-400 mb-2 font-black uppercase tracking-widest">This Week</div>
                    <div className="text-3xl font-black text-blue-400">
                        {(() => {
                            let completedDays = 0;
                            let activeDays = 0;
                            Object.keys(dayInstances).forEach(idx => {
                                const insts = dayInstances[idx];
                                if (insts && insts.length > 0) {
                                    activeDays++;
                                    const isDayComplete = insts.every(i => completedInstances[idx]?.[i.id]);
                                    // Or at least 80% complete? Let's say all essential. 
                                    // For this metric, let's track days with > 50% completion
                                    const compCount = insts.filter(i => completedInstances[idx]?.[i.id]).length;
                                    if (compCount / insts.length >= 0.5) completedDays++;
                                }
                            });
                            return `${completedDays} / ${activeDays}`;
                        })()}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-500 mt-2 font-bold">Days &gt; 50% completed</p>
                </div>

                {/* Gym Sessions */}
                <div className="glass-card p-6 border-l-4 border-red-500">
                    <div className="text-xs text-slate-900 dark:text-slate-400 mb-2 font-black uppercase tracking-widest">Gym Sessions</div>
                    <div className="text-3xl font-black text-red-400">
                        {gymLogs.filter(l => {
                            // Filter logs from this week? For now, total logs or just mock "This Week" via date check
                            // Simple date check: allow all for now as mock, or filter by current iso week?
                            // Let's just show total logs count for simplicity or last 7 days
                            const logDate = new Date(l.date);
                            const diffTime = Math.abs(new Date() - logDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 7;
                        }).length}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-500 mt-2 font-bold">Logged in last 7 days</p>
                </div>

                {/* Content Created */}
                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="text-xs text-slate-900 dark:text-slate-400 mb-2 font-black uppercase tracking-widest">Content Published</div>
                    <div className="text-3xl font-black text-purple-400">
                        {contentRoadmap.filter(c => c.status === 'completed').length}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-500 mt-2 font-bold">Total videos done</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Completion Chart */}
                <section className="glass-card p-6">
                    <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Weekly Completion</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {DAYS.map((day, idx) => {
                            const insts = dayInstances[idx] || [];
                            const total = insts.length;
                            const completed = insts.filter(i => completedInstances[idx]?.[i.id]).length;
                            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                            return (
                                <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group">
                                    <div className="w-full bg-slate-700/50 dark:bg-slate-800/50 rounded-t-lg relative flex items-end justify-center overflow-hidden hover:bg-slate-600 transition" style={{ height: '100%' }}>
                                        <div
                                            className={`w-full transition-all duration-1000 ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : 'bg-slate-500'}`}
                                            style={{ height: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <span className="mt-2 text-xs font-black text-slate-900 dark:text-slate-400">{day}</span>
                                    <div className="text-xs font-black text-slate-700 dark:text-slate-200 mt-1">{percent}%</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Detailed Metrics */}
                <section className="glass-card p-6">
                    <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white uppercase tracking-tighter">Metric Adherence</h2>
                    <div className="space-y-6">
                        <ProgressBar label="Focus Block Adherence" percentage={metrics.focus} colorClass="text-amber-400" />
                        <ProgressBar label="Quran Consistency" percentage={metrics.quran} colorClass="text-green-400" />
                        <ProgressBar label="Training Completion" percentage={metrics.training} colorClass="text-red-400" />
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-transparent rounded-lg">
                        <h3 className="font-bold text-slate-900 dark:text-slate-200 mb-2">System Health</h3>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            OPERATIONAL
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
                            All systems functional. Continue execution of protocol.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default StatsView;
