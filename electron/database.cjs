const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  initialize() {
    try {
      const dataPath = app.getPath("userData");
      this.dbPath = path.join(dataPath, "schedule-app.db");

      // Create directory if it doesn't exist
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.db.pragma("journal_mode = WAL");
      this.createTables();
      console.log(`Database initialized at: ${this.dbPath}`);
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  createTables() {
    // Commitments/Templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commitments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        icon TEXT,
        color TEXT,
        defaultDuration INTEGER,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Schedule instances table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schedule_instances (
        id TEXT PRIMARY KEY,
        commitmentId TEXT NOT NULL,
        weekId TEXT NOT NULL,
        dayIndex INTEGER NOT NULL,
        startTime TEXT,
        endTime TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (commitmentId) REFERENCES commitments(id)
      )
    `);

    // Completions tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS completions (
        id TEXT PRIMARY KEY,
        instanceId TEXT NOT NULL,
        weekId TEXT NOT NULL,
        dayIndex INTEGER NOT NULL,
        completed BOOLEAN DEFAULT 0,
        completionTime DATETIME,
        actualDuration INTEGER,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(instanceId, weekId),
        FOREIGN KEY (instanceId) REFERENCES schedule_instances(id)
      )
    `);

    // Progress/Advancements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS progress_tracking (
        id TEXT PRIMARY KEY,
        commitmentId TEXT NOT NULL,
        weekId TEXT NOT NULL,
        totalScheduled INTEGER DEFAULT 0,
        totalCompleted INTEGER DEFAULT 0,
        completionRate REAL DEFAULT 0,
        consistencyScore INTEGER DEFAULT 0,
        streakDays INTEGER DEFAULT 0,
        longestStreak INTEGER DEFAULT 0,
        lastCompletedDate DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(commitmentId, weekId),
        FOREIGN KEY (commitmentId) REFERENCES commitments(id)
      )
    `);

    // Statistics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS statistics (
        id TEXT PRIMARY KEY,
        commitmentId TEXT NOT NULL,
        totalCompletions INTEGER DEFAULT 0,
        totalAllotted INTEGER DEFAULT 0,
        averageCompletionRate REAL DEFAULT 0,
        mostProductiveDay INTEGER,
        totalTimeSpent INTEGER DEFAULT 0,
        recordStreak INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(commitmentId),
        FOREIGN KEY (commitmentId) REFERENCES commitments(id)
      )
    `);

    // Daily notes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_notes (
        id TEXT PRIMARY KEY,
        weekId TEXT NOT NULL,
        dayIndex INTEGER NOT NULL,
        notes TEXT,
        dayStatus TEXT,
        mood INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(weekId, dayIndex)
      )
    `);

    // Backup history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS backups (
        id TEXT PRIMARY KEY,
        backupDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        backupPath TEXT,
        description TEXT,
        dataCount INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Commitment/Template operations
  addCommitment(commitment) {
    const stmt = this.db.prepare(`
      INSERT INTO commitments (id, name, category, icon, color, defaultDuration, description, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      commitment.id,
      commitment.name,
      commitment.category || "",
      commitment.icon || "",
      commitment.color || "",
      commitment.defaultDuration || 60,
      commitment.description || "",
    );
  }

  updateCommitment(id, updates) {
    const stmt = this.db.prepare(`
      UPDATE commitments 
      SET name = ?, category = ?, icon = ?, color = ?, defaultDuration = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      updates.name,
      updates.category || "",
      updates.icon || "",
      updates.color || "",
      updates.defaultDuration || 60,
      updates.description || "",
      id,
    );
  }

  deleteCommitment(id) {
    const stmt = this.db.prepare("DELETE FROM commitments WHERE id = ?");
    stmt.run(id);
  }

  getCommitments() {
    const stmt = this.db.prepare(
      "SELECT * FROM commitments ORDER BY createdAt DESC",
    );
    return stmt.all();
  }

  getCommitment(id) {
    const stmt = this.db.prepare("SELECT * FROM commitments WHERE id = ?");
    return stmt.get(id);
  }

  // Schedule instance operations
  addScheduleInstance(instance) {
    const stmt = this.db.prepare(`
      INSERT INTO schedule_instances (id, commitmentId, weekId, dayIndex, startTime, endTime, notes, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      instance.id,
      instance.commitmentId,
      instance.weekId,
      instance.dayIndex,
      instance.startTime || "",
      instance.endTime || "",
      instance.notes || "",
    );
  }

  updateScheduleInstance(id, updates) {
    const stmt = this.db.prepare(`
      UPDATE schedule_instances
      SET startTime = ?, endTime = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      updates.startTime || "",
      updates.endTime || "",
      updates.notes || "",
      id,
    );
  }

  getScheduleInstancesForWeek(weekId) {
    const stmt = this.db.prepare(`
      SELECT * FROM schedule_instances 
      WHERE weekId = ? 
      ORDER BY dayIndex, startTime
    `);
    return stmt.all(weekId);
  }

  getScheduleInstancesForDay(weekId, dayIndex) {
    const stmt = this.db.prepare(`
      SELECT * FROM schedule_instances 
      WHERE weekId = ? AND dayIndex = ? 
      ORDER BY startTime
    `);
    return stmt.all(weekId, dayIndex);
  }

  deleteScheduleInstance(id) {
    const stmt = this.db.prepare("DELETE FROM schedule_instances WHERE id = ?");
    stmt.run(id);
  }

  // Completion tracking operations
  markCompletion(completion) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO completions 
      (id, instanceId, weekId, dayIndex, completed, completionTime, actualDuration, notes, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      completion.id,
      completion.instanceId,
      completion.weekId,
      completion.dayIndex,
      completion.completed ? 1 : 0,
      completion.completionTime || null,
      completion.actualDuration || null,
      completion.notes || "",
    );
  }

  getCompletionsForWeek(weekId) {
    const stmt = this.db.prepare(`
      SELECT * FROM completions WHERE weekId = ? ORDER BY dayIndex, completionTime
    `);
    return stmt.all(weekId);
  }

  getCompletionStats(commitmentId, weekId = null) {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
      FROM completions c
      JOIN schedule_instances si ON c.instanceId = si.id
      WHERE si.commitmentId = ?
    `;
    const params = [commitmentId];

    if (weekId) {
      query += " AND c.weekId = ?";
      params.push(weekId);
    }

    const stmt = this.db.prepare(query);
    return stmt.get(...params);
  }

  // Progress tracking operations
  updateProgress(progress) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO progress_tracking
      (id, commitmentId, weekId, totalScheduled, totalCompleted, completionRate, consistencyScore, streakDays, longestStreak, lastCompletedDate, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      progress.id,
      progress.commitmentId,
      progress.weekId,
      progress.totalScheduled || 0,
      progress.totalCompleted || 0,
      progress.completionRate || 0,
      progress.consistencyScore || 0,
      progress.streakDays || 0,
      progress.longestStreak || 0,
      progress.lastCompletedDate || null,
    );
  }

  getProgress(commitmentId, weekId) {
    const stmt = this.db.prepare(`
      SELECT * FROM progress_tracking WHERE commitmentId = ? AND weekId = ?
    `);
    return stmt.get(commitmentId, weekId);
  }

  getProgressForCommitment(commitmentId) {
    const stmt = this.db.prepare(`
      SELECT * FROM progress_tracking WHERE commitmentId = ? ORDER BY weekId DESC LIMIT 12
    `);
    return stmt.all(commitmentId);
  }

  // Statistics operations
  updateStatistics(stats) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO statistics
      (id, commitmentId, totalCompletions, totalAllotted, averageCompletionRate, mostProductiveDay, totalTimeSpent, recordStreak, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      stats.id,
      stats.commitmentId,
      stats.totalCompletions || 0,
      stats.totalAllotted || 0,
      stats.averageCompletionRate || 0,
      stats.mostProductiveDay || null,
      stats.totalTimeSpent || 0,
      stats.recordStreak || 0,
    );
  }

  getStatistics(commitmentId) {
    const stmt = this.db.prepare(
      "SELECT * FROM statistics WHERE commitmentId = ?",
    );
    return stmt.get(commitmentId);
  }

  getAllStatistics() {
    const stmt = this.db.prepare(
      "SELECT * FROM statistics ORDER BY averageCompletionRate DESC",
    );
    return stmt.all();
  }

  // Daily notes operations
  saveDailyNote(note) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_notes
      (id, weekId, dayIndex, notes, dayStatus, mood, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      note.id,
      note.weekId,
      note.dayIndex,
      note.notes || "",
      note.dayStatus || "",
      note.mood || null,
    );
  }

  getDailyNote(weekId, dayIndex) {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_notes WHERE weekId = ? AND dayIndex = ?
    `);
    return stmt.get(weekId, dayIndex);
  }

  getWeeklyNotes(weekId) {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_notes WHERE weekId = ? ORDER BY dayIndex
    `);
    return stmt.all(weekId);
  }

  // Backup operations
  createBackup(backupInfo) {
    const stmt = this.db.prepare(`
      INSERT INTO backups (id, backupPath, description, dataCount, backupDate)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      backupInfo.id,
      backupInfo.backupPath,
      backupInfo.description || "",
      backupInfo.dataCount || 0,
    );
  }

  getBackupHistory() {
    const stmt = this.db.prepare(`
      SELECT * FROM backups ORDER BY backupDate DESC LIMIT 20
    `);
    return stmt.all();
  }

  // Export all data
  exportAllData() {
    const commitments = this.db.prepare("SELECT * FROM commitments").all();
    const instances = this.db.prepare("SELECT * FROM schedule_instances").all();
    const completions = this.db.prepare("SELECT * FROM completions").all();
    const progress = this.db.prepare("SELECT * FROM progress_tracking").all();
    const statistics = this.db.prepare("SELECT * FROM statistics").all();
    const notes = this.db.prepare("SELECT * FROM daily_notes").all();

    return {
      commitments,
      instances,
      completions,
      progress,
      statistics,
      notes,
      exportDate: new Date().toISOString(),
    };
  }

  // Import data
  importData(data) {
    try {
      this.db.prepare("DELETE FROM completions").run();
      this.db.prepare("DELETE FROM schedule_instances").run();
      this.db.prepare("DELETE FROM progress_tracking").run();
      this.db.prepare("DELETE FROM statistics").run();
      this.db.prepare("DELETE FROM daily_notes").run();
      this.db.prepare("DELETE FROM commitments").run();

      if (data.commitments && Array.isArray(data.commitments)) {
        const insertCommitment = this.db.prepare(`
          INSERT INTO commitments (id, name, category, icon, color, defaultDuration, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of data.commitments) {
          insertCommitment.run(
            c.id,
            c.name,
            c.category,
            c.icon,
            c.color,
            c.defaultDuration,
            c.description,
          );
        }
      }

      return { success: true, message: "Data imported successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;
