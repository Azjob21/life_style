/**
 * Statistics Calculator - Client-side calculations
 * Replaces Electron IPC-based statistics with pure JS functions.
 */

class StatisticsCalculator {
  static generateWeeklySummary(instances, completions) {
    try {
      const totalScheduled = instances?.length || 0;
      const completedSet = new Set(
        (completions || [])
          .filter((c) => c.completed)
          .map((c) => c.instanceId || c.instance_id),
      );
      const totalCompleted =
        instances?.filter((i) => completedSet.has(i.id)).length || 0;
      const completionRate =
        totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;

      // Per-day breakdown
      const days = {};
      for (let d = 0; d < 7; d++) {
        const dayInstances =
          instances?.filter((i) => (i.dayIndex ?? i.day_index) === d) || [];
        const dayCompleted = dayInstances.filter((i) =>
          completedSet.has(i.id),
        ).length;
        days[d] = {
          scheduled: dayInstances.length,
          completed: dayCompleted,
          rate:
            dayInstances.length > 0
              ? (dayCompleted / dayInstances.length) * 100
              : 0,
        };
      }

      return {
        success: true,
        data: {
          week: {
            totalScheduled,
            totalCompleted,
            completionRate: Math.round(completionRate * 10) / 10,
          },
          days,
        },
      };
    } catch (error) {
      console.error("generateWeeklySummary error:", error);
      return { success: false, error: error.message };
    }
  }

  static generateMonthlySummary(progressHistory) {
    try {
      if (!progressHistory || progressHistory.length === 0) {
        return {
          success: true,
          data: {
            totalScheduled: 0,
            totalCompleted: 0,
            averageRate: 0,
            weekCount: 0,
          },
        };
      }

      const totalScheduled = progressHistory.reduce(
        (sum, p) => sum + (p.total_scheduled || p.totalScheduled || 0),
        0,
      );
      const totalCompleted = progressHistory.reduce(
        (sum, p) => sum + (p.total_completed || p.totalCompleted || 0),
        0,
      );
      const averageRate =
        totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0;

      return {
        success: true,
        data: {
          totalScheduled,
          totalCompleted,
          averageRate: Math.round(averageRate * 10) / 10,
          weekCount: progressHistory.length,
        },
      };
    } catch (error) {
      console.error("generateMonthlySummary error:", error);
      return { success: false, error: error.message };
    }
  }

  static generateInsights(weekSummary, monthlySummary, allStats) {
    try {
      const insights = [];

      if (weekSummary?.week) {
        const rate = weekSummary.week.completionRate || 0;
        if (rate >= 90) {
          insights.push({
            type: "success",
            icon: "🎉",
            message: `Amazing week! ${rate}% completion rate.`,
          });
        } else if (rate >= 70) {
          insights.push({
            type: "good",
            icon: "👍",
            message: `Good progress this week: ${rate}% completion rate.`,
          });
        } else if (rate >= 40) {
          insights.push({
            type: "warning",
            icon: "⚡",
            message: `Room for improvement: ${rate}% completion rate this week.`,
          });
        } else if (weekSummary.week.totalScheduled > 0) {
          insights.push({
            type: "alert",
            icon: "💪",
            message: `Tough week with ${rate}% completion. Keep pushing!`,
          });
        }
      }

      // Best day insight
      if (weekSummary?.days) {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        let bestDay = -1;
        let bestRate = 0;
        Object.entries(weekSummary.days).forEach(([day, stats]) => {
          if (stats.scheduled > 0 && stats.rate > bestRate) {
            bestRate = stats.rate;
            bestDay = parseInt(day);
          }
        });
        if (bestDay >= 0) {
          insights.push({
            type: "info",
            icon: "📊",
            message: `Most productive day: ${dayNames[bestDay]} (${Math.round(bestRate)}%)`,
          });
        }
      }

      return { success: true, data: insights };
    } catch (error) {
      console.error("generateInsights error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default StatisticsCalculator;
