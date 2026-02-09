const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Check if running in development mode
const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");

let mainWindow;

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

app.on("ready", createWindow);

app.on("window-all-closed", () => {
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
