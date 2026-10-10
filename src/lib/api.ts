import { createClient } from '@/lib/supabase/client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1/ws';

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, unknown>;
}

export interface BackendLayout {
  id: string;
  name: string;
  photo_count: number;
  canvas_width: number;
  canvas_height: number;
  aspect_ratio: string;
  is_active: boolean;
  created_at: string;
}

export interface FrameSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BackendFrame {
  id: string;
  layout_id: string;
  name: string;
  asset_url: string;
  slots: FrameSlot[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomCreateResponse {
  room_code: string;
  expires_at: string;
}

export interface RoomData {
  id: string;
  room_code: string;
  host_user_id: string;
  guest_user_id?: string;
  selected_layout_id?: string;
  selected_frame_id?: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface WebSocketTicketResponse {
  ticket: string;
  expires_at: string;
  sender_id: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: UserProfile;
}

/**
 * Retrieves the active access token: checks localStorage first (backend session),
 * then Supabase client session. The development token is opt-in only.
 */
export async function getAuthToken(): Promise<string> {
  const allowDevAuth =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ALLOW_DEV_AUTH === 'true';

  try {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('photobooth_auth_token');
      if (storedToken) {
        if (
          (storedToken === 'dev-admin-token' || storedToken === 'mock-token') &&
          !allowDevAuth
        ) {
          localStorage.removeItem('photobooth_auth_token');
        } else {
          return storedToken;
        }
      }
    }
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch (err) {
    console.warn('Could not read session token:', err);
  }
  if (allowDevAuth) {
    return 'dev-admin-token';
  }
  throw new Error('Sesi autentikasi tidak ditemukan. Silakan masuk kembali.');
}

// ----------------------------------------------------------------------------
// 0. Auth Service (Go Backend Gateway)
// ----------------------------------------------------------------------------

export async function apiRegister(payload: {
  email: string;
  password: string;
  display_name?: string;
}): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiLoginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiLoginAdmin(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetMe(token?: string): Promise<UserProfile> {
  const authToken = token || (await getAuthToken());
  return fetchAPI<UserProfile>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

/**
 * Base generic fetch wrapper for PhotoBooth backend.
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const resJson: APIResponse<T> = await response.json().catch(() => ({
    success: false,
    error: `HTTP error ${response.status}: ${response.statusText}`,
  }));

  if (!response.ok || !resJson.success) {
    const errorMsg =
      resJson.message ||
      (typeof resJson.error === 'string'
        ? resJson.error
        : JSON.stringify(resJson.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return resJson.data as T;
}

// ----------------------------------------------------------------------------
// 1. Layouts Service
// ----------------------------------------------------------------------------

export async function getLayouts(): Promise<BackendLayout[]> {
  return fetchAPI<BackendLayout[]>('/layouts', {
    method: 'GET',
    cache: 'no-store',
  });
}

export async function getAdminLayouts(): Promise<BackendLayout[]> {
  const token = await getAuthToken();
  return fetchAPI<BackendLayout[]>('/admin/layouts', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function createAdminLayout(layout: {
  id: string;
  name: string;
  photo_count: number;
  canvas_width: number;
  canvas_height: number;
  aspect_ratio: string;
  is_active?: boolean;
}): Promise<BackendLayout> {
  const token = await getAuthToken();
  return fetchAPI<BackendLayout>('/admin/layouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(layout),
  });
}

export async function updateAdminLayout(
  id: string,
  layout: Partial<{
    name: string;
    photo_count: number;
    canvas_width: number;
    canvas_height: number;
    aspect_ratio: string;
    is_active: boolean;
  }>
): Promise<BackendLayout> {
  const token = await getAuthToken();
  return fetchAPI<BackendLayout>(`/admin/layouts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(layout),
  });
}

export async function deleteAdminLayout(id: string): Promise<void> {
  const token = await getAuthToken();
  return fetchAPI<void>(`/admin/layouts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ----------------------------------------------------------------------------
// 2. Frames Service
// ----------------------------------------------------------------------------

export function normalizeAssetUrl(url: string): string {
  if (!url) return '';
  if (
    url.startsWith('https://') &&
    url.includes('.supabase.co/frame_') &&
    !url.includes('/storage/v1/object/public/')
  ) {
    return url.replace('.supabase.co/frame_', '.supabase.co/storage/v1/object/public/frames/frame_');
  }
  return url;
}

export async function getFrames(layoutId: string): Promise<BackendFrame[]> {
  const params = new URLSearchParams({ layout_id: layoutId });
  const frames = await fetchAPI<BackendFrame[]>(`/frames?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });
  return (frames || []).map((f) => ({
    ...f,
    asset_url: normalizeAssetUrl(f.asset_url),
  }));
}

export async function getAdminFrames(layoutId?: string): Promise<BackendFrame[]> {
  const token = await getAuthToken();
  const url = layoutId
    ? `/admin/frames?layout_id=${encodeURIComponent(layoutId)}`
    : '/admin/frames';
  const frames = await fetchAPI<BackendFrame[]>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  return (frames || []).map((f) => ({
    ...f,
    asset_url: normalizeAssetUrl(f.asset_url),
  }));
}

export async function createAdminFrame(formData: FormData): Promise<BackendFrame> {
  const token = await getAuthToken();
  return fetchAPI<BackendFrame>('/admin/frames', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export async function updateAdminFrame(
  id: string,
  data: Partial<{
    name: string;
    layout_id: string;
    slots: FrameSlot[];
    is_active: boolean;
  }>
): Promise<BackendFrame> {
  const token = await getAuthToken();
  return fetchAPI<BackendFrame>(`/admin/frames/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteAdminFrame(id: string): Promise<void> {
  const token = await getAuthToken();
  return fetchAPI<void>(`/admin/frames/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ----------------------------------------------------------------------------
// 3. Collaborative Rooms Service
// ----------------------------------------------------------------------------

export async function createRoom(): Promise<RoomCreateResponse> {
  const token = await getAuthToken();
  return fetchAPI<RoomCreateResponse>('/rooms/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getRoom(code: string): Promise<RoomData> {
  const token = await getAuthToken();
  return fetchAPI<RoomData>(`/rooms/${encodeURIComponent(code)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function createWebSocketTicket(
  code: string
): Promise<WebSocketTicketResponse> {
  const token = await getAuthToken();
  return fetchAPI<WebSocketTicketResponse>(
    `/rooms/${encodeURIComponent(code)}/ws-ticket`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
