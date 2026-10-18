import { createWebSocketTicket, WS_BASE_URL } from '@/lib/api';
import type { UserRole, PeerStatus } from '@/stores/useRoomStore';
import type { SignalEnvelope, SignalingMode } from './types';

interface SetupWebSocketSignalingOptions {
  cleanRoomCode: string;
  role: UserRole;
  mySenderId: string;
  onSetSenderId: (id: string) => void;
  pcRef: React.RefObject<RTCPeerConnection | null>;
  pendingCandidatesRef: React.RefObject<RTCIceCandidateInit[]>;
  sendOffer: () => Promise<void>;
  flushPendingCandidates: () => Promise<void>;
  setSignalingMode: (mode: SignalingMode) => void;
  setConnectionError: (err: string | null) => void;
  setPeerStatus: (status: PeerStatus) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  onTriggerFallback: () => void;
  fallbackEnabled: boolean;
  isDisposed: () => boolean;
}

export async function setupWebSocketSignaling({
  cleanRoomCode,
  role,
  mySenderId,
  onSetSenderId,
  pcRef,
  pendingCandidatesRef,
  sendOffer,
  flushPendingCandidates,
  setSignalingMode,
  setConnectionError,
  setPeerStatus,
  setRemoteStream,
  onTriggerFallback,
  fallbackEnabled,
  isDisposed,
}: SetupWebSocketSignalingOptions): Promise<WebSocket | null> {
  try {
    const ticket = await createWebSocketTicket(cleanRoomCode);
    if (isDisposed()) return null;

    const senderId = ticket.sender_id;
    onSetSenderId(senderId);

    const wsUrl = `${WS_BASE_URL}/rooms/${encodeURIComponent(cleanRoomCode)}?ticket=${encodeURIComponent(ticket.ticket)}`;
    const socket = new WebSocket(wsUrl);

    let shouldFallback = true;

    socket.onopen = () => {
      console.log(`[Signaling WS] Connected to Go Backend room: ${cleanRoomCode}`);
      setSignalingMode('websocket');
      setConnectionError(null);
      setPeerStatus('connecting');

      const joinSignal: SignalEnvelope = {
        type: 'PEER_JOINED',
        sender_id: senderId,
      };
      socket.send(JSON.stringify(joinSignal));
    };

    socket.onmessage = async (event) => {
      try {
        const msg: SignalEnvelope = JSON.parse(event.data);
        if (msg.sender_id === senderId) return;

        switch (msg.type) {
          case 'ROOM_STATE': {
            console.log(`[Signaling WS] Room state received: ${msg.peers_count} peer(s) in room`);
            if (role === 'host' && (msg.peers_count ?? 1) >= 2) {
              await sendOffer();
            }
            break;
          }

          case 'PEER_JOINED': {
            console.log('[Signaling WS] Remote peer announced presence');
            if (role === 'host') {
              await sendOffer();
            } else if (role === 'guest') {
              const readyMsg: SignalEnvelope = {
                type: 'PEER_READY',
                sender_id: senderId,
              };
              socket.send(JSON.stringify(readyMsg));
            }
            break;
          }

          case 'PEER_READY': {
            if (role === 'host') {
              console.log('[Signaling WS] Guest signaled PEER_READY, sending offer');
              await sendOffer();
            }
            break;
          }

          case 'PEER_LEFT': {
            console.log('[Signaling WS] Remote peer disconnected');
            setRemoteStream(null);
            setPeerStatus('disconnected');
            break;
          }

          case 'ROOM_FULL': {
            shouldFallback = false;
            setConnectionError('Room sudah berisi Host dan Guest. Tidak ada slot koneksi tambahan.');
            setPeerStatus('error');
            socket.close();
            break;
          }

          case 'OFFER': {
            if (role === 'guest' && pcRef.current && msg.payload?.sdp) {
              console.log('[Signaling WS] Guest received OFFER from Host');
              try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload.sdp));
                await flushPendingCandidates();

                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);

                const reply: SignalEnvelope = {
                  type: 'ANSWER',
                  sender_id: senderId,
                  payload: { sdp: answer },
                };
                socket.send(JSON.stringify(reply));
                console.log('[Signaling WS] Guest sent ANSWER to Host');
              } catch (err) {
                console.error('[Signaling WS] Guest error handling offer:', err);
              }
            }
            break;
          }

          case 'ANSWER': {
            if (role === 'host' && pcRef.current && msg.payload?.sdp) {
              console.log('[Signaling WS] Host received ANSWER from Guest');
              try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload.sdp));
                await flushPendingCandidates();
              } catch (err) {
                console.error('[Signaling WS] Host error handling answer:', err);
              }
            }
            break;
          }

          case 'ICE_CANDIDATE': {
            if (pcRef.current && msg.payload?.candidate && msg.payload.candidate.candidate) {
              if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
                try {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
                } catch (e) {
                  console.error('[Signaling WS] Error adding received ICE candidate:', e);
                }
              } else {
                pendingCandidatesRef.current.push(msg.payload.candidate);
              }
            }
            break;
          }
        }
      } catch (err) {
        console.warn('[Signaling WS] Failed to parse message:', err);
      }
    };

    socket.onerror = (err) => {
      console.warn('[Signaling WS] Go backend WS error:', err);
      if (fallbackEnabled) {
        setConnectionError('Koneksi studio utama terputus. Mengalihkan ke jalur cadangan…');
        onTriggerFallback();
      } else {
        setConnectionError('Koneksi aman ke room gagal. Silakan coba kembali.');
        setPeerStatus('error');
      }
    };

    socket.onclose = () => {
      console.log('[Signaling WS] Disconnected from Go backend room hub');
      if (!isDisposed() && shouldFallback) {
        if (fallbackEnabled) {
          setPeerStatus('disconnected');
          onTriggerFallback();
        } else {
          setPeerStatus('error');
        }
      }
    };

    return socket;
  } catch (error) {
    console.error('[WebRTC] Secure WebSocket initialization failed:', error);
    if (!isDisposed()) {
      setConnectionError(error instanceof Error ? error.message : 'Koneksi aman ke room gagal.');
      setPeerStatus('error');
    }
    return null;
  }
}
