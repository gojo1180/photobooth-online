# Product Requirement Document (PRD) — Frontend Architecture & Routing
## Web-Based Client-Side PhotoBooth (Solo & Online Collaborative)

---

| **Metadata** | **Detail** |
| :--- | :--- |
| **Document Target** | Frontend Engineering & Antigravity Agent Implementation Guide |
| **Framework & Engine** | Next.js (App Router), React, Konva.js, WebRTC, gif.js |
| **Core Invariant** | 100% Client-Side Visual Processing (Strict Zero-Server Storage for Photos) |
| **Platform Scope** | Desktop & Mobile Responsive Web Browsers (Chrome, Safari, Firefox, Edge) |

---

## 1. System Objective & Core Constraints

Frontend ini berfungsi sebagai bilik foto (*photobooth*) mandiri dan kolaboratif jarak jauh dengan ketentuan arsitektur wajib:
1. **Zero-Server Visual Storage:** Tidak boleh ada API route atau network payload yang mengunggah raw snapshot, video feed, atau file komposit ke server/database.
2. **Dynamic Grid-Coupled Filtering:** Pemilihan layout grid di awal mengunci ketersediaan aset desain bingkai (*frames*) pada tahap penyesuaian akhir.
3. **P2P Multi-Stream Side-by-Side:** Sesi online menghubungkan dua browser via WebRTC P2P; rendering canvas membagi area frame secara simetris (50% Host, 50% Guest).
4. **Non-Blocking Background Compilation:** Kompilasi animasi GIF dijalankan di background Web Worker tanpa memblokir thread UI.

---

## 2. Frontend Architecture Pattern

Aplikasi mengadopsi **Modular Feature-Based Architecture** dengan Next.js App Router:

```
[Presentation Layer]      Tailwind CSS + Lucide Icons + Framer Motion (Transitions & Flash)
         │
[State & Orchestration]   Zustand (Global Wizard & Ephemeral Photo Buffers)
         │
[Hardware & Streams]      MediaDevices API + WebRTC P2P MediaStream / RTCDataChannel
         │
[Graphics Composite]      react-konva / HTML5 Canvas API (Slot-Cropping & Frame Overlays)
         │
[Worker Threads]          gif.js Web Worker Engine (Off-main-thread GIF Encoding)
         │
[BaaS Integration]        @supabase/ssr (Signaling Channels, Metadata Queries, Auth Gate)
```

---

## 3. Directory & File Routing Structure

```text
src/
├── app/
│   ├── layout.tsx                      # Root layout, HTML metadata, font configurations
│   ├── page.tsx                        # Landing Page: Mode selection (Solo vs Online)
│   │
│   ├── (auth)/                         # Route group untuk autentikasi Online Mode & Admin
│   │   ├── login/
│   │   │   └── page.tsx                # Google OAuth / Magic Link login interface
│   │   └── callback/
│   │       └── route.ts                # Supabase Auth code exchange handler
│   │
│   ├── solo/                           # Solo Mode (Public / Stateless / Guest access)
│   │   └── page.tsx                    # Single-user photobooth wizard page
│   │
│   ├── room/                           # Collaborative Online Mode (Auth-protected)
│   │   ├── lobby/
│   │   │   └── page.tsx                # Buat room baru atau input room code
│   │   └── [roomId]/
│   │       └── page.tsx                # Sesi photobooth P2P & synchronized shutter
│   │
│   └── admin/                          # Admin Panel (Role-based Protected)
│       ├── layout.tsx                  # Dashboard sidebar & admin guard
│       ├── page.tsx                    # Overview aset & status
│       ├── layouts/
│       │   └── page.tsx                # Manajemen tipe grid, ukuran canvas, photo count
│       └── frames/
│           ├── page.tsx                # Galeri template frame aktif/nonaktif
│           └── new/
│               └── page.tsx            # Form upload PNG & interactive visual slot mapper
│
├── components/
│   ├── common/
│   │   ├── Navbar.tsx                  # Header navigasi & status autentikasi
│   │   ├── ScreenFlash.tsx             # Full-screen white flash animator (shutter feedback)
│   │   └── CountdownOverlay.tsx        # Angka hitung mundur (3, 2, 1) bergaya retro
│   │
│   ├── photobooth/                     # Workflow wizard components
│   │   ├── LayoutSelector.tsx          # Step 1: Pilihan layout (mengunci filter frame)
│   │   ├── CameraFeed.tsx              # Wrapper webcam lokal + switch/flip controls
│   │   ├── DualCameraGrid.tsx          # Dual-stream preview untuk Online Mode
│   │   ├── CanvasStage.tsx             # Stage react-konva (Composite photos + PNG overlay)
│   │   ├── FramePicker.tsx             # Galeri frame yang difilter sesuai layout terpilih
│   │   ├── FilterBar.tsx               # Slider/tombol preset filter warna (B&W, Warm, Noir)
│   │   ├── RetakeModal.tsx             # Dialog retake single-pose tanpa reset seluruh sesi
│   │   └── ExportActions.tsx           # Tombol unduh PNG HD, compile GIF, dan direct print
│   │
│   └── admin/
│       ├── SlotMapperCanvas.tsx        # Canvas interaktif penentu bounding box (x, y, w, h)
│       └── FrameCard.tsx               # Card item thumbnail bingkai dengan toggle status
│
├── hooks/
│   ├── useCamera.ts                    # Hook akses webcam, facingMode switch, canvas capture
│   ├── useWebRTC.ts                    # Inisialisasi P2P connection & SDP/ICE exchange via Supabase
│   ├── useSyncShutter.ts               # Sinkronisasi pemicu countdown via RTCDataChannel
│   ├── useGifCompiler.ts               # Abstraksi worker thread untuk rendering gif.js
│   └── useFrameFilter.ts               # Filter frame query berdasarkan selected layout_id
│
├── stores/
│   ├── usePhotoboothStore.ts           # State machine wizard, bitmap photo array, active frame
│   └── useRoomStore.ts                 # State room session, peers status, host/guest role
│
├── lib/
│   ├── konva-helpers.ts                # Utilitas cropping foto 50/50 side-by-side & layout math
│   ├── audio.ts                        # Audio synthesizer / sound trigger (beep countdown & shutter)
│   └── supabase/
│       ├── client.ts                   # Client-side Supabase instance
│       └── server.ts                   # Server-side Supabase helper (RSC & route handler)
│
└── public/
    ├── workers/
    │   └── gif.worker.js               # Background binary Web Worker untuk gif.js
    └── sounds/
        ├── beep.mp3                    # Sound effect hitung mundur
        └── shutter.mp3                 # Sound effect klik shutter
```

---

## 4. State Management Specifications (Zustand Store)

### 4.1 Photobooth Session State (`usePhotoboothStore`)
State ini bertindak sebagai *single source of truth* untuk siklus hidup foto sementara di peramban:

```typescript
export type WizardStep = 'SELECT_LAYOUT' | 'CAPTURE' | 'CUSTOMIZE' | 'EXPORT';

export interface FrameSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameItem {
  id: string;
  layout_id: string;
  name: string;
  asset_url: string;
  slots: FrameSlot[];
}

export interface PhotoboothStore {
  step: WizardStep;
  selectedLayoutId: string | null;
  expectedPhotoCount: number;
  capturedPhotos: string[];              // Ephemeral base64/blob strings
  selectedFrame: FrameItem | null;
  activeFilter: string;
  isCapturing: boolean;

  // Actions
  setStep: (step: WizardStep) => void;
  selectLayout: (layoutId: string, count: number) => void;
  pushCapturedPhoto: (base64: string) => void;
  replacePhotoAtIndex: (index: number, base64: string) => void;
  selectFrame: (frame: FrameItem) => void;
  setActiveFilter: (filter: string) => void;
  resetSession: () => void;              // Release all bitmaps & free browser memory
}
```

---

## 5. Critical Technical Flows & Implementation Detail

### 5.1 Dynamic Grid-to-Frame Coupling Logic
1. Pengguna memilih layout di `LayoutSelector.tsx` (misal: `'layout_3_strip'`).
2. Store mengunci `selectedLayoutId = 'layout_3_strip'` dan `expectedPhotoCount = 3`.
3. Pada tahap `CUSTOMIZE`, komponen `FramePicker.tsx` mengeksekusi filter relasi Supabase:
   ```typescript
   const { data: frames } = await supabase
     .from('frames')
     .select('*')
     .eq('layout_id', selectedLayoutId)
     .eq('is_active', true);
   ```
4. Pilihan frame di luar layout aktif diabaikan dari daftar rendering antarmuka.

### 5.2 Collaborative Online Mode (Side-by-Side WebRTC Pipeline)
1. **Lobby Handshake:**
   * Host membuat room di `/room/lobby` $ightarrow$ mendapatkan `room_code`.
   * Guest membuka `/room/[roomId]` $ightarrow$ Supabase Realtime broadcast channel memicu pertukaran SDP Offer/Answer dan ICE candidates.
2. **Synchronized Trigger:**
   * Host menekan tombol *"Mulai Foto"*.
   * Host mengirim pesan data `{ type: 'START_COUNTDOWN', delay: 3000 }` melalui `RTCDataChannel`.
   * Komponen `useSyncShutter` pada kedua perangkat menyinkronkan timer countdown visual dan audio.
3. **Side-by-Side Canvas Render Math:**
   * Pada saat capture pose ke-$i$:
     * Slot dibagi menjadi dua partisi: $	ext{Width}_{	ext{half}} = rac{	ext{Slot.width}}{2}$.
     * Area kiri $(	ext{Slot.x}, 	ext{Slot.y}, 	ext{Width}_{	ext{half}}, 	ext{Slot.height})$ merender crop video Host.
     * Area kanan $(	ext{Slot.x} + 	ext{Width}_{	ext{half}}, 	ext{Slot.y}, 	ext{Width}_{	ext{half}}, 	ext{Slot.height})$ merender crop video Guest.
   * Lapisan teratas menempelkan gambar PNG transparan dari template bingkai.

### 5.3 Non-Blocking GIF Encoding Pipeline
1. Komponen `ExportActions.tsx` mengumpulkan array snapshot pose yang telah diproses filter.
2. Hook `useGifCompiler` menginisialisasi `GIF` instance dari `gif.js` dengan konfigurasi:
   * `workers: 2` (memanfaatkan multi-threading via `/workers/gif.worker.js`).
   * `quality: 10`.
   * `workerScript: '/workers/gif.worker.js'`.
3. Worker memancarkan event progress (0–100%) ke progress bar antarmuka hingga Blob `image/gif` selesai dibentuk untuk diunduh lokal via `URL.createObjectURL`.

### 5.4 Privacy & Memory Cleanup Protocol
* Saat tombol *"Selesai & Hapus Sesi"* ditekan:
  1. `MediaStream.getTracks().forEach(track => track.stop())` dipanggil untuk mematikan hardware indikator kamera.
  2. WebRTC connection ditutup: `peerConnection.close()`.
  3. `resetSession()` Zustand store mengosongkan array `capturedPhotos = []` dan `selectedFrame = null`.
  4. Router me-redirect ke `/` (Landing Page).

---

## 6. Route Guards & Access Matrix

| Route Path | Authentication Level | Middleware / Guard Behavior |
| :--- | :--- | :--- |
| `/` | Public | Bebas diakses tanpa pengecekan token sesi |
| `/solo` | Public (Guest) | Bebas diakses, state tersimpan murni di RAM klien |
| `/room/lobby` | Authenticated | Redirect ke `/login?redirect=/room/lobby` jika belum ada sesi Supabase |
| `/room/[roomId]` | Authenticated | Redirect ke `/login?redirect=/room/[roomId]` jika guest belum terautentikasi |
| `/admin/*` | Authenticated + Admin Role | Validasi fungsi PostgreSQL `is_admin()`; tolak jika bukan admin |