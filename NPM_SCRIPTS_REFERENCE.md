# npm Scripts Reference

## Available Commands

### Development

```bash
npm run dev
```

- Starts Vite dev server on http://localhost:3000
- Browser-only version
- Hot module replacement enabled
- Perfect for web development

```bash
npm run dev:electron
```

- Starts Vite dev server + Electron window
- Automatically waits for server (port 3000)
- Launches native desktop app window
- DevTools open automatically
- **This is the main command for desktop development**

### Building

```bash
npm run build
```

- Production build of React app
- Outputs to `dist/` folder
- Minified and optimized
- ~40 KB HTML, ~31 KB CSS, ~176 KB JS (gzipped)

```bash
npm run electron:build
```

- Builds React app
- Creates Electron installer (NSIS)
- Creates portable .exe
- Ready for distribution to end users
- **Requires `npm run build` first (automatically done)**

### Preview

```bash
npm run preview
```

- Preview production build locally
- Runs on http://localhost:4173
- Does NOT include Electron

---

## Quick Command Reference

| Task              | Command                  | Notes                               |
| ----------------- | ------------------------ | ----------------------------------- |
| **Web Dev**       | `npm run dev`            | Browser only, http://localhost:3000 |
| **Desktop Dev**   | `npm run dev:electron`   | Full Electron app with hot reload   |
| **Build Web**     | `npm run build`          | Production React build              |
| **Build Desktop** | `npm run electron:build` | Create Windows installer            |
| **Preview Web**   | `npm run preview`        | Test production build               |

---

## Development Workflow

### For Web Version:

```bash
npm run dev
# Edit React files
# Changes auto-reload at http://localhost:3000
```

### For Electron Version:

```bash
npm run dev:electron
# Edit React files
# Changes auto-reload in Electron window
# Or close window and it restarts automatically
```

### When Ready to Release:

```bash
npm run electron:build
# Creates installer in dist/ folder
# Share the .exe or setup file with users
```

---

## Environment Detection

The app automatically detects which environment it's running in:

```javascript
import { isElectron } from "./src/utils/electronAPI";

if (isElectron()) {
  // Running in Electron desktop app
  // File system access available
  // Schedule library features enabled
} else {
  // Running in browser
  // Use localStorage only
  // Download/Upload features available
}
```

---

## Troubleshooting Commands

### Clear everything and start fresh:

```bash
# On Windows PowerShell:
rm -Force node_modules -ErrorAction SilentlyContinue
rm -Force dist -ErrorAction SilentlyContinue
npm install
npm run dev:electron
```

### Kill stuck processes:

```bash
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Check if port 3000 is available:

```bash
netstat -ano | findstr :3000
```

### Full rebuild:

```bash
npm install
npm run build
npm run electron:build
```

---

## Performance Tips

1. **Use `npm run dev:electron`** during development
   - Faster hot reload
   - Better debugging experience

2. **Close DevTools** when not debugging
   - Slightly better performance
   - Open with F12

3. **Build only when ready**
   - Building is slower than hot reload
   - Use dev mode for most development

4. **Clear cache if issues occur**
   ```bash
   rm -Force node_modules/.cache -ErrorAction SilentlyContinue
   npm install
   ```

---

## GitHub/Distribution Ready

Once you run `npm run electron:build`, the output in `dist/` folder is ready to:

- Upload to GitHub Releases
- Share via email
- Host on a website
- Distribute via installer

Users can download and install like any Windows application.

---

## Script Breakdown

**In package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "vite build",
    "electron:build": "npm run build && electron-builder",
    "preview": "vite preview"
  }
}
```

- `dev` - Start Vite server
- `dev:electron` - Start Vite + wait for server + launch Electron
- `build` - Build React app with Vite
- `electron:build` - Build React + create installer
- `preview` - Preview production build

---

Remember: **Most development happens with `npm run dev:electron`!**
