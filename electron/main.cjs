const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const DatabaseManager = require("./database.cjs");
const ProgressTracker = require("./progressTracker.cjs");
const StatisticsCalculator = require("./statisticsCalculator.cjs");

// Check if running in development mode
const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");

let mainWindow;
let db; // Database instance

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  const distPath = isDev
    ? "http://localhost:3000"
    : `file://${path.resolve(path.join(__dirname, "../dist/index.html"))}`;
  const startUrl = distPath;

  mainWindow.loadURL(startUrl);

  // Always open dev tools in production build for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  // Initialize database
  db = new DatabaseManager();
  db.initialize();
  createWindow();
});

app.on("window-all-closed", () => {
  if (db) {
    db.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle("save-file", async (event, filename, content) => {
  try {
    const documentsPath = app.getPath("documents");
    const filePath = path.join(documentsPath, "Schedule App", filename);

    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("load-file", async (event, filename) => {
  try {
    const documentsPath = app.getPath("documents");
    const filePath = path.join(documentsPath, "Schedule App", filename);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return { success: true, content };
    } else {
      return { success: false, error: "File not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("list-saved-files", async (event) => {
  try {
    const documentsPath = app.getPath("documents");
    const scheduleDir = path.join(documentsPath, "Schedule App");

    if (!fs.existsSync(scheduleDir)) {
      return { success: true, files: [] };
    }

    const files = fs
      .readdirSync(scheduleDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        name: file,
        path: path.join(scheduleDir, file),
        stats: fs.statSync(path.join(scheduleDir, file)),
      }));

    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-file", async (event, filename) => {
  try {
    const documentsPath = app.getPath("documents");
    const filePath = path.join(documentsPath, "Schedule App", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      return { success: false, error: "File not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-app-version", async (event) => {
  return app.getVersion();
});

// ============ DATABASE IPC HANDLERS ============

// Commitment handlers
ipcMain.handle("db-add-commitment", async (event, commitment) => {
  try {
    db.addCommitment(commitment);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-update-commitment", async (event, id, updates) => {
  try {
    db.updateCommitment(id, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-delete-commitment", async (event, id) => {
  try {
    db.deleteCommitment(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-commitments", async (event) => {
  try {
    const commitments = db.getCommitments();
    return { success: true, data: commitments };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Schedule instance handlers
ipcMain.handle("db-add-schedule-instance", async (event, instance) => {
  try {
    db.addScheduleInstance(instance);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-update-schedule-instance", async (event, id, updates) => {
  try {
    db.updateScheduleInstance(id, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-schedule-instances-week", async (event, weekId) => {
  try {
    const instances = db.getScheduleInstancesForWeek(weekId);
    return { success: true, data: instances };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "db-get-schedule-instances-day",
  async (event, weekId, dayIndex) => {
    try {
      const instances = db.getScheduleInstancesForDay(weekId, dayIndex);
      return { success: true, data: instances };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

// Completion tracking handlers
ipcMain.handle("db-mark-completion", async (event, completion) => {
  try {
    db.markCompletion(completion);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-completions-week", async (event, weekId) => {
  try {
    const completions = db.getCompletionsForWeek(weekId);
    return { success: true, data: completions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "db-get-completion-stats",
  async (event, commitmentId, weekId) => {
    try {
      const stats = db.getCompletionStats(commitmentId, weekId);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

// Progress tracking handlers
ipcMain.handle("db-update-progress", async (event, progress) => {
  try {
    db.updateProgress(progress);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-progress", async (event, commitmentId, weekId) => {
  try {
    const progress = db.getProgress(commitmentId, weekId);
    return { success: true, data: progress };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-progress-commitment", async (event, commitmentId) => {
  try {
    const progress = db.getProgressForCommitment(commitmentId);
    return { success: true, data: progress };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Statistics handlers
ipcMain.handle("db-update-statistics", async (event, stats) => {
  try {
    db.updateStatistics(stats);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-statistics", async (event, commitmentId) => {
  try {
    const stats = db.getStatistics(commitmentId);
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-all-statistics", async (event) => {
  try {
    const stats = db.getAllStatistics();
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Daily notes handlers
ipcMain.handle("db-save-daily-note", async (event, note) => {
  try {
    db.saveDailyNote(note);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-daily-note", async (event, weekId, dayIndex) => {
  try {
    const note = db.getDailyNote(weekId, dayIndex);
    return { success: true, data: note };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-weekly-notes", async (event, weekId) => {
  try {
    const notes = db.getWeeklyNotes(weekId);
    return { success: true, data: notes };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Data export/import handlers
ipcMain.handle("db-export-all-data", async (event) => {
  try {
    const data = db.exportAllData();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-import-data", async (event, data) => {
  try {
    const result = db.importData(data);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Backup handlers
ipcMain.handle("db-create-backup", async (event, backupInfo) => {
  try {
    db.createBackup(backupInfo);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db-get-backup-history", async (event) => {
  try {
    const backups = db.getBackupHistory();
    return { success: true, data: backups };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============ PROGRESS TRACKER IPC HANDLERS ============

ipcMain.handle(
  "progress-calculate-streak",
  async (event, completions, endDate) => {
    try {
      const streak = ProgressTracker.calculateStreak(completions, endDate);
      return { success: true, data: streak };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("progress-calculate-level", async (event, totalCompletions) => {
  try {
    const level = ProgressTracker.calculateAdvancementLevel(totalCompletions);
    return { success: true, data: level };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "progress-calculate-badges",
  async (event, stats, progressHistory) => {
    try {
      const badges = ProgressTracker.calculateBadges(stats, progressHistory);
      return { success: true, data: badges };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  "progress-generate-report",
  async (event, stats, progressHistory, currentCompletion) => {
    try {
      const report = ProgressTracker.generateAdvancementReport(
        stats,
        progressHistory,
        currentCompletion,
      );
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("progress-analyze-by-day", async (event, completions) => {
  try {
    const analysis = ProgressTracker.analyzeProductivityByDay(completions);
    return { success: true, data: analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============ STATISTICS CALCULATOR IPC HANDLERS ============

ipcMain.handle(
  "stats-generate-weekly-summary",
  async (event, instances, completions) => {
    try {
      const summary = StatisticsCalculator.generateWeeklySummary(
        instances,
        completions,
      );
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  "stats-generate-monthly-summary",
  async (event, progressHistory) => {
    try {
      const summary =
        StatisticsCalculator.generateMonthlySummary(progressHistory);
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("stats-compare-commitments", async (event, allStats) => {
  try {
    const comparison = StatisticsCalculator.compareCommitments(allStats);
    return { success: true, data: comparison };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "stats-generate-insights",
  async (event, weekSummary, monthlySummary, allStats) => {
    try {
      const insights = StatisticsCalculator.generateInsights(
        weekSummary,
        monthlySummary,
        allStats,
      );
      return { success: true, data: insights };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle(
  "stats-calculate-health-score",
  async (event, weekSummary, monthlySummary, streakDays) => {
    try {
      const score = StatisticsCalculator.calculateHealthScore(
        weekSummary,
        monthlySummary,
        streakDays,
      );
      return { success: true, data: score };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("stats-generate-time-distribution", async (event, instances) => {
  try {
    const distribution =
      StatisticsCalculator.generateTimeDistribution(instances);
    return { success: true, data: distribution };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Create application menu
const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        accelerator: "CmdOrCtrl+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
