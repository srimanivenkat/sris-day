// ============================================
// Google OAuth 2.0 Authentication
// ============================================
// Uses Google Identity Services (GIS) library for sign-in,
// with direct OAuth redirect fallback for browsers blocking popups.

import type { UserProfile } from '@/types';

// Google Identity Services script URL
const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

// Google API client library
const GAPI_SCRIPT = 'https://apis.google.com/js/api.js';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

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

/** Get configured Google Client ID from localStorage or environment */
export function getGoogleClientId(): string | null {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('sris_day_google_client_id');
    if (custom && custom.trim().length > 0) return custom.trim();
  }
  const envId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (envId && envId !== 'your-google-client-id-here.apps.googleusercontent.com' && envId.trim().length > 0) {
    return envId.trim();
  }
  return null;
}

/** Save Google Client ID to localStorage */
export function setGoogleClientId(id: string): void {
  if (typeof window !== 'undefined') {
    if (id && id.trim().length > 0) {
      localStorage.setItem('sris_day_google_client_id', id.trim());
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

/** Check URL hash for OAuth redirect token (e.g. #access_token=...&token_type=Bearer) */
export async function checkRedirectToken(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  localStorage.setItem('google_access_token', accessToken);
  // Clean hash from URL bar
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.removeItem('sris_day_guest');
    return profile;
  } catch (err) {
    console.error('Failed to fetch userinfo from redirect token:', err);
    return null;
  }
}

/** Parse an access token from either a full URL string or raw token string and save profile */
export async function authenticateWithTokenOrUrl(input: string): Promise<UserProfile> {
  let token = input.trim();
  if (token.includes('access_token=')) {
    const after = token.split('access_token=')[1];
    token = after.split('&')[0];
  }
  if (!token) throw new Error('No valid access token found in the input.');

  localStorage.setItem('google_access_token', token);

  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Google token validation failed. The token may have expired or is invalid.');
  }

  const data = await res.json();
  const profile: UserProfile = {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };

  localStorage.setItem('user_profile', JSON.stringify(profile));
  localStorage.removeItem('sris_day_guest');
  return profile;
}

/** Get the exact OAuth redirect URI that must be added to Google Cloud Console */
export function getOAuthRedirectUri(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000/settings';
  return window.location.origin.replace(/\/$/, '') + '/settings';
}

/** Direct full-page redirect to Google OAuth (completely bypasses popup and gsi/transform) */
export function signInWithGoogleRedirect(): void {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID is not configured. Please paste your Google Client ID in Settings first.');
  }

  const redirectUri = getOAuthRedirectUri();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
    GOOGLE_SCOPES
  )}&prompt=select_account`;

  window.location.href = authUrl;
}

/** Sign in with Google via popup with explicit account prompt */
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
        // Fallback directly to full-page redirect if GIS script isn't loaded
        signInWithGoogleRedirect();
        return;
      }

      // @ts-expect-error - google global from GIS script
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
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

      // Passing prompt: 'select_account' forces Google to show the account picker
      // and prevents getting stuck at silent gsi/transform!
      client.requestAccessToken({ prompt: 'select_account' });
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
