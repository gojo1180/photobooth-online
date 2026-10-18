/**
 * Utility functions for Room Code normalization and formatting.
 * Single source of truth across the frontend application.
 */

/**
 * Normalizes any user or URL room code input to canonical lowercase pb- prefixed format.
 * Examples:
 *   "PB-892X"   -> "pb-892x"
 *   "room_892x" -> "pb-892x"
 *   "892x"      -> "pb-892x"
 */
export function normalizeRoomCode(rawCode: string): string {
  const clean = rawCode.toLowerCase().replace(/^room_/i, '').trim();
  return clean.startsWith('pb-') ? clean : `pb-${clean}`;
}

/**
 * Formats a room code for uppercase display in UI tags, badges, and headers.
 * Examples:
 *   "pb-892x" -> "PB-892X"
 */
export function formatRoomCodeDisplay(rawCode: string): string {
  const clean = rawCode.toUpperCase().replace(/^ROOM_/i, '').trim();
  return clean.startsWith('PB-') ? clean : `PB-${clean}`;
}
