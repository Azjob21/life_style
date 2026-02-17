/**
 * Statistics Calculator - Analyzes data and generates insights
 */

class StatisticsCalculator {
  /**
   * Calculate completion percentage
   */
  static calculateCompletionPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Calculate average time spent
   */
  static calculateAverageTime(completions) {
    if (!completions || completions.length === 0) return 0;
    const validCompletions = completions.filter(
      (c) => c.actualDuration && c.completed,
    );
    if (validCompletions.length === 0) return 0;
    const total = validCompletions.reduce(
      (sum, c) => sum + c.actualDuration,
      0,
    );
    return Math.round(total / validCompletions.length);
  }

  /**
   * Calculate total time spent
   */
  static calculateTotalTime(completions) {
    if (!completions || completions.length === 0) return 0;
    return completions
      .filter((c) => c.actualDuration && c.completed)
      .reduce((sum, c) => sum + c.actualDuration, 0);
  }

  /**
   * Generate weekly summary
   */
  static generateWeeklySummary(instances, completions) {
    const summary = {
      week: {
        totalScheduled: instances.length,
        totalCompleted: 0,
        completionRate: 0,
        dayBreakdown: {},
      },
      days: {},
    };

    // Initialize days
    for (let i = 0; i < 7; i++) {
      summary.days[i] = {
        dayIndex: i,
        dayName: this.getDayName(i),
        scheduled: 0,
        completed: 0,
        completionRate: 0,
        tasks: [],
      };
    }

    // Count completions
    completions.forEach((completion) => {
      if (completion.completed) {
        summary.week.totalCompleted++;
        const day = completion.dayIndex;
        if (!summary.week.dayBreakdown[day]) {
          summary.week.dayBreakdown[day] = 0;
        }
        summary.week.dayBreakdown[day]++;
      }
    });

    // Calculate rates
    summary.week.completionRate = this.calculateCompletionPercentage(
      summary.week.totalCompleted,
      summary.week.totalScheduled,
    );

    // Process instances by day
    instances.forEach((instance) => {
      const day = instance.dayIndex;
      summary.days[day].scheduled++;

      const dayCompletions = completions.filter(
        (c) => c.instanceId === instance.id && c.completed,
      );
      summary.days[day].completed += dayCompletions.length;

      summary.days[day].tasks.push({
        id: instance.id,
        name: instance.commitmentId,
        time: instance.startTime,
        completed: dayCompletions.length > 0,
      });
    });

    // Calculate daily rates
    Object.keys(summary.days).forEach((day) => {
      const dayData = summary.days[day];
      dayData.completionRate = this.calculateCompletionPercentage(
        dayData.completed,
        dayData.scheduled,
      );
    });

    return summary;
  }

  /**
   * Generate monthly summary
   */
  static generateMonthlySummary(progressHistory) {
    if (!progressHistory || progressHistory.length === 0) {
      return {
        totalCompletions: 0,
        totalScheduled: 0,
        averageCompletionRate: 0,
        bestWeek: null,
        worstWeek: null,
        consistency: 0,
      };
    }

    const totalCompleted = progressHistory.reduce(
      (sum, w) => sum + (w.totalCompleted || 0),
      0,
    );
    const totalScheduled = progressHistory.reduce(
      (sum, w) => sum + (w.totalScheduled || 0),
      0,
    );

    let bestWeek = progressHistory[0];
    let worstWeek = progressHistory[0];

    progressHistory.forEach((week) => {
      if ((week.completionRate || 0) > (bestWeek.completionRate || 0)) {
        bestWeek = week;
      }
      if ((week.completionRate || 0) < (worstWeek.completionRate || 0)) {
        worstWeek = week;
      }
    });

    const avgRate =
      progressHistory.reduce((sum, w) => sum + (w.completionRate || 0), 0) /
      progressHistory.length;

    return {
      totalCompletions: totalCompleted,
      totalScheduled,
      averageCompletionRate: Math.round(avgRate),
      bestWeek: {
        weekId: bestWeek.weekId,
        rate: bestWeek.completionRate,
      },
      worstWeek: {
        weekId: worstWeek.weekId,
        rate: worstWeek.completionRate,
      },
      consistency: Math.round(avgRate),
      weeksTracked: progressHistory.length,
    };
  }

  /**
   * Compare performance across commitments
   */
  static compareCommitments(allStats) {
    if (!allStats || allStats.length === 0) return [];

    return allStats
      .map((stat) => ({
        commitmentId: stat.commitmentId,
        name: stat.name,
        totalCompletions: stat.totalCompletions,
        completionRate: stat.averageCompletionRate,
        streak: stat.recordStreak || 0,
        timeSpent: stat.totalTimeSpent,
        rank: 0,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  /**
   * Generate insights and recommendations
   */
  static generateInsights(weekSummary, monthlySummary, allStats) {
    const insights = [];

    // Completion rate insights
    if (weekSummary.week.completionRate >= 90) {
      insights.push({
        type: "positive",
        message: "Excellent completion rate this week! Keep up the momentum.",
        priority: "high",
      });
    } else if (weekSummary.week.completionRate >= 75) {
      insights.push({
        type: "positive",
        message:
          "Good progress! A few more completions would boost your consistency.",
        priority: "medium",
      });
    } else if (weekSummary.week.completionRate < 50) {
      insights.push({
        type: "warning",
        message:
          "Your completion rate is low this week. Consider reviewing your schedule.",
        priority: "high",
      });
    }

    // Trend insights
    if (monthlySummary.weeksTracked > 1) {
      const recentWeeks =
        monthlySummary.weeksTracked >= 4 ? 4 : monthlySummary.weeksTracked;
      const trend =
        monthlySummary.averageCompletionRate > 60
          ? "improving"
          : "needs attention";
      insights.push({
        type: trend === "improving" ? "positive" : "warning",
        message: `Your ${recentWeeks}-week trend shows ${trend} performance.`,
        priority: "medium",
      });
    }

    // Day-based insights
    let bestDay = null;
    let worstDay = null;
    let bestRate = -1;
    let worstRate = 101;

    Object.keys(weekSummary.days).forEach((day) => {
      const rate = weekSummary.days[day].completionRate;
      if (rate > bestRate) {
        bestRate = rate;
        bestDay = weekSummary.days[day].dayName;
      }
      if (rate < worstRate && weekSummary.days[day].scheduled > 0) {
        worstRate = rate;
        worstDay = weekSummary.days[day].dayName;
      }
    });

    if (bestDay && bestRate > 50) {
      insights.push({
        type: "info",
        message: `${bestDay} is your most productive day (${bestRate}% completion).`,
        priority: "low",
      });
    }

    if (worstDay && worstRate < 50) {
      insights.push({
        type: "warning",
        message: `${worstDay} has lower productivity. Consider adjusting your schedule.`,
        priority: "medium",
      });
    }

    return insights;
  }

  /**
   * Get day name from index
   */
  static getDayName(index) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[index % 7];
  }

  /**
   * Generate time distribution chart data
   */
  static generateTimeDistribution(instances) {
    const distribution = {
      morning: { count: 0, hours: 0 }, // 6-12
      afternoon: { count: 0, hours: 0 }, // 12-18
      evening: { count: 0, hours: 0 }, // 18-24
      night: { count: 0, hours: 0 }, // 0-6
    };

    instances.forEach((instance) => {
      if (!instance.startTime) return;

      const hour = parseInt(instance.startTime.split(":")[0]);
      let period;

      if (hour >= 6 && hour < 12) period = "morning";
      else if (hour >= 12 && hour < 18) period = "afternoon";
      else if (hour >= 18 && hour < 24) period = "evening";
      else period = "night";

      distribution[period].count++;

      // Estimate duration (if endTime exists)
      if (instance.endTime) {
        const startHour = parseInt(instance.startTime.split(":")[0]);
        const endHour = parseInt(instance.endTime.split(":")[0]);
        const duration = (endHour - startHour + 24) % 24;
        distribution[period].hours += Math.max(1, duration);
      } else {
        distribution[period].hours += 1;
      }
    });

    return distribution;
  }

  /**
   * Get performance health score (0-100)
   */
  static calculateHealthScore(weekSummary, monthlySummary, streakDays) {
    let score = 0;

    // Weekly performance (40%)
    score += Math.min(weekSummary.week.completionRate, 100) * 0.4;

    // Monthly consistency (40%)
    score += Math.min(monthlySummary.averageCompletionRate, 100) * 0.4;

    // Streak (20%)
    const streakScore = Math.min((streakDays / 30) * 100, 100);
    score += streakScore * 0.2;

    return Math.round(score);
  }
}

module.exports = StatisticsCalculator;
