/**
 * Progress Tracker - Handles advancement tracking, streaks, and consistency metrics
 */

class ProgressTracker {
  /**
   * Calculate completion rate for a commitment in a week
   */
  static calculateCompletionRate(totalScheduled, totalCompleted) {
    if (totalScheduled === 0) return 0;
    return Math.round((totalCompleted / totalScheduled) * 100);
  }

  /**
   * Calculate consistency score based on completion history
   * Returns 0-100 score
   */
  static calculateConsistencyScore(progressHistory) {
    if (!progressHistory || progressHistory.length === 0) return 0;

    let scoreSum = 0;
    const maxWeeks = Math.min(progressHistory.length, 12); // Last 12 weeks

    for (let i = 0; i < maxWeeks; i++) {
      const rate = progressHistory[i]?.completionRate || 0;
      // Decay older weeks less in scoring
      const weight = 1 - i * 0.05;
      scoreSum += rate * weight;
    }

    return Math.round(scoreSum / maxWeeks);
  }

  /**
   * Calculate current streak (consecutive days of completion)
   */
  static calculateStreak(completions, endDate = new Date()) {
    if (!completions || completions.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date(endDate);

    // Sort completions by date descending
    const sorted = [...completions].sort((a, b) => {
      const dateA = new Date(a.completionTime || a.updatedAt);
      const dateB = new Date(b.completionTime || b.updatedAt);
      return dateB - dateA;
    });

    for (const completion of sorted) {
      if (!completion.completed) continue;

      const completionDate = new Date(
        completion.completionTime || completion.updatedAt,
      );
      const dayDiff = Math.floor(
        (checkDate - completionDate) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff <= 1) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak from completion history
   */
  static calculateLongestStreak(completions) {
    if (!completions || completions.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate = null;

    const sorted = [...completions]
      .filter((c) => c.completed)
      .sort((a, b) => new Date(a.completionTime) - new Date(b.completionTime));

    for (const completion of sorted) {
      const completionDate = new Date(completion.completionTime);

      if (!lastDate) {
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (completionDate - lastDate) / (1000 * 60 * 60 * 24),
        );
        if (dayDiff <= 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }

      lastDate = new Date(completionDate);
    }

    return Math.max(longestStreak, currentStreak);
  }

  /**
   * Calculate advancement level based on total completions
   * Returns level 1-10 and progress to next level
   */
  static calculateAdvancementLevel(totalCompletions) {
    const levels = [
      { level: 1, threshold: 0, label: "Beginner" },
      { level: 2, threshold: 10, label: "Novice" },
      { level: 3, threshold: 25, label: "Apprentice" },
      { level: 4, threshold: 50, label: "Proficient" },
      { level: 5, threshold: 100, label: "Skilled" },
      { level: 6, threshold: 200, label: "Expert" },
      { level: 7, threshold: 350, label: "Master" },
      { level: 8, threshold: 500, label: "Virtuoso" },
      { level: 9, threshold: 750, label: "Legend" },
      { level: 10, threshold: 1000, label: "Immortal" },
    ];

    let currentLevel = 1;
    let nextLevel = 2;

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalCompletions >= levels[i].threshold) {
        currentLevel = levels[i].level;
        nextLevel = i < levels.length - 1 ? levels[i + 1].level : 10;
        break;
      }
    }

    const currentThreshold = levels[currentLevel - 1].threshold;
    const nextThreshold =
      currentLevel < 10 ? levels[currentLevel].threshold : 1000;
    const progressToNext = totalCompletions - currentThreshold;
    const progressNeeded = nextThreshold - currentThreshold;
    const progressPercent = Math.round((progressToNext / progressNeeded) * 100);

    return {
      currentLevel,
      label: levels[currentLevel - 1].label,
      totalCompletions,
      progressToNextLevel: Math.max(0, nextThreshold - totalCompletions),
      progressPercent: Math.min(100, progressPercent),
      nextLevelAt: nextThreshold,
    };
  }

  /**
   * Calculate badges earned based on achievements
   */
  static calculateBadges(stats, progressHistory) {
    const badges = [];

    // Consistency badges
    if (stats.averageCompletionRate >= 90) {
      badges.push({
        id: "perfect-consistency",
        name: "Perfect Consistency",
        description: "90%+ completion rate",
        icon: "⭐",
      });
    } else if (stats.averageCompletionRate >= 75) {
      badges.push({
        id: "high-consistency",
        name: "Consistent Performer",
        description: "75%+ completion rate",
        icon: "✨",
      });
    }

    // Streak badges
    if (stats.recordStreak >= 30) {
      badges.push({
        id: "month-streak",
        name: "Month Master",
        description: "30+ day streak",
        icon: "🔥",
      });
    } else if (stats.recordStreak >= 7) {
      badges.push({
        id: "week-streak",
        name: "Weekly Warrior",
        description: "7+ day streak",
        icon: "💪",
      });
    }

    // Completion count badges
    if (stats.totalCompletions >= 1000) {
      badges.push({
        id: "thousand-completions",
        name: "Thousand Fold",
        description: "1000+ completions",
        icon: "🏆",
      });
    } else if (stats.totalCompletions >= 500) {
      badges.push({
        id: "five-hundred",
        name: "Halfway There",
        description: "500+ completions",
        icon: "🎖️",
      });
    } else if (stats.totalCompletions >= 100) {
      badges.push({
        id: "century",
        name: "Century Club",
        description: "100+ completions",
        icon: "💯",
      });
    }

    // Dedication badge
    if (progressHistory && progressHistory.length >= 12) {
      badges.push({
        id: "year-dedication",
        name: "Year of Dedication",
        description: "Tracked for 12+ weeks",
        icon: "📅",
      });
    }

    return badges;
  }

  /**
   * Generate advancement report
   */
  static generateAdvancementReport(stats, progressHistory, currentCompletion) {
    const level = this.calculateAdvancementLevel(stats.totalCompletions);
    const badges = this.calculateBadges(stats, progressHistory);
    const consistency = this.calculateConsistencyScore(progressHistory);

    return {
      level,
      badges,
      stats: {
        totalCompletions: stats.totalCompletions,
        totalAllotted: stats.totalAllotted,
        averageCompletionRate: stats.averageCompletionRate,
        consistencyScore: consistency,
        recordStreak: stats.recordStreak,
        currentStreak: currentCompletion?.streakDays || 0,
        mostProductiveDay: stats.mostProductiveDay,
        totalTimeSpent: stats.totalTimeSpent,
      },
      trends: this.calculateTrends(progressHistory),
    };
  }

  /**
   * Calculate trends from progress history
   */
  static calculateTrends(progressHistory) {
    if (!progressHistory || progressHistory.length < 2) {
      return { trend: "stable", change: 0, direction: "→" };
    }

    const recent = progressHistory.slice(0, 4); // Last 4 weeks
    const older = progressHistory.slice(4, 8); // Previous 4 weeks

    const recentAvg =
      recent.reduce((sum, p) => sum + (p.completionRate || 0), 0) /
      recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, p) => sum + (p.completionRate || 0), 0) /
          older.length
        : recentAvg;

    const change = Math.round(recentAvg - olderAvg);
    let trend = "stable";
    let direction = "→";

    if (change > 10) {
      trend = "improving";
      direction = "↗";
    } else if (change < -10) {
      trend = "declining";
      direction = "↘";
    } else if (change > 0) {
      trend = "slightly improving";
      direction = "↗";
    } else if (change < 0) {
      trend = "slightly declining";
      direction = "↘";
    }

    return {
      trend,
      change: Math.abs(change),
      direction,
      recentAverage: Math.round(recentAvg),
    };
  }

  /**
   * Calculate productivity by day of week
   */
  static analyzeProductivityByDay(completions) {
    const dayStats = {
      0: { name: "Monday", completed: 0, total: 0 },
      1: { name: "Tuesday", completed: 0, total: 0 },
      2: { name: "Wednesday", completed: 0, total: 0 },
      3: { name: "Thursday", completed: 0, total: 0 },
      4: { name: "Friday", completed: 0, total: 0 },
      5: { name: "Saturday", completed: 0, total: 0 },
      6: { name: "Sunday", completed: 0, total: 0 },
    };

    completions.forEach((completion) => {
      const day = completion.dayIndex % 7;
      dayStats[day].total++;
      if (completion.completed) {
        dayStats[day].completed++;
      }
    });

    // Calculate rates
    Object.keys(dayStats).forEach((day) => {
      const stats = dayStats[day];
      stats.rate =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    });

    // Find most productive day
    let mostProductive = 0;
    let maxRate = 0;
    Object.keys(dayStats).forEach((day) => {
      if (dayStats[day].rate > maxRate) {
        maxRate = dayStats[day].rate;
        mostProductive = parseInt(day);
      }
    });

    return { dayStats, mostProductiveDay: mostProductive };
  }
}

module.exports = ProgressTracker;
