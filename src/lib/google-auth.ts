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

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1064811829288-qss7tmnvc352cdomc4cf156064dl9b2g.apps.googleusercontent.com';

/** Initialize Google Identity Services */
export async function initGoogleAuth(): Promise<void> {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured. Running in guest mode.');
    return;
  }

  try {
    await loadScript(GIS_SCRIPT);
    await loadScript(GAPI_SCRIPT);
  } catch (error) {
    console.error('Failed to load Google scripts:', error);
  }
}

/** Sign in with Google and return user profile */
export function signInWithGoogle(): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your-google-client-id-here.apps.googleusercontent.com') {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    try {
      // @ts-expect-error - google global from GIS script
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
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
  if (token) {
    try {
      // @ts-expect-error - google global from GIS script
      google.accounts.oauth2.revoke(token);
    } catch {
      // Ignore revoke errors
    }
  }
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('user_profile');
}

/** Get saved access token */
export function getAccessToken(): string | null {
  return localStorage.getItem('google_access_token');
}

/** Get saved user profile */
export function getSavedProfile(): UserProfile | null {
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
