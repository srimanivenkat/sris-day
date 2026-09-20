// ============================================
// Data Export Utilities
// ============================================
// Export app data as JSON, CSV, or PDF

import { exportAllData } from './google-drive';

/** Export all data as a JSON file download */
export async function exportAsJSON(): Promise<void> {
  const data = await exportAllData();
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'sris-day-backup.json', 'application/json');
}

/** Export tasks as CSV file download */
export async function exportTasksAsCSV(): Promise<void> {
  const { db } = await import('./db');
  const tasks = await db.tasks.toArray();
  const taskLists = await db.taskLists.toArray();

  const listMap = new Map(taskLists.map((l) => [l.id, l.name]));

  // CSV header
  const headers = [
    'Title',
    'Description',
    'List',
    'Priority',
    'Status',
    'Due Date',
    'Due Time',
    'Tags',
    'Created',
    'Completed',
  ];

  // CSV rows
  const rows = tasks
    .filter((t) => !t.parentId) // Only top-level tasks
    .map((t) => [
      escapeCSV(t.title),
      escapeCSV(t.description),
      escapeCSV(listMap.get(t.listId) || 'Inbox'),
      t.priority,
      t.status,
      t.dueDate || '',
      t.dueTime || '',
      t.tags.join('; '),
      t.createdAt,
      t.completedAt || '',
    ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csv, 'sris-day-tasks.csv', 'text/csv');
}

/** Export habits as CSV */
export async function exportHabitsAsCSV(): Promise<void> {
  const { db } = await import('./db');
  const habits = await db.habits.toArray();
  const logs = await db.habitLogs.toArray();

  const headers = ['Habit', 'Date', 'Completed', 'Count'];
  const rows = logs.map((log) => {
    const habit = habits.find((h) => h.id === log.habitId);
    return [
      escapeCSV(habit?.name || 'Unknown'),
      log.date,
      log.completed ? 'Yes' : 'No',
      String(log.count),
    ];
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csv, 'sris-day-habits.csv', 'text/csv');
}

/** Import data from a JSON file */
export async function importFromJSON(file: File): Promise<void> {
  const { importAllData } = await import('./google-drive');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await importAllData(data);
        resolve();
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/** Escape a value for CSV format */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Trigger a file download in the browser */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
