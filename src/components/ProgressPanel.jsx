/**
 * ProgressPanel - Displays user advancement, streaks, and badges
 */

import React, { useState, useEffect } from "react";
import useBackend from "../utils/useBackend";

function ProgressPanel() {
  const backend = useBackend();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [allProgress, setAllProgress] = useState([]);

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const commitments = await backend.getCommitments();

      if (commitments && commitments.length > 0) {
        // Load progress for all commitments
        const progressArray = [];
        for (const commitment of commitments) {
          const level = await backend.getAdvancementLevel(commitment.id);
          const badges = await backend.getBadges(commitment.id);
          progressArray.push({
            commitmentId: commitment.id,
            commitment: commitment.name,
            level,
            badges,
          });
        }
        setAllProgress(progressArray);
        setProgressData(progressArray[0] || null);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
        <div className="text-center text-slate-500 dark:text-slate-400">
          Loading progress...
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
        <div className="text-center text-slate-500 dark:text-slate-400">
          Create a commitment to track progress
        </div>
      </div>
    );
  }

  const { commitment, level, badges } = progressData || {};

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          📊 Progress & Achievements
        </h3>
        <button
          onClick={loadProgress}
          className="text-sm px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition text-slate-900 dark:text-white"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Commitment Tabs */}
      {allProgress.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {allProgress.map((prog, idx) => (
            <button
              key={prog.commitmentId}
              onClick={() => setProgressData(prog)}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition ${
                progressData?.commitmentId === prog.commitmentId
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500"
              }`}
            >
              {prog.commitment}
            </button>
          ))}
        </div>
      )}

      {/* Level Display */}
      {level && (
        <div className="mb-6 p-4 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current Level
              </p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                Level {level.currentLevel}: {level.label}
              </h4>
            </div>
            <div className="text-4xl">🏆</div>
          </div>

          <div className="bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
              style={{ width: `${level.progressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{level.totalCompletions} completions</span>
            <span>{level.progressPercent}% to next level</span>
          </div>

          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {level.progressToNextLevel} more to reach Level{" "}
            {level.currentLevel + 1}
          </div>
        </div>
      )}

      {/* Badges Section */}
      {badges && badges.length > 0 && (
        <div className="mb-4 p-4 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
            Achievements
          </p>
          <div className="grid grid-cols-2 gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 p-2 rounded bg-slate-100 dark:bg-slate-600"
              >
                <span className="text-xl">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {badge.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Commitment Summary */}
      {allProgress.length > 0 && (
        <div className="mb-4 p-4 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
            All Commitment Levels
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allProgress.map((prog) => (
              <div
                key={prog.commitmentId}
                className="p-3 rounded bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-600"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                  {prog.commitment}
                </p>
                {prog.level && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      Level {prog.level.currentLevel}
                    </span>
                    <div className="flex-1 mx-2 bg-slate-200 dark:bg-slate-500 rounded h-2">
                      <div
                        className="bg-blue-500 h-full rounded transition-all"
                        style={{ width: `${prog.level.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {prog.level.progressPercent}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!level && !badges && (
        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
          <p className="text-sm">No progress tracking data yet</p>
          <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
            Complete tasks to earn achievements and level up!
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressPanel;
