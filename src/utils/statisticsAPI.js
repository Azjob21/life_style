/**
 * Statistics Calculator API - Frontend wrapper for statistics/insights operations
 */

import { isElectron } from "./electronAPI";

class StatisticsAPI {
  static async generateWeeklySummary(instances, completions) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-generate-weekly-summary",
      instances,
      completions,
    );
  }

  static async generateMonthlySummary(progressHistory) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-generate-monthly-summary",
      progressHistory,
    );
  }

  static async compareCommitments(allStats) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-compare-commitments",
      allStats,
    );
  }

  static async generateInsights(weekSummary, monthlySummary, allStats) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-generate-insights",
      weekSummary,
      monthlySummary,
      allStats,
    );
  }

  static async calculateHealthScore(weekSummary, monthlySummary, streakDays) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-calculate-health-score",
      weekSummary,
      monthlySummary,
      streakDays,
    );
  }

  static async generateTimeDistribution(instances) {
    if (!isElectron()) {
      return {
        success: false,
        error: "Statistics operations only available in Electron",
      };
    }
    return await window.electronAPI.databaseRequest(
      "stats-generate-time-distribution",
      instances,
    );
  }
}

export default StatisticsAPI;
