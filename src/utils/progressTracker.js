/**
 * Progress Tracker - Client-side calculations
 * Replaces Electron IPC-based progress tracking with pure JS functions.
 */

class ProgressTracker {
  static calculateAdvancementLevel(totalCompletions) {
    const levels = [
      { name: "Beginner", minCompletions: 0, icon: "🌱" },
      { name: "Regular", minCompletions: 10, icon: "🌿" },
      { name: "Committed", minCompletions: 25, icon: "🌳" },
      { name: "Dedicated", minCompletions: 50, icon: "⭐" },
      { name: "Expert", minCompletions: 100, icon: "🏆" },
      { name: "Master", minCompletions: 200, icon: "👑" },
      { name: "Legend", minCompletions: 500, icon: "💎" },
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalCompletions >= levels[i].minCompletions) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
        break;
      }
    }

    const progress = nextLevel
      ? ((totalCompletions - currentLevel.minCompletions) /
          (nextLevel.minCompletions - currentLevel.minCompletions)) *
        100
      : 100;

    return {
      success: true,
      data: {
        level: currentLevel.name,
        icon: currentLevel.icon,
        totalCompletions,
        progress: Math.min(100, Math.round(progress)),
        nextLevel: nextLevel?.name || null,
        completionsToNext: nextLevel
          ? nextLevel.minCompletions - totalCompletions
          : 0,
      },
    };
  }

  static calculateBadges(stats, progressHistory) {
    const badges = [];

    if (!stats) return { success: true, data: badges };

    // Streak badges
    if (stats.record_streak >= 7 || stats.recordStreak >= 7) {
      badges.push({
        name: "Week Warrior",
        icon: "🔥",
        description: "7-day streak",
      });
    }
    if (stats.record_streak >= 30 || stats.recordStreak >= 30) {
      badges.push({
        name: "Monthly Master",
        icon: "🌟",
        description: "30-day streak",
      });
    }

    // Completion badges
    const completions = stats.total_completions || stats.totalCompletions || 0;
    if (completions >= 10) {
      badges.push({
        name: "Getting Started",
        icon: "🎯",
        description: "10 completions",
      });
    }
    if (completions >= 50) {
      badges.push({
        name: "Halfway Hero",
        icon: "🏅",
        description: "50 completions",
      });
    }
    if (completions >= 100) {
      badges.push({
        name: "Century Club",
        icon: "💯",
        description: "100 completions",
      });
    }

    // Rate badges
    const rate =
      stats.average_completion_rate || stats.averageCompletionRate || 0;
    if (rate >= 80) {
      badges.push({
        name: "High Achiever",
        icon: "🌈",
        description: "80%+ completion rate",
      });
    }
    if (rate >= 95) {
      badges.push({
        name: "Perfectionist",
        icon: "💎",
        description: "95%+ completion rate",
      });
    }

    return { success: true, data: badges };
  }

  static calculateStreak(completions, endDate = new Date()) {
    if (!completions || completions.length === 0) {
      return { success: true, data: { currentStreak: 0, longestStreak: 0 } };
    }

    // Sort by date descending
    const sortedDates = [
      ...new Set(
        completions
          .filter((c) => c.completed)
          .map((c) => c.completionTime || c.completion_time)
          .filter(Boolean)
          .map((d) => new Date(d).toISOString().split("T")[0]),
      ),
    ]
      .sort()
      .reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      if (!prevDate) {
        streak = 1;
      } else {
        const diff = (prevDate - date) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      prevDate = date;
    }
    longestStreak = Math.max(longestStreak, streak);
    currentStreak = streak;

    return { success: true, data: { currentStreak, longestStreak } };
  }
}

export default ProgressTracker;
