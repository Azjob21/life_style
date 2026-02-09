# Electron Desktop App - Quick Start Guide

## What Was Done

Your React scheduling app has been successfully converted into an **Electron desktop application**!

### Changes Made:

1. **Electron Setup**
   - ✅ Created `electron/main.cjs` - Main process for window management
   - ✅ Created `electron/preload.cjs` - Secure IPC communication
   - ✅ Created `src/utils/electronAPI.js` - API bridge for file operations
   - ✅ Created `src/components/StorageManager.jsx` - Schedule library UI

2. **Package Configuration**
   - ✅ Updated `package.json` with Electron scripts and build config
   - ✅ Added npm scripts for development and building

3. **File System Access**
   - ✅ Full read/write access to `Documents/Schedule App/`
   - ✅ Save/load/delete schedule files
   - ✅ List saved schedules with metadata

## Running the App

### Option 1: Web Version (Browser)

```bash
npm run dev
```

- Opens at http://localhost:3000
- Uses browser's Download/Upload dialogs
- Data stored in localStorage

### Option 2: Desktop Version (Electron)

```bash
npm run dev:electron
```

- Launches native Electron window
- Full file system access
- Schedule library management
- Same React app, but with desktop features

### Build for Distribution

```bash
npm run electron:build
```

- Creates Windows installer (NSIS)
- Creates portable .exe
- Ready to distribute

## Key Features in Desktop App

### 📚 Schedule Library

- **Save:** Click "Library" → Enter filename → Click "Save"
- **Load:** Select from list → Click "Load"
- **Delete:** Remove unwanted schedules
- **Location:** `Documents/Schedule App/` folder

### 💾 Storage Hierarchy

```
Documents/
  └── Schedule App/
      ├── Week1.json
      ├── Q1-Plan.json
      └── ...
```

### 🔐 Security

- Electron's context isolation enabled
- No direct `require()` in renderer process
- Safe IPC communication via preload bridge
- No sensitive data in localStorage

## File Structure

```
life_style/
├── electron/
│   ├── main.cjs           # Electron main process
│   └── preload.cjs        # IPC preload script
├── src/
│   ├── components/
│   │   ├── StorageManager.jsx  # NEW - Schedule library UI
│   │   └── ...
│   ├── utils/
│   │   └── electronAPI.js      # NEW - File API bridge
│   └── App.jsx
├── package.json           # Updated with Electron config
├── vite.config.js         # Updated for Electron
└── ELECTRON_README.md     # Full documentation
```

## IPC Handlers Available

From your React app, you can use:

```javascript
// Save a file
await window.electronAPI.saveFile("filename.json", jsonContent);

// Load a file
const data = await window.electronAPI.loadFile("filename.json");

// List all saved files
const files = await window.electronAPI.listSavedFiles();

// Delete a file
await window.electronAPI.deleteFile("filename.json");

// Get app version
const version = await window.electronAPI.getAppVersion();
```

## Next Steps

1. **Test Dev Mode:** Run `npm run dev:electron`
2. **Test Features:** Create templates, schedules, save/load
3. **Build Installer:** Run `npm run electron:build` when ready
4. **Distribute:** Share the `.exe` or installer

## Troubleshooting

**Dev server won't start?**

- Kill existing Vite process: `taskkill /F /IM node.exe`
- Run `npm install` again

**Electron window shows blank?**

- Check console logs (DevTools opens automatically in dev)
- Ensure port 3000 is available

**Files not saving?**

- Check Documents folder permissions
- Verify `Schedule App` folder is created in Documents

**Build errors?**

- Run `npm run build` first
- Check that `dist/` folder is created
- Ensure Node.js version is recent (14+)

## Development Tips

- **Hot Reload:** Changes to React code auto-reload in Electron window
- **DevTools:** Press F12 or look for DevTools window
- **Inspect Element:** Right-click → Inspect (when DevTools open)
- **Main Process Logs:** Check terminal output

## Build Options

### Windows Distribution

```bash
# Creates NSIS installer + portable exe
npm run electron:build
```

### All Platforms (with cross-platform support)

```bash
# May require additional setup
npm run electron:build -- --publish never
```

## Environment Detection

Your app automatically detects environment:

```javascript
import { isElectron } from "./utils/electronAPI";

if (isElectron()) {
  // Desktop features available
  // File system access enabled
} else {
  // Browser features
  // Download/Upload only
}
```

---

**Your app is now ready to be used as a native desktop application!** 🎉

Questions? Check the Electron docs: https://www.electronjs.org/docs
