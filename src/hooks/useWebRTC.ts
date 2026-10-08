'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useRoomStore, type UserRole } from '@/stores/useRoomStore';
import { WS_BASE_URL } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

interface SignalEnvelope {
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

export function useWebRTC(
  roomId: string | null,
  role: UserRole | null,
  localStream: MediaStream | null
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const senderIdRef = useRef<string>('');
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isNegotiatingRef = useRef(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [signalingMode, setSignalingMode] = useState<SignalingMode>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    setPeerStatus,
    setRemoteStream,
    setDataChannel,
  } = useRoomStore();

  const cleanup = useCallback(() => {
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch {}
      dataChannelRef.current = null;
      setDataChannel(null);
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    pendingCandidatesRef.current = [];
    isNegotiatingRef.current = false;
    setRemoteStream(null);
    setPeerStatus('idle');
  }, [setDataChannel, setRemoteStream, setPeerStatus]);

  // Main WebRTC & WebSocket signaling lifecycle
  useEffect(() => {
    if (!roomId || !role || !localStream) return;

    let disposed = false;

    if (!senderIdRef.current) {
      senderIdRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `usr_${Math.random().toString(36).slice(2, 10)}`;
    }
    const mySenderId = senderIdRef.current;
    
    // Normalize room code to lowercase pb- prefix
    const rawClean = roomId.toLowerCase().replace('room_', '').trim();
    const cleanRoomCode = rawClean.startsWith('pb-') ? rawClean : `pb-${rawClean}`;

    console.log(`[WebRTC] Initializing connection for room: ${cleanRoomCode}, role: ${role}`);

    // 1. Initialize RTCPeerConnection
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Attach initial tracks if available
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStream);
        } catch (e) {
          console.warn('[WebRTC] Error adding initial track:', e);
        }
      });
    }

    // Handle incoming remote media tracks
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream([event.track]);
        setRemoteStream(stream);
      }
      setPeerStatus('connected');
    };

    // Connection state observer
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('[WebRTC] RTCPeerConnection state:', state);
      switch (state) {
        case 'connected':
          setPeerStatus('connected');
          break;
        case 'disconnected':
          setPeerStatus('disconnected');
          break;
        case 'failed':
          console.warn('[WebRTC] Connection failed');
          setPeerStatus('error');
          break;
        case 'closed':
          setPeerStatus('idle');
          break;
      }
    };

    // 2. Data Channel Setup (Host creates, Guest listens)
    if (role === 'host') {
      const dc = pc.createDataChannel('photobooth_sync', {
        ordered: true,
      });
      dataChannelRef.current = dc;
      setDataChannel(dc);

      dc.onopen = () => {
        console.log('[WebRTC] Host RTCDataChannel opened');
        setConnectionError(null);
        setPeerStatus('connected');
      };
      dc.onclose = () => {
        console.log('[WebRTC] Host RTCDataChannel closed');
        if (!disposed) setPeerStatus('disconnected');
      };
    } else {
      pc.ondatachannel = (event) => {
        console.log('[WebRTC] Guest received DataChannel from Host');
        const dc = event.channel;
        dataChannelRef.current = dc;
        setDataChannel(dc);

        dc.onopen = () => {
          console.log('[WebRTC] Guest RTCDataChannel opened');
          setConnectionError(null);
          setPeerStatus('connected');
        };
        dc.onclose = () => {
          console.log('[WebRTC] Guest RTCDataChannel closed');
          if (!disposed) setPeerStatus('disconnected');
        };
      };
    }

    // 3. Connect to Go Backend WebSocket Hub
    const wsUrl = `${WS_BASE_URL}/rooms/${encodeURIComponent(cleanRoomCode)}?sender_id=${mySenderId}`;
    let ws: WebSocket | null = null;
    let fallbackChannel: RealtimeChannel | null = null;
    let shouldFallback = true;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (e) {
      console.warn('[WebRTC] WebSocket instantiation failed, falling back:', e);
    }

    // Emit local ICE candidates
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;

      if (ws && ws.readyState === WebSocket.OPEN) {
        const signal: SignalEnvelope = {
          type: 'ICE_CANDIDATE',
          sender_id: mySenderId,
          payload: { candidate: event.candidate.toJSON() },
        };
        ws.send(JSON.stringify(signal));
      } else if (fallbackChannel) {
        fallbackChannel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate.toJSON(), senderRole: role },
        });
      }
    };

    // Helper: Flush pending candidates once remote description is set
    const flushPendingCandidates = async () => {
      if (!pcRef.current) return;
      while (pendingCandidatesRef.current.length > 0) {
        const cand = pendingCandidatesRef.current.shift();
        if (cand && cand.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error('[WebRTC] Error adding pending ICE candidate:', e);
          }
        }
      }
    };

    // Helper: Host generates and broadcasts WebRTC OFFER
    const sendOffer = async () => {
      if (role !== 'host' || !pcRef.current) return;
      if (isNegotiatingRef.current) return;
      if (pcRef.current.signalingState !== 'stable') return;
      isNegotiatingRef.current = true;

      try {
        console.log('[WebRTC] Host creating fresh OFFER...');
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: true,
        });
        await pcRef.current.setLocalDescription(offer);

        const signal: SignalEnvelope = {
          type: 'OFFER',
          sender_id: mySenderId,
          payload: { sdp: offer },
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(signal));
          console.log('[WebRTC] Host transmitted OFFER via WebSocket');
        } else if (fallbackChannel) {
          fallbackChannel.send({
            type: 'broadcast',
            event: 'sdp-offer',
            payload: { sdp: offer },
          });
        }
      } catch (err) {
        console.error('[WebRTC] Error generating offer:', err);
      } finally {
        isNegotiatingRef.current = false;
      }
    };

    if (ws) {
      ws.onopen = () => {
        console.log(`[Signaling WS] Connected to Go Backend room: ${cleanRoomCode}`);
        setSignalingMode('websocket');
        setConnectionError(null);
        setPeerStatus('connecting');

        // Announce presence
        const joinSignal: SignalEnvelope = {
          type: 'PEER_JOINED',
          sender_id: mySenderId,
        };
        ws?.send(JSON.stringify(joinSignal));
      };

      ws.onmessage = async (event) => {
        try {
          const msg: SignalEnvelope = JSON.parse(event.data);
          if (msg.sender_id === mySenderId) return;

          switch (msg.type) {
            case 'ROOM_STATE': {
              console.log(`[Signaling WS] Room state received: ${msg.peers_count} peer(s) in room`);
              if (role === 'host' && (msg.peers_count ?? 1) >= 2) {
                // Companion already waiting in room
                await sendOffer();
              }
              break;
            }

            case 'PEER_JOINED': {
              console.log('[Signaling WS] Remote peer announced presence');
              if (role === 'host') {
                // Guest joined, Host sends offer
                await sendOffer();
              } else if (role === 'guest') {
                // Host joined or announced, notify host we are ready
                const readyMsg: SignalEnvelope = {
                  type: 'PEER_READY',
                  sender_id: mySenderId,
                };
                ws?.send(JSON.stringify(readyMsg));
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
              ws?.close();
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
                    sender_id: mySenderId,
                    payload: { sdp: answer },
                  };
                  ws?.send(JSON.stringify(reply));
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

      ws.onerror = (err) => {
        console.warn('[Signaling WS] Go backend WS error, activating fallback:', err);
        setConnectionError('Koneksi studio utama terputus. Mengalihkan ke jalur cadangan…');
        initSupabaseFallback();
      };

      ws.onclose = () => {
        console.log('[Signaling WS] Disconnected from Go backend room hub');
        if (!disposed && !fallbackChannel && shouldFallback) {
          setPeerStatus('disconnected');
          initSupabaseFallback();
        }
      };
    } else {
      initSupabaseFallback();
    }

    // Fallback: Supabase Realtime Broadcast Channel
    function initSupabaseFallback() {
      if (fallbackChannel) return;
      console.log('[WebRTC] Starting Supabase Realtime fallback signaling...');
      const supabase = createClient();
      setSignalingMode('supabase');
      const channel = supabase.channel(`room_${cleanRoomCode}`, {
        config: { broadcast: { self: false } },
      });
      fallbackChannel = channel;

      channel
        .on('broadcast', { event: 'peer-ready' }, async () => {
          if (role === 'host') await sendOffer();
        })
        .on('broadcast', { event: 'sdp-offer' }, async ({ payload }: { payload: { sdp: RTCSessionDescriptionInit } }) => {
          if (role === 'guest' && pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingCandidates();
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            channel.send({
              type: 'broadcast',
              event: 'sdp-answer',
              payload: { sdp: answer },
            });
          }
        })
        .on('broadcast', { event: 'sdp-answer' }, async ({ payload }: { payload: { sdp: RTCSessionDescriptionInit } }) => {
          if (role === 'host' && pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingCandidates();
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }: { payload: { candidate: RTCIceCandidateInit; senderRole?: UserRole } }) => {
          if (pcRef.current && payload.candidate && payload.senderRole !== role) {
            try {
              if (pcRef.current.remoteDescription) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } else {
                pendingCandidatesRef.current.push(payload.candidate);
              }
            } catch (e) {
              console.error('Fallback ice candidate error:', e);
            }
          }
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            setPeerStatus('connecting');
            if (role === 'host') {
              await sendOffer();
            } else {
              await channel.send({
                type: 'broadcast',
                event: 'peer-ready',
                payload: { senderRole: role },
              });
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionError('Tidak dapat tersambung ke layanan sinkronisasi room.');
            setPeerStatus('error');
          }
        });
    }

    return () => {
      disposed = true;
      if (fallbackChannel) {
        fallbackChannel.unsubscribe();
      }
      cleanup();
    };
  }, [connectionAttempt, localStream, roomId, role, cleanup, setDataChannel, setPeerStatus, setRemoteStream]);

  // Synchronize localStream tracks without tearing down WebRTC or WebSocket
  useEffect(() => {
    if (!pcRef.current || !localStream) return;
    const senders = pcRef.current.getSenders();
    localStream.getTracks().forEach((track) => {
      const sender = senders.find((s) => s.track?.kind === track.kind);
      if (sender) {
        sender.replaceTrack(track).catch((e) => console.warn('[WebRTC] replaceTrack error:', e));
      } else {
        try {
          pcRef.current?.addTrack(track, localStream);
          console.log(`[WebRTC] Attached new local track: ${track.kind}`);
        } catch (e) {
          console.warn('[WebRTC] addTrack error:', e);
        }
      }
    });
  }, [localStream]);

  const retryConnection = useCallback(() => {
    cleanup();
    setConnectionError(null);
    setSignalingMode(null);
    setPeerStatus('connecting');
    setConnectionAttempt((attempt) => attempt + 1);
  }, [cleanup, setPeerStatus]);

  return {
    cleanup,
    retryConnection,
    signalingMode,
    connectionError,
  };
}
