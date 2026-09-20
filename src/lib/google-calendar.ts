// ============================================
// Google Calendar API Integration
// ============================================
// Read and write events to Google Calendar

import { getAccessToken } from './google-auth';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/** Google Calendar event structure */
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
  status: string;
}

/** List events for a given time range */
export async function listCalendarEvents(
  timeMin: string,
  timeMax: string,
  calendarId: string = 'primary'
): Promise<CalendarEvent[]> {
  const token = getAccessToken();
  if (!token) return [];

  try {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    });

    const response = await fetch(
      `${CALENDAR_API}/calendars/${calendarId}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      console.error('Calendar API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/** Create a new calendar event */
export async function createCalendarEvent(
  event: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
  },
  calendarId: string = 'primary'
): Promise<CalendarEvent | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${CALENDAR_API}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to create event:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

/** Delete a calendar event */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId: string = 'primary'
): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `${CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/** Get events for today */
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return listCalendarEvents(start.toISOString(), end.toISOString());
}

/** Get events for a specific week */
export async function getWeekEvents(weekStart: Date): Promise<CalendarEvent[]> {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);

  return listCalendarEvents(weekStart.toISOString(), end.toISOString());
}
