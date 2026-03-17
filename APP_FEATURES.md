# LifeStyle App — Complete Feature List

> **Version:** 1.0.0  
> **Stack:** React 18 · Vite 4 · TailwindCSS 3 · Supabase · Font Awesome 7  
> **Platforms:** Web (Vercel) · PWA · Electron (Desktop)  
> **Last Updated:** February 17, 2026

---

## 1. Authentication & User Management

| Feature                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| Email/Password Sign-Up     | Register with email confirmation link                      |
| Email/Password Sign-In     | Secure login with Supabase Auth                            |
| Forgot/Reset Password      | Sends password reset link via Supabase                     |
| Session Persistence        | Auto-refresh tokens, session detection in URL              |
| Auth Loading Screen        | Spinner with 5-second safety timeout                       |
| Sign Out                   | Available from options menu and profile panel              |
| User-Scoped Data Isolation | All localStorage keys prefixed with user ID (`userId:key`) |
| Cross-Tab Auth Sync        | Auth state change listener reacts across browser tabs      |

---

## 2. Schedule Management

### 2.1 Weekly Calendar

| Feature                 | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| 7-Day Grid Layout       | Monday–Sunday columns (desktop) or stacked cards (mobile)            |
| Week Navigation         | Previous/Next buttons + **"Today" jump button**                      |
| Week Date Range         | Displays e.g. "Feb 10 – Feb 16, 2026"                                |
| Category Filter         | Filter visible blocks by category (all, training, content, general…) |
| Drag & Drop Scheduling  | Drag templates from sidebar onto day columns                         |
| Drop Zone Feedback      | Highlighted column on drag-over                                      |
| Dynamic Block Heights   | Height based on duration (0.8px/min, clamped 45–120px)               |
| Duration Badge          | Shows e.g. "⏱ 1h 30m" on each block                                  |
| Completion Toggle       | Mark blocks complete/incomplete — future days locked                 |
| Today Highlight         | Blue accent + "TODAY" badge on current day                           |
| Block Count Per Day     | "3 blocks" shown in day headers                                      |
| Edit Timing             | Clock icon opens TimingUpdateModal                                   |
| Remove Block            | Delete instance from a day (with undo toast)                         |
| Color-Coded Blocks      | Styled by template color with strikethrough on completed             |
| Template Legend         | Bottom section showing all template colors + names                   |
| Time Conflict Detection | Warning toast when a new block overlaps existing times               |
| Mobile Touch Reorder    | Grip handle to drag-reorder blocks within a day                      |
| Responsive Mobile View  | Stacked cards with always-visible action buttons                     |

### 2.2 Day View (Full-Screen Modal)

| Feature              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| Detailed Day Modal   | Full-screen view of a single day's schedule                  |
| Block Notes          | Add/edit sticky notes per individual schedule block          |
| Day Journal          | Free-text textarea for daily reflections, auto-saves on blur |
| Day Performance      | "MARK AS HIT" / "TARGET HIT" button to flag the day          |
| Copy Day Schedule    | Copy all blocks from the current day to any other day        |
| Complete/Remove/Edit | All block actions available from within the modal            |
| Motivational Footer  | Inspirational quote at the bottom                            |

---

## 3. Commitment Template System

| Feature                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| Create Templates        | Name, description, color (7 options), priority, default times |
| Edit / Delete Templates | Full CRUD with confirmation + undo toast                      |
| Template Categories     | training, content, general — used for filtering/stats         |
| Priority Levels         | High (Critical), Medium (Important), Low (Regular)            |
| Sidebar Library         | Grouped by priority with colored borders                      |
| Drag to Schedule        | Drag templates from sidebar onto the calendar                 |
| Usage Tracking          | Training templates show "✓ Used" badge when scheduled         |
| Sidebar Stats           | Total, critical, and important template counts                |
| Timing Update Modal     | Edit start/end time with "update all instances" option        |

---

## 4. Training Studio

| Feature                  | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| Program Builder          | Create named programs with color, type, days-per-week, default time            |
| Program Days             | Each day has a label, muscle groups, and exercises                             |
| Muscle Group Presets     | Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Glutes, Full Body, Cardio |
| Exercise Presets         | Pre-populated exercises per muscle group (Bench Press, Squats, etc.)           |
| Custom Exercises         | Add custom exercises with name, sets, reps, muscle group                       |
| Edit / Delete Programs   | Full CRUD for training programs                                                |
| Program Detail View      | Expanded view of days and exercises                                            |
| Apply to Schedule        | Creates commitment template + schedule instances automatically                 |
| Body / Physical Tracking | Log physical measurements over time                                            |
| Training Log             | Gym session history stored per user                                            |

---

## 5. Content Studio

| Feature              | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Content Plan Builder | Create plans with duration (weekly/biweekly/monthly/custom) and color                        |
| 8 Platform Support   | YouTube, TikTok, Instagram, X/Twitter, LinkedIn, Blog, Podcast, Newsletter                   |
| 10 Content Types     | Video, Short/Reel, Post, Story, Article, Thread, Carousel, Live, Podcast Episode, Newsletter |
| Content Item Manager | Add items with title, platform, type, description, day, time slot, status, notes             |
| 7-Stage Workflow     | Idea → Planned → Scripting → Recording → Editing → Scheduled → Published                     |
| Content Item Editor  | Modal-based editing for content items                                                        |
| Apply to Schedule    | Creates commitment instances from a content plan                                             |
| Edit / Delete Plans  | Full CRUD for content plans                                                                  |

---

## 6. Statistics & Analytics

### 6.1 Dashboard (Week Overview)

| Feature             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| Completion Rate     | Color-coded progress bar (red <50%, amber 50–79%, green 80%+)  |
| Time Tracked        | Completed hours vs. committed hours                            |
| Template Counts     | Total and active (used this week) template count               |
| Daily Bar Chart     | 7-bar visual with hover tooltips (completed/total per day)     |
| Day Streak          | Consecutive days with completions (fire icon, pulse animation) |
| Template Cards Grid | Usage frequency, color coding, day-of-use badges               |

### 6.2 Stats View

| Feature                  | Description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Current Streak Card      | Consecutive active days with fire icon                                                         |
| Weekly Completion        | Days with >50% completion                                                                      |
| Gym Sessions Count       | From training log, last 7 days                                                                 |
| Content Published        | Total completed content items                                                                  |
| Weekly Bar Chart         | Tall color-coded percentage bars per day                                                       |
| Dynamic Category Metrics | Progress bars automatically generated per template category                                    |
| System Health Status     | Green pulsing "OPERATIONAL" indicator                                                          |
| Weekly Summary Review    | Lists accomplished vs. missed blocks per day                                                   |
| Week Rating              | 🏆 Elite (90%+) · 💪 Strong (70%+) · 👍 Decent (50%+) · ⚠️ Needs Work (25%+) · 🔴 Reset (<25%) |

### 6.3 Habit Streaks (Long-Term)

| Feature            | Description                                    |
| ------------------ | ---------------------------------------------- |
| Cross-Week Streaks | Tracks consecutive weeks a habit was completed |
| Longest Streak     | Per-habit all-time record                      |
| All-Time Stats     | Total scheduled vs. completed per habit        |
| View Modes         | Streaks / Monthly / Heatmap toggle             |
| Weekly Snapshots   | Persistent weekly data snapshots               |

---

## 7. Goals & Targets

| Feature                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| Weekly Goals           | Create goals like "Train 4x this week" with target count |
| Auto Progress Tracking | Counts matching completed/scheduled instances            |
| Keyword Matching       | Goals filter by template name or category substring      |
| Visual Progress        | Progress display toward target                           |
| Add / Remove Goals     | With toast notifications                                 |

---

## 8. Progress & Achievements

| Feature               | Description                                   |
| --------------------- | --------------------------------------------- |
| Advancement Levels    | Per-commitment level progression from backend |
| Badge System          | Earn badges per commitment                    |
| Multi-Commitment Tabs | Switch between commitments to view progress   |
| Auto-Refresh          | Progress data refreshes every 30 seconds      |
| Manual Refresh        | Button to force data reload                   |

---

## 9. Search & Navigation

| Feature             | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| Global Search       | Search across templates, training programs, exercises, content plans   |
| Ctrl+K Shortcut     | Open search with keyboard                                              |
| Categorized Results | Icons per type (template, training, exercise, content)                 |
| Click-to-Navigate   | Selecting a result navigates to the relevant view                      |
| Navigation Tabs     | Timetable · Training · Content · Stats                                 |
| Mobile Hamburger    | Sidebar toggle for small screens                                       |
| Sidebar Collapse    | Desktop toggle (chevron button), persisted in localStorage             |
| Keyboard Shortcuts  | `Escape` close modals · `←`/`→` week nav · `T` today · `Ctrl+K` search |

---

## 10. Data Management (Import / Export / Backup)

### 10.1 Export Formats

| Data                       | JSON | CSV | PDF |
| -------------------------- | :--: | :-: | :-: |
| Weekly Schedule            |  ✅  | ✅  | ✅  |
| Commitment Templates       |  ✅  | ✅  |  —  |
| Training Programs          |  ✅  | ✅  |  —  |
| Content Plans              |  ✅  | ✅  |  —  |
| Statistics Report          |  —   | ✅  | ✅  |
| **Full Backup (All Data)** |  ✅  |  —  |  —  |

### 10.2 Import

| Data                 | Format                                    |
| -------------------- | ----------------------------------------- |
| Weekly Schedule      | JSON                                      |
| Commitment Templates | JSON (with de-duplication)                |
| Training Programs    | JSON                                      |
| Content Plans        | JSON                                      |
| Full Backup Restore  | JSON (with confirmation before overwrite) |

### 10.3 Storage Manager

| Feature               | Description                                   |
| --------------------- | --------------------------------------------- |
| Named Schedule Saves  | Save current week with a custom filename      |
| Schedule File Browser | List, load, and delete saved schedules        |
| Electron File System  | Desktop: save/load/delete to local filesystem |
| Web Fallback          | Browser download/upload for web deployment    |

---

## 11. User Experience & Interface

| Feature            | Description                                             |
| ------------------ | ------------------------------------------------------- |
| Dark / Light Mode  | Toggle with sun/moon icon, persisted to localStorage    |
| Responsive Design  | Mobile-first with sm/md/lg breakpoints                  |
| Glassmorphism UI   | Backdrop blur, translucent cards, rounded corners       |
| Smooth Transitions | 300ms transform/color transitions throughout            |
| Hover Effects      | Scale, shadow, translate on interactive elements        |
| Hidden Scrollbars  | Custom scrollbar hiding across all browsers             |
| Gradient Accents   | Header and button gradients                             |
| Loading Spinners   | Animated SVG spinners for auth and data loading         |
| Text Truncation    | Ellipsis for long text on small screens                 |
| Options Menu       | Three-dot contextual dropdown (Export / Import / Tools) |

---

## 12. Toast / Notification System

| Feature            | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| 5 Toast Types      | Success (green), Error (red), Warning (amber), Info (blue), Undo (violet) |
| Auto-Dismiss       | 3s default, 6s for undo toasts                                            |
| Slide-In Animation | With exit fade + translate                                                |
| Undo Toasts        | "Undo" button to reverse delete/remove actions                            |
| Confirm Dialogs    | In-app confirm toast (replaces `window.confirm`)                          |
| Toast Stacking     | Multiple toasts stack vertically (top-right)                              |
| Manual Dismiss     | X button on each toast                                                    |
| Celebration Toasts | "Completed [block]!" and "🎉 ALL BLOCKS COMPLETE!"                        |
| Toast Context      | `useToast()` hook available app-wide                                      |

---

## 13. Reminders & Notifications

| Feature               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| In-App Reminders      | Checks every 60s for blocks starting within 30 minutes |
| Browser Notifications | OS-level push notifications for upcoming blocks        |
| Permission Request    | Button to request notification permission              |
| Dismissible Banners   | Dismiss individual reminders                           |
| Color-Coded           | Styled by template color                               |
| Countdown             | Shows "in X min" for upcoming blocks                   |

---

## 14. Onboarding Guide

| Feature              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| 3-Step Walkthrough   | 1. Create template → 2. Add to schedule → 3. Complete & track |
| Auto-Advancing Steps | Progresses as user performs actions                           |
| Progress Dots        | Visual step indicator                                         |
| Action Button        | "Create Template" CTA on step 1                               |
| Dismissible          | Permanently hidden once dismissed (persisted)                 |
| Pulse Animation      | Draws attention with CSS animation                            |

---

## 15. Recurring Schedule

| Feature              | Description                                  |
| -------------------- | -------------------------------------------- |
| Repeat Weekly Toggle | Empty weeks auto-populate from previous week |
| Unique Instance IDs  | Copied instances get re-keyed IDs            |
| Toast Notification   | "Recurring schedule applied from last week"  |
| Persisted Setting    | Stored per user in localStorage              |

---

## 16. Profile Panel

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| Profile Modal          | Gradient header with user avatar (first letter of email)       |
| Account Info           | Provider, join date, last sign-in, email verification          |
| User ID                | Monospace display, copyable                                    |
| Commitment Journey     | Days committed since account creation                          |
| Weekly Completion Rate | Percentage of this week's blocks completed                     |
| Data Summary           | Template count, scheduled/completed blocks, training templates |
| Sign Out               | Button in profile header                                       |

---

## 17. PWA & Offline Support

| Feature            | Description                          |
| ------------------ | ------------------------------------ |
| Web App Manifest   | Installable as standalone app        |
| Service Worker     | Registered on mount for caching      |
| Installable        | Add to home screen on mobile/desktop |
| Offline Capability | Service worker caching strategy      |

---

## 18. Error Handling & Resilience

| Feature              | Description                                       |
| -------------------- | ------------------------------------------------- |
| React Error Boundary | Wraps entire app, catches render errors           |
| Crash Recovery UI    | Error details + "Reload Page" button              |
| Error Logging        | Console error with component stack                |
| Try/Catch Guards     | Graceful fallbacks throughout data loading        |
| Backend Fallback     | Falls back to localStorage if Supabase calls fail |

---

## 19. Backend & Data Persistence

| Feature                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| Supabase Primary Backend | Auth, database, real-time                              |
| localStorage Fallback    | All data types mirrored locally                        |
| Dual-Write Strategy      | Data saved to both Supabase and localStorage           |
| Backend API Abstraction  | `useBackend()` hook wraps Supabase with consistent API |
| Electron Desktop Mode    | Optional file-system-based storage via better-sqlite3  |
| Week-Keyed Storage       | Data partitioned by week ID (`YYYY-WN`)                |

---

## 20. Tools & Utilities

| Feature                 | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| Clear Week Schedule     | Remove all instances + completions (with confirmation + undo)       |
| Template Manager        | Save week as reusable program template, load/delete saved templates |
| Time-to-Minutes Utility | Time arithmetic helper                                              |
| 7 Template Colors       | Red, Orange, Yellow, Green, Blue, Purple, Pink                      |
| Week Key Calculator     | ISO-style `YYYY-WN` format                                          |

---

## Summary Counts

| Category             | Count                                   |
| -------------------- | --------------------------------------- |
| **Total Features**   | **150+**                                |
| Components           | 22                                      |
| Views / Tabs         | 4 (Timetable, Training, Content, Stats) |
| Export Formats       | 11 (JSON + CSV + PDF combos)            |
| Import Formats       | 5                                       |
| Keyboard Shortcuts   | 5                                       |
| Toast Types          | 5                                       |
| Supported Platforms  | 8 (Content Studio)                      |
| Content Types        | 10                                      |
| Muscle Group Presets | 10                                      |

---

_Generated from source code analysis — LifeStyle App v1.0.0_
