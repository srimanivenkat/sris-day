// ============================================
// Google OAuth 2.0 Authentication
// ============================================
// Uses Google Identity Services (GIS) library for sign-in

import type { UserProfile } from '@/types';

// Google Identity Services script URL
const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

// Google API client library
const GAPI_SCRIPT = 'https://apis.google.com/js/api.js';

/** Load an external script dynamically */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/** Helper to sanitize Google Client ID (removes accidental https://, http://, or trailing slashes) */
function sanitizeClientId(id: string): string {
  return id.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

/** Get configured Google Client ID from localStorage or environment */
export function getGoogleClientId(): string | null {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('sris_day_google_client_id');
    if (custom && custom.trim().length > 0) return sanitizeClientId(custom);
  }
  const envId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (envId && envId !== 'your-google-client-id-here.apps.googleusercontent.com' && envId.trim().length > 0) {
    return sanitizeClientId(envId);
  }
  return null;
}

/** Save Google Client ID to localStorage */
export function setGoogleClientId(id: string): void {
  if (typeof window !== 'undefined') {
    if (id && id.trim().length > 0) {
      localStorage.setItem('sris_day_google_client_id', sanitizeClientId(id));
    } else {
      localStorage.removeItem('sris_day_google_client_id');
    }
  }
}

/** Initialize Google Identity Services */
export async function initGoogleAuth(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await loadScript(GIS_SCRIPT);
    await loadScript(GAPI_SCRIPT);
  } catch (error) {
    console.warn('Google scripts notice:', error);
  }
}

/** Sign in with Google and return user profile */
export async function signInWithGoogle(): Promise<UserProfile> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID is not configured. Please paste your Google Client ID in Settings first.');
  }

  await initGoogleAuth();

  return new Promise((resolve, reject) => {
    try {
      // @ts-expect-error - google global from GIS script
      if (typeof google === 'undefined' || !google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services library could not be loaded. Please check your internet connection.'));
        return;
      }

      // @ts-expect-error - google global from GIS script
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: { access_token: string; error?: string }) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }

          // Save access token
          localStorage.setItem('google_access_token', tokenResponse.access_token);

          // Fetch user profile
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const data = await res.json();
            const profile: UserProfile = {
              id: data.id,
              email: data.email,
              name: data.name,
              picture: data.picture,
            };

            // Save profile to localStorage
            localStorage.setItem('user_profile', JSON.stringify(profile));
            resolve(profile);
          } catch (err) {
            reject(err);
          }
        },
      });

      client.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
}

/** Sign out and clear tokens */
export function signOutGoogle(): void {
  const token = localStorage.getItem('google_access_token');
  if (token && typeof window !== 'undefined') {
    try {
      // @ts-expect-error - google global from GIS script
      if (typeof google !== 'undefined' && google?.accounts?.oauth2?.revoke) {
        // @ts-expect-error - google global from GIS script
        google.accounts.oauth2.revoke(token);
      }
    } catch {
      // Ignore revoke errors
    }
  }
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('user_profile');
}

/** Get saved access token */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('google_access_token');
}

/** Get saved user profile */
export function getSavedProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('user_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

/** Check if user is authenticated */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
