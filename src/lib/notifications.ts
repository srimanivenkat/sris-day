// ============================================
// Push Notifications
// ============================================
// Browser push notifications for reminders, due tasks, and habit check-ins

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/** Show a browser notification */
export function showNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: unknown;
    requireInteraction?: boolean;
  }
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    ...options,
  });

  // Auto-close after 5 seconds unless requireInteraction is set
  if (!options?.requireInteraction) {
    setTimeout(() => notification.close(), 5000);
  }

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/** Show a task reminder notification */
export function showTaskReminder(taskTitle: string, dueTime?: string): void {
  showNotification('Task Reminder', {
    body: `${taskTitle}${dueTime ? ` — Due at ${dueTime}` : ''}`,
    tag: 'task-reminder',
  });
}

/** Show a habit reminder notification */
export function showHabitReminder(habitName: string): void {
  showNotification('Habit Check-in', {
    body: `Time to ${habitName}! Keep your streak going 🔥`,
    tag: 'habit-reminder',
  });
}

/** Show timer completion notification */
export function showTimerNotification(sessionType: string): void {
  const isWork = sessionType === 'work';
  showNotification(isWork ? 'Focus Session Complete! 🎉' : 'Break Over!', {
    body: isWork
      ? 'Great work! Take a break.'
      : 'Ready to focus again?',
    tag: 'timer',
    requireInteraction: true,
  });
}

/** Show daily summary notification */
export function showDailySummary(tasksCount: number, habitsCount: number): void {
  showNotification("Good Morning! ☀️ Here's your day", {
    body: `${tasksCount} tasks to do, ${habitsCount} habits to complete`,
    tag: 'daily-summary',
  });
}

/** Register the service worker for push notifications */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}
