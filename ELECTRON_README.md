# Schedule App - Desktop Edition

A beautiful, feature-rich scheduling application built with React, Vite, and Electron.

## Features

✨ **Core Features:**

- 📅 Weekly calendar view with drag-and-drop
- 🎨 Light/Dark mode toggle
- 📦 Reusable commitment templates
- ⏰ Per-day timing configuration
- 🎯 Priority-based color coding
- 💾 Local data persistence
- 📁 Full file system access (Electron only)

✨ **Electron Features:**

- 🖥️ Native desktop application
- 📂 Save schedules to Documents/Schedule App/
- 📋 Built-in schedule library management
- 💿 Cross-platform support (Windows, macOS, Linux)

## Installation

```bash
# Install dependencies
npm install

# Install Electron and related packages
npm install --save-dev electron electron-builder electron-is-dev concurrently wait-on
```

## Development

```bash
# Run web version (Vite dev server)
npm run dev

# Run desktop version (Electron + Vite with hot reload)
npm run dev:electron

# Build for production
npm run build

# Build Electron installer
npm run electron:build
```

## How to Use

### Web Version

1. Click **"Export"** to download your schedule as JSON
2. Click **"Import"** to load a previously saved JSON file
3. Use **"Library"** button for import/export management

### Electron Version

1. Use **"Library"** button to access the full schedule library
2. **Save Current Schedule** - Enter a name and save to your Documents
3. **Load Schedule** - Click "Load" on any saved schedule
4. **Delete Schedule** - Remove schedules you no longer need

### File Storage Location

All schedules are saved to: `Documents/Schedule App/`

## Features Guide

### Templates (Building Blocks)

- Create reusable commitment templates
- Set priority (Critical, Important, Regular)
- Assign colors for easy identification
- Define default time ranges

### Weekly Calendar

- Drag templates onto any day
- Blocks scale by duration (height = minutes × 2px)
- Click clock icon to adjust timing for specific day
- Toggle "Update all instances" for global changes

### Day Properties

- Set available time for each day
- View commitments within available hours
- Customize daily schedules

### Theme

- Click sun/moon icon to toggle light/dark mode
- Settings persist automatically

## Storage Details

**Browser Version:**

- localStorage for data persistence
- Download/Upload via browser dialogs

**Electron Version:**

- Full file system access to Documents
- Persistent local file storage
- Schedule library with metadata

## Building for Distribution

To create an installer:

```bash
npm run electron:build
```

This creates:

- NSIS installer (for Windows)
- Portable executable
- Ready for distribution

## Technologies

- **React** 18.2.0 - UI Framework
- **Vite** 4.5.14 - Fast build tool
- **Tailwind CSS** 3.3.0 - Styling
- **Electron** 28.0.0 - Desktop app framework
- **Electron Builder** 24.6.4 - Installer generation

## License

MIT

## Support

For issues or feature requests, please check the application logs or create an issue in the repository.
