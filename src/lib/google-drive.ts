// ============================================
// Google Drive Sync
// ============================================
// Syncs app data to Google Drive's appData folder as JSON backup.
// Uses last-write-wins conflict resolution with timestamps.

import { db } from './db';
import { getAccessToken } from './google-auth';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_FILENAME = 'sris-day-backup.json';

/** Get headers with authorization */
function getHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** Find the backup file in appData folder */
async function findBackupFile(): Promise<string | null> {
  try {
    const response = await fetch(
      `${DRIVE_API}/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,modifiedTime)`,
      { headers: getHeaders() }
    );
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding backup file:', error);
    return null;
  }
}

/** Export all data from IndexedDB to a JSON object */
export async function exportAllData(): Promise<object> {
  const [tasks, taskLists, habits, habitLogs, notes, goals, milestones, timerSessions, tags, settings] =
    await Promise.all([
      db.tasks.toArray(),
      db.taskLists.toArray(),
      db.habits.toArray(),
      db.habitLogs.toArray(),
      db.notes.toArray(),
      db.goals.toArray(),
      db.milestones.toArray(),
      db.timerSessions.toArray(),
      db.tags.toArray(),
      db.settings.toArray(),
    ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks,
    taskLists,
    habits,
    habitLogs,
    notes,
    goals,
    milestones,
    timerSessions,
    tags,
    settings,
  };
}

/** Import data from a JSON object into IndexedDB */
export async function importAllData(data: Record<string, unknown>): Promise<void> {
  // Validate basic structure
  if (!data.version || !data.tasks) {
    throw new Error('Invalid backup format');
  }

  // Clear existing data
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
  ]);

  // Import all data
  const d = data as Record<string, unknown[]>;
  await Promise.all([
    d.tasks?.length ? db.tasks.bulkPut(d.tasks as never[]) : Promise.resolve(),
    d.taskLists?.length ? db.taskLists.bulkPut(d.taskLists as never[]) : Promise.resolve(),
    d.habits?.length ? db.habits.bulkPut(d.habits as never[]) : Promise.resolve(),
    d.habitLogs?.length ? db.habitLogs.bulkPut(d.habitLogs as never[]) : Promise.resolve(),
    d.notes?.length ? db.notes.bulkPut(d.notes as never[]) : Promise.resolve(),
    d.goals?.length ? db.goals.bulkPut(d.goals as never[]) : Promise.resolve(),
    d.milestones?.length ? db.milestones.bulkPut(d.milestones as never[]) : Promise.resolve(),
    d.timerSessions?.length ? db.timerSessions.bulkPut(d.timerSessions as never[]) : Promise.resolve(),
    d.tags?.length ? db.tags.bulkPut(d.tags as never[]) : Promise.resolve(),
  ]);

  // Import settings (merge, don't replace)
  if (d.settings && Array.isArray(d.settings) && d.settings.length > 0) {
    await db.settings.put(d.settings[0] as never);
  }
}

/** Sync data TO Google Drive */
export async function syncToGoogleDrive(): Promise<void> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const data = await exportAllData();
  const content = JSON.stringify(data);

  // Check if backup file already exists
  const existingFileId = await findBackupFile();

  if (existingFileId) {
    // Update existing file
    await fetch(`${UPLOAD_API}/files/${existingFileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });
  } else {
    // Create new file in appData folder
    const metadata = {
      name: BACKUP_FILENAME,
      parents: ['appDataFolder'],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: 'application/json' }));

    await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
  }
}

/** Sync data FROM Google Drive */
export async function syncFromGoogleDrive(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const fileId = await findBackupFile();
  if (!fileId) return false;

  const response = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  await importAllData(data);
  return true;
}
