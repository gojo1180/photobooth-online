export interface SignalEnvelope {
  type:
    | 'OFFER'
    | 'ANSWER'
    | 'ICE_CANDIDATE'
    | 'SYNC_LAYOUT'
    | 'START_SHUTTER'
    | 'PEER_JOINED'
    | 'PEER_READY'
    | 'PEER_LEFT'
    | 'ROOM_STATE'
    | 'ROOM_FULL';
  sender_id: string;
  payload?: {
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
  peers_count?: number;
}

export type SignalingMode = 'websocket' | 'supabase' | null;

export function getIceServers(): RTCConfiguration {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_SERVER_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || '',
    });
  }

  return { iceServers: servers };
}
