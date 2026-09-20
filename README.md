# 🌅 Sri's Day

**Your personal productivity companion** — A full-featured, cross-platform Progressive Web App (PWA) for managing tasks, habits, notes, goals, and focused work sessions.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet?style=flat-square)

---

## ✨ Features

### Core Features
- **📋 Task Management** — Multiple task lists, drag & drop reordering, priorities (High/Medium/Low), subtasks, recurring tasks, due dates
- **📅 Scheduler** — Day and week views with time blocks, visual timeline
- **🔥 Habit Tracker** — Daily/weekly habits, streak counter, GitHub-style heatmap, stats
- **📝 Notes & Journaling** — Rich text editor (bold, italic, headers, code blocks), daily journal, scratch pad
- **🎯 Goal Setting** — SMART goals with milestones, progress tracking, linked tasks/habits
- **⏱️ Pomodoro Timer** — Customizable work/break sessions, session tracking, focus stats
- **📆 Calendar** — Monthly calendar view with tasks, Google Calendar integration
- **🔍 Global Search** — Search across all tasks, notes, goals, and habits

### Additional Features
- **🌙 Dark/Light Mode** — Toggle with smooth transitions (dark mode default)
- **📱 Responsive Design** — Desktop sidebar + mobile bottom navigation
- **💾 Offline-First** — Works without internet using IndexedDB (Dexie.js)
- **☁️ Google Drive Sync** — Backup and sync data across devices
- **🔔 Push Notifications** — Reminders for tasks, habits, and timer
- **📊 Dashboard Analytics** — Charts, stats, and productivity insights
- **⌨️ Keyboard Shortcuts** — Ctrl+K (search), Ctrl+N (new task), and more
- **📦 Data Export/Import** — JSON backup, CSV export
- **🔐 Google Sign-In** — OAuth 2.0 authentication (or guest mode)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
cd sris-day
npm install
```

### Step 2: Set Up Environment Variables (Optional)

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

> **Note:** Google API keys are optional. The app works fully in **Guest Mode** without them.

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 🔑 Google API Setup (Optional)

To enable Google Sign-In, Calendar sync, and Drive backup:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** → Name it "Sri's Day" → Create
3. Select the project

### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - **Google Drive API**
   - **Google Calendar API**
   - **Google People API**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: External
   - App name: Sri's Day
   - Support email: your email
   - Add scopes: `userinfo.email`, `userinfo.profile`, `drive.appdata`, `calendar`
4. Application type: **Web application**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
7. Copy the **Client ID**

### Step 4: Create API Key

1. Go to **Credentials** → **Create Credentials** → **API Key**
2. Restrict the key:
   - **Application restrictions**: HTTP referrers
   - Add `http://localhost:3000/*` and `https://your-app.vercel.app/*`
   - **API restrictions**: Restrict to Google Calendar API and Google Drive API

### Step 5: Add to Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
```

---

## 🌐 Deploy to Vercel (Free)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Sri's Day productivity app"
git remote add origin https://github.com/YOUR_USERNAME/sris-day.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Click **"New Project"**
3. Import your `sris-day` repository
4. Add environment variables:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`
5. Click **Deploy**
6. Your app is live at `https://sris-day.vercel.app` 🚀

### Step 3: Update Google OAuth

Don't forget to add your Vercel URL to Google Cloud Console:
- Authorized JavaScript origins: `https://sris-day.vercel.app`
- Authorized redirect URIs: `https://sris-day.vercel.app`

---

## 📱 Install as PWA

### On Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Click the install icon (➕) in the address bar
3. Click "Install"

### On Android
1. Open the app in Chrome
2. Tap the menu (⋮) → "Add to Home screen"
3. Tap "Install"

### On iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (⬆️)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

---

## 📁 Project Structure

```
sris-day/
├── public/
│   ├── icons/              # PWA app icons
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Dashboard
│   │   ├── tasks/          # Task management
│   │   ├── scheduler/      # Day/week scheduler
│   │   ├── habits/         # Habit tracker
│   │   ├── notes/          # Notes & journaling
│   │   ├── goals/          # Goal setting
│   │   ├── timer/          # Pomodoro timer
│   │   ├── calendar/       # Calendar view
│   │   ├── search/         # Global search
│   │   └── settings/       # App settings
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── layout/         # Sidebar, header, nav
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── tasks/          # Task components
│   │   ├── habits/         # Habit components
│   │   ├── notes/          # Note/editor components
│   │   ├── goals/          # Goal components
│   │   ├── timer/          # Timer components
│   │   ├── scheduler/      # Scheduler components
│   │   └── shared/         # Empty states, loading
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & APIs
│   │   ├── db.ts           # IndexedDB (Dexie.js)
│   │   ├── google-auth.ts  # Google OAuth
│   │   ├── google-drive.ts # Google Drive sync
│   │   ├── google-calendar.ts
│   │   ├── notifications.ts
│   │   ├── export.ts       # Data export/import
│   │   ├── utils.ts        # Utility functions
│   │   └── constants.ts    # App constants
│   ├── stores/             # Zustand state stores
│   └── types/              # TypeScript types
├── .env.local.example      # Environment template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` | Open search |
| `Ctrl + N` | New task |
| `Ctrl + Shift + N` | New note |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Space` | Start/pause timer (on timer page) |
| `1-8` | Navigate to sections |

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 3** | Utility-first styling |
| **shadcn/ui** | UI component system |
| **Zustand** | Lightweight state management |
| **Dexie.js** | IndexedDB wrapper (offline-first) |
| **Framer Motion** | Animations & transitions |
| **@hello-pangea/dnd** | Drag & drop |
| **Recharts** | Charts & analytics |
| **TipTap** | Rich text editor |
| **Lucide React** | Icon system |
| **Radix UI** | Accessible UI primitives |

---

## 📝 License

This project is for personal use. Built with ❤️ by Sri.
