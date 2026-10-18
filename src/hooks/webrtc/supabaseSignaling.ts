import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getAuthToken } from '@/lib/api';
import type { UserRole, PeerStatus } from '@/stores/useRoomStore';
import type { SignalingMode } from './types';

interface SetupSupabaseSignalingOptions {
  cleanRoomCode: string;
  role: UserRole;
  pcRef: React.RefObject<RTCPeerConnection | null>;
  pendingCandidatesRef: React.RefObject<RTCIceCandidateInit[]>;
  sendOffer: () => Promise<void>;
  flushPendingCandidates: () => Promise<void>;
  setSignalingMode: (mode: SignalingMode) => void;
  setConnectionError: (err: string | null) => void;
  setPeerStatus: (status: PeerStatus) => void;
  isDisposed: () => boolean;
}

export async function setupSupabaseSignaling({
  cleanRoomCode,
  role,
  pcRef,
  pendingCandidatesRef,
  sendOffer,
  flushPendingCandidates,
  setSignalingMode,
  setConnectionError,
  setPeerStatus,
  isDisposed,
}: SetupSupabaseSignalingOptions): Promise<RealtimeChannel | null> {
  console.log('[WebRTC] Starting Supabase Realtime fallback signaling...');
  try {
    const supabase = createClient();
    await supabase.realtime.setAuth(await getAuthToken());
    if (isDisposed()) return null;

    setSignalingMode('supabase');
    const channel = supabase.channel(`room_${cleanRoomCode}`, {
      config: { private: true, broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'peer-ready' }, async () => {
        if (role === 'host') await sendOffer();
      })
      .on(
        'broadcast',
        { event: 'sdp-offer' },
        async ({ payload }: { payload: { sdp: RTCSessionDescriptionInit } }) => {
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
        }
      )
      .on(
        'broadcast',
        { event: 'sdp-answer' },
        async ({ payload }: { payload: { sdp: RTCSessionDescriptionInit } }) => {
          if (role === 'host' && pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingCandidates();
          }
        }
      )
      .on(
        'broadcast',
        { event: 'ice-candidate' },
        async ({ payload }: { payload: { candidate: RTCIceCandidateInit; senderRole?: UserRole } }) => {
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
        }
      )
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

    return channel;
  } catch (error) {
    console.error('[WebRTC] Secure fallback initialization failed:', error);
    setConnectionError('Tidak dapat memverifikasi jalur cadangan room.');
    setPeerStatus('error');
    return null;
  }
}
