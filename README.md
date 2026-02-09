# Commit - React App

A modern React-based weekly commitment tracker that allows you to visualize and manage your commitments across the week.

## Project Structure

```
life_style/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Sidebar with stats and commitment list
│   │   ├── WeeklyCalendar.jsx    # 7-day grid view
│   │   ├── Dashboard.jsx         # Active commitments dashboard
│   │   └── CommitmentModal.jsx   # Add/Edit commitment modal
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
└── postcss.config.js            # PostCSS config
```

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Features

- ✅ **Weekly Calendar Grid** - 7 days displayed horizontally
- ✅ **Add/Edit Commitments** - Create project blocks with full customization
- ✅ **Color Coding** - 7 vibrant colors for visual distinction
- ✅ **Time Blocks** - Set start/end times for each commitment
- ✅ **Priority Levels** - Low, Medium, High priority tracking
- ✅ **Day Selection** - Assign commitments to specific days
- ✅ **Dashboard View** - Overview of all active commitments
- ✅ **LocalStorage** - Automatic persistence between sessions
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Modern UI** - Tailwind CSS + Glass morphism effects

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **Font Awesome** - Icons
- **LocalStorage** - Data persistence

## How to Use

1. Click **"New Commitment"** to add a commitment
2. Fill in the commitment details (name, days, time, priority)
3. Select colors to visualize different projects
4. Save - instantly appears on your weekly calendar
5. Click any commitment block to edit or delete
6. Use "Reset Week" to clear all commitments

Enjoy your commitment tracker! 👊
