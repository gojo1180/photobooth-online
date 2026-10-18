'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useRoomStore, type UserRole } from '@/stores/useRoomStore';
import { normalizeRoomCode } from '@/lib/room-utils';
import { getIceServers, type SignalEnvelope, type SignalingMode } from './webrtc/types';
import { setupWebSocketSignaling } from './webrtc/websocketSignaling';
import { setupSupabaseSignaling } from './webrtc/supabaseSignaling';

export type { SignalingMode } from './webrtc/types';

export function useWebRTC(
  roomId: string | null,
  role: UserRole | null,
  localStream: MediaStream | null
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fallbackChannelRef = useRef<RealtimeChannel | null>(null);
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
    if (fallbackChannelRef.current) {
      try {
        fallbackChannelRef.current.unsubscribe();
      } catch {}
      fallbackChannelRef.current = null;
    }
    pendingCandidatesRef.current = [];
    isNegotiatingRef.current = false;
    setRemoteStream(null);
    setPeerStatus('idle');
  }, [setDataChannel, setRemoteStream, setPeerStatus]);

  // Main WebRTC lifecycle
  useEffect(() => {
    if (!roomId || !role || !localStream) return;

    let disposed = false;

    if (!senderIdRef.current) {
      senderIdRef.current =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `usr_${Math.random().toString(36).slice(2, 10)}`;
    }

    const cleanRoomCode = normalizeRoomCode(roomId);
    console.log(`[WebRTC] Initializing connection for room: ${cleanRoomCode}, role: ${role}`);

    // 1. Initialize RTCPeerConnection
    const pc = new RTCPeerConnection(getIceServers());
    pcRef.current = pc;

    // Attach initial tracks
    localStream.getTracks().forEach((track) => {
      try {
        pc.addTrack(track, localStream);
      } catch (e) {
        console.warn('[WebRTC] Error adding initial track:', e);
      }
    });

    // Remote track listener
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

    // 2. Data Channel Setup
    if (role === 'host') {
      const dc = pc.createDataChannel('photobooth_sync', { ordered: true });
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

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const signal: SignalEnvelope = {
          type: 'ICE_CANDIDATE',
          sender_id: senderIdRef.current,
          payload: { candidate: event.candidate.toJSON() },
        };
        wsRef.current.send(JSON.stringify(signal));
      } else if (fallbackChannelRef.current) {
        fallbackChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate.toJSON(), senderRole: role },
        });
      }
    };

    // Helper: Flush pending candidates
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

    // Helper: Host sends Offer
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
          sender_id: senderIdRef.current,
          payload: { sdp: offer },
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(signal));
          console.log('[WebRTC] Host transmitted OFFER via WebSocket');
        } else if (fallbackChannelRef.current) {
          fallbackChannelRef.current.send({
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

    const fallbackEnabled =
      process.env.NEXT_PUBLIC_ENABLE_SUPABASE_SIGNALING_FALLBACK === 'true';

    // Trigger fallback
    const triggerFallback = async () => {
      if (!fallbackEnabled || fallbackChannelRef.current || disposed) return;
      const channel = await setupSupabaseSignaling({
        cleanRoomCode,
        role,
        pcRef,
        pendingCandidatesRef,
        sendOffer,
        flushPendingCandidates,
        setSignalingMode,
        setConnectionError,
        setPeerStatus,
        isDisposed: () => disposed,
      });
      if (channel) {
        fallbackChannelRef.current = channel;
      }
    };

    // Connect primary WebSocket
    void setupWebSocketSignaling({
      cleanRoomCode,
      role,
      mySenderId: senderIdRef.current,
      onSetSenderId: (id) => {
        senderIdRef.current = id;
      },
      pcRef,
      pendingCandidatesRef,
      sendOffer,
      flushPendingCandidates,
      setSignalingMode,
      setConnectionError,
      setPeerStatus,
      setRemoteStream,
      onTriggerFallback: () => {
        void triggerFallback();
      },
      fallbackEnabled,
      isDisposed: () => disposed,
    }).then((socket) => {
      if (socket) {
        wsRef.current = socket;
      }
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [connectionAttempt, localStream, roomId, role, cleanup, setDataChannel, setPeerStatus, setRemoteStream]);

  // Synchronize localStream tracks without tearing down connection
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
