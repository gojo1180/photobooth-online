import { create } from 'zustand';

export type UserRole = 'host' | 'guest';
export type PeerStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type RoomStep = 'WAITING' | 'CAPTURE' | 'CUSTOMIZE' | 'EXPORT';

export interface RoomStore {
  roomId: string | null;
  roomCode: string | null;
  role: UserRole | null;
  peerStatus: PeerStatus;
  roomStep: RoomStep;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  isCountdownActive: boolean;
  countdownSeconds: number;

  // Actions
  setRoom: (roomId: string, roomCode: string, role: UserRole) => void;
  setRoomStep: (step: RoomStep) => void;
  setPeerStatus: (status: PeerStatus) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setDataChannel: (channel: RTCDataChannel | null) => void;
  startCountdown: (duration?: number) => void;
  setCountdownSeconds: (sec: number) => void;
  stopCountdown: () => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  roomCode: null,
  role: null,
  peerStatus: 'idle',
  roomStep: 'WAITING',
  localStream: null,
  remoteStream: null,
  dataChannel: null,
  isCountdownActive: false,
  countdownSeconds: 3,

  setRoom: (roomId, roomCode, role) => set({ roomId, roomCode, role }),
  setRoomStep: (roomStep) => set({ roomStep }),
  setPeerStatus: (peerStatus) => set({ peerStatus }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setDataChannel: (dataChannel) => set({ dataChannel }),
  startCountdown: (duration = 3) => set({ isCountdownActive: true, countdownSeconds: duration }),
  setCountdownSeconds: (countdownSeconds) => set({ countdownSeconds }),
  stopCountdown: () => set({ isCountdownActive: false }),

  resetRoom: () =>
    set({
      roomId: null,
      roomCode: null,
      role: null,
      peerStatus: 'idle',
      roomStep: 'WAITING',
      localStream: null,
      remoteStream: null,
      dataChannel: null,
      isCountdownActive: false,
      countdownSeconds: 3,
    }),
}));
