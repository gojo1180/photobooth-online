'use client';

import { useState, useEffect } from 'react';
import { useRoomStore, type UserRole } from '@/stores/useRoomStore';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { getLayouts, getRoom } from '@/lib/api';
import { DEFAULT_ROOM_LAYOUTS, type RoomLayoutItem } from '../types';

interface UseRoomSessionProps {
  roomId: string;
  cleanCode: string;
  user: { id: string } | null;
  isAuthenticated: boolean;
}

export function useRoomSession({
  roomId,
  cleanCode,
  user,
  isAuthenticated,
}: UseRoomSessionProps) {
  const { role, setRoom } = useRoomStore();
  const { selectedLayoutId, selectLayout } = usePhotoboothStore();

  const [layouts, setLayouts] = useState<RoomLayoutItem[]>(DEFAULT_ROOM_LAYOUTS);
  const [roomAccessError, setRoomAccessError] = useState<string | null>(null);

  // Restore/detect user role if entering directly or on reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedRole =
        sessionStorage.getItem(`room_role_${roomId.toLowerCase()}`) ||
        sessionStorage.getItem(`room_role_${cleanCode}`) ||
        sessionStorage.getItem(`room_role_${roomId}`);

      if ((cachedRole === 'host' || cachedRole === 'guest') && role !== cachedRole) {
        setRoom(roomId, cleanCode, cachedRole);
      }
    }

    if (!isAuthenticated || !user) return;
    const currentUserId = user.id;

    async function detectRole() {
      try {
        const room = await getRoom(cleanCode);
        const targetRole: UserRole = room.host_user_id === currentUserId ? 'host' : 'guest';
        setRoom(roomId, cleanCode, targetRole);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`room_role_${roomId.toLowerCase()}`, targetRole);
          sessionStorage.setItem(`room_role_${cleanCode}`, targetRole);
        }
      } catch (err) {
        console.warn('[Room] Failed to detect role from backend:', err);
        setRoomAccessError('Room tidak ditemukan, sudah kedaluwarsa, atau telah penuh.');
      }
    }

    detectRole();
  }, [cleanCode, isAuthenticated, role, roomId, setRoom, user]);

  // Load backend layout definitions
  useEffect(() => {
    async function fetchBackendLayouts() {
      try {
        const bl = await getLayouts();
        if (bl && bl.length > 0) {
          const merged: RoomLayoutItem[] = bl.map((b) => {
            const fallback = DEFAULT_ROOM_LAYOUTS.find((d) => d.id === b.id);
            return {
              id: b.id,
              name: b.name || fallback?.name || 'Custom Layout',
              poses: b.photo_count || fallback?.poses || 4,
              size:
                fallback?.size ||
                `${Math.round(b.canvas_width / 100)} x ${Math.round(b.canvas_height / 100)} cm`,
              icon: fallback?.icon || 'grid_view',
              desc: fallback?.desc || `Archival layout with ${b.photo_count} poses.`,
              assetUrl: fallback?.assetUrl || '/frames/y2k_grid_cherry.svg',
              tag: fallback?.tag,
            };
          });
          setLayouts(merged);
        }
      } catch {
        // Fallback to defaults
      }
    }

    fetchBackendLayouts();
  }, []);

  // Set default starting layout if none selected
  useEffect(() => {
    if (!selectedLayoutId && layouts.length > 0) {
      selectLayout(layouts[0].id, layouts[0].poses);
    }
  }, [layouts, selectLayout, selectedLayoutId]);

  return {
    layouts,
    roomAccessError,
  };
}
