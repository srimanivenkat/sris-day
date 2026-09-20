'use client';

// ============================================
// Settings Page
// ============================================
// App settings: profile, theme, notifications, data management, sync

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Bell,
  Timer,
  Database,
  Cloud,
  LogOut,
  LogIn,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSyncStore } from '@/stores/sync-store';
import { useTimerStore } from '@/stores/timer-store';
import { exportAsJSON, exportTasksAsCSV, importFromJSON } from '@/lib/export';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import { db } from '@/lib/db';

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const { user, isGuest, signInWithGoogle, signOut, error: authError } = useAuthStore();
  const { isSyncing, lastSyncAt, syncToGoogleDrive, syncFromGoogleDrive, syncError, syncSuccess } = useSyncStore();
  const { config, updateConfig } = useTimerStore();

  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      await exportAsJSON();
      setExportStatus('Data exported successfully!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus('Export failed');
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportTasksAsCSV();
      setExportStatus('Tasks exported as CSV!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus('Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importFromJSON(file);
      setImportStatus('Data imported successfully! Refresh to see changes.');
      setTimeout(() => setImportStatus(null), 5000);
    } catch {
      setImportStatus('Import failed: Invalid file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone.')) return;
    if (!confirm('This will permanently delete all tasks, habits, notes, goals, and settings. Continue?')) return;

    await Promise.all([
      db.tasks.clear(),
      db.taskLists.clear(),
      db.habits.clear(),
      db.habitLogs.clear(),
      db.notes.clear(),
      db.goals.clear(),
      db.milestones.clear(),
      db.timerSessions.clear(),
      db.tags.clear(),
      db.settings.clear(),
    ]);

    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and data
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGuest || !user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Guest Mode</p>
                <p className="text-sm text-muted-foreground">
                  Sign in with Google to sync your data across devices
                </p>
              </div>
              <Button onClick={signInWithGoogle}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
          {authError && (
            <div className="flex items-center gap-2 text-sm text-destructive mt-3 p-2 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) =>
                setTheme(checked ? 'dark' : 'light')
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get reminders for tasks and habits
              </p>
            </div>
            <Switch
              onCheckedChange={async (checked) => {
                if (checked) {
                  const { requestNotificationPermission } = await import('@/lib/notifications');
                  await requestNotificationPermission();
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" />
            Timer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Work Duration (min)</Label>
              <Input
                type="number"
                value={config.workDuration}
                onChange={(e) =>
                  updateConfig({ workDuration: parseInt(e.target.value) || 25 })
                }
                min={5}
                max={90}
              />
            </div>
            <div>
              <Label>Short Break (min)</Label>
              <Input
                type="number"
                value={config.shortBreakDuration}
                onChange={(e) =>
                  updateConfig({
                    shortBreakDuration: parseInt(e.target.value) || 5,
                  })
                }
                min={1}
                max={30}
              />
            </div>
            <div>
              <Label>Long Break (min)</Label>
              <Input
                type="number"
                value={config.longBreakDuration}
                onChange={(e) =>
                  updateConfig({
                    longBreakDuration: parseInt(e.target.value) || 15,
                  })
                }
                min={5}
                max={60}
              />
            </div>
            <div>
              <Label>Sessions Before Long Break</Label>
              <Input
                type="number"
                value={config.sessionsBeforeLongBreak}
                onChange={(e) =>
                  updateConfig({
                    sessionsBeforeLongBreak: parseInt(e.target.value) || 4,
                  })
                }
                min={2}
                max={8}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound</p>
              <p className="text-sm text-muted-foreground">
                Play sound when timer ends
              </p>
            </div>
            <Switch
              checked={config.soundEnabled}
              onCheckedChange={(checked) =>
                updateConfig({ soundEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Data Management
          </CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {exportStatus && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" />
              {exportStatus}
            </div>
          )}

          {importStatus && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <AlertCircle className="h-4 w-4" />
              {importStatus}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Clear All Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="h-4 w-4" />
            Cloud Sync
          </CardTitle>
          <CardDescription>
            Sync your data to Google Drive for backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGuest ? (
            <p className="text-sm text-muted-foreground">
              Sign in with Google to enable cloud sync
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    Last synced:{' '}
                    {lastSyncAt
                      ? new Date(lastSyncAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <Badge variant={isSyncing ? 'default' : 'secondary'}>
                  {isSyncing ? 'Syncing...' : 'Idle'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncToGoogleDrive}
                  disabled={isSyncing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Backup to Drive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncFromGoogleDrive}
                  disabled={isSyncing}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Restore from Drive
                </Button>
              </div>

              {syncSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-500 p-2 bg-green-500/10 rounded-md">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{syncSuccess}</span>
                </div>
              )}

              {syncError && (
                <div className="flex items-center gap-2 text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">
              Version {APP_VERSION}
            </p>
            <p className="text-sm text-muted-foreground">
              Your personal productivity companion
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Built with Next.js, React, Tailwind CSS, and IndexedDB
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
