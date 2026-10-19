import { type FrameSlot } from '@/stores/usePhotoboothStore';

export interface GreenScreenDetectionResult {
  slots: FrameSlot[];
  punchedBlob: Blob;
  punchedDataUrl: string;
  simulatedPreviewUrl: string;
  originalWidth: number;
  originalHeight: number;
  detectedCount: number;
}

export interface DetectionOptions {
  targetCanvasWidth?: number;
  targetCanvasHeight?: number;
  greenTolerance?: number; // 0-100 threshold
  minPixelPercent?: number; // Minimum blob size as % of total pixels
}

/**
 * Checks whether an RGBA pixel belongs to a Chroma-Key Green screen
 */
function isChromaGreen(r: number, g: number, b: number, a: number): boolean {
  if (a < 30) return false;
  // Green dominant: pure chroma key (#00FF00) or compressed chroma green
  if (g > 140 && r < 125 && b < 125 && g - Math.max(r, b) > 40) return true;
  if (g > 90 && g > r * 1.35 && g > b * 1.35) return true;
  return false;
}

/**
 * Scans an uploaded PNG image, detects all Green Screen slot regions,
 * punches out the green color to 100% transparency, and returns coordinates.
 */
export async function detectAndPunchGreenScreen(
  fileOrSrc: File | string,
  options: DetectionOptions = {}
): Promise<GreenScreenDetectionResult> {
  const img = await loadImage(fileOrSrc);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  if (origW === 0 || origH === 0) {
    throw new Error('Dimensi gambar tidak valid');
  }

  // Canvas dimensions and aspect ratio match the uploaded frame template exactly
  const width = origW;
  const height = origH;

  // 1. Create in-memory canvas for scanning and punching
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Gagal menginisialisasi Canvas 2D context');

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 2. Fast Connected Component Labeling via Breadth-First-Search
  const totalPixels = width * height;
  const minPixels = Math.max(300, Math.round(totalPixels * (options.minPixelPercent || 0.005)));
  const visited = new Uint8Array(totalPixels);
  const rawBlobs: { minX: number; maxX: number; minY: number; maxY: number; count: number }[] = [];

  // BFS Queue buffers
  const queueX = new Int32Array(totalPixels);
  const queueY = new Int32Array(totalPixels);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (visited[idx]) continue;

      const pIdx = idx * 4;
      if (!isChromaGreen(data[pIdx], data[pIdx + 1], data[pIdx + 2], data[pIdx + 3])) {
        continue;
      }

      // Found unvisited green pixel -> Start BFS
      let qHead = 0;
      let qTail = 0;
      queueX[qTail] = x;
      queueY[qTail] = y;
      qTail++;
      visited[idx] = 1;

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;

      while (qHead < qTail) {
        const cx = queueX[qHead];
        const cy = queueY[qHead];
        qHead++;
        count++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        // Check 4 neighbors (Up, Down, Left, Right)
        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (let n = 0; n < 4; n++) {
          const nx = neighbors[n][0];
          const ny = neighbors[n][1];
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (!visited[nIdx]) {
              const npIdx = nIdx * 4;
              if (isChromaGreen(data[npIdx], data[npIdx + 1], data[npIdx + 2], data[npIdx + 3])) {
                visited[nIdx] = 1;
                queueX[qTail] = nx;
                queueY[qTail] = ny;
                qTail++;
              }
            }
          }
        }
      }

      if (count >= minPixels) {
        rawBlobs.push({ minX, maxX, minY, maxY, count });
      }
    }
  }

  if (rawBlobs.length === 0) {
    throw new Error(
      'Tidak ditemukan area Green Screen (#00FF00) pada template. Pastikan area foto diwarnai hijau murni.'
    );
  }

  // 3. Sort Slots: Row-bucketed top-to-bottom, left-to-right
  const avgHeight =
    rawBlobs.reduce((acc, b) => acc + (b.maxY - b.minY + 1), 0) / rawBlobs.length;
  const rowThreshold = Math.max(20, avgHeight * 0.4);

  rawBlobs.sort((a, b) => {
    const rowA = Math.round(a.minY / rowThreshold);
    const rowB = Math.round(b.minY / rowThreshold);
    if (rowA !== rowB) return rowA - rowB;
    return a.minX - b.minX;
  });

  // 4. Compute Coordinates directly in canvas pixel space (1:1 parity)
  const slots: FrameSlot[] = rawBlobs.map((blob, idx) => ({
    index: idx,
    x: blob.minX,
    y: blob.minY,
    width: blob.maxX - blob.minX + 1,
    height: blob.maxY - blob.minY + 1,
  }));

  // 5. Punch out Green Pixels to 100% Transparency & de-fringe borders
  const isMarked = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const pIdx = i * 4;
    if (isChromaGreen(data[pIdx], data[pIdx + 1], data[pIdx + 2], data[pIdx + 3])) {
      isMarked[i] = 1;
      data[pIdx + 3] = 0; // Alpha = 0 (Transparent)
    }
  }

  // 1-pixel de-fringe dilation pass to cleanly punch anti-aliased green edge fringes
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x;
      if (isMarked[idx]) continue;

      if (
        isMarked[idx - 1] ||
        isMarked[idx + 1] ||
        isMarked[idx - width] ||
        isMarked[idx + width]
      ) {
        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        if (g > r && g > b) {
          data[pIdx + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 6. Export Punched Transparent PNG Blob & Data URL
  const punchedDataUrl = canvas.toDataURL('image/png');
  const punchedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal mengekspor PNG'))), 'image/png');
  });

  // 7. Generate Simulated Photo Preview
  const simulatedPreviewUrl = generateSimulatedPreview(canvas, rawBlobs, width, height);

  return {
    slots,
    punchedBlob,
    punchedDataUrl,
    simulatedPreviewUrl,
    originalWidth: origW,
    originalHeight: origH,
    detectedCount: slots.length,
  };
}

/**
 * Creates a simulated composite preview with sample portrait photos
 * to visually verify that stickers and borders overlay seamlessly.
 */
function generateSimulatedPreview(
  punchedFrameCanvas: HTMLCanvasElement,
  rawBlobs: { minX: number; maxX: number; minY: number; maxY: number }[],
  width: number,
  height: number
): string {
  const simCanvas = document.createElement('canvas');
  simCanvas.width = width;
  simCanvas.height = height;
  const sCtx = simCanvas.getContext('2d');
  if (!sCtx) return punchedFrameCanvas.toDataURL();

  // Background tone
  sCtx.fillStyle = '#fdf9f3';
  sCtx.fillRect(0, 0, width, height);

  // Pastel sample portrait colors
  const sampleColors = ['#fde2e8', '#dfe0ff', '#fef08a', '#ffdcbd', '#e0e7ff', '#ffd8ec'];

  // Draw simulated photos inside each slot
  rawBlobs.forEach((blob, idx) => {
    const w = blob.maxX - blob.minX + 1;
    const h = blob.maxY - blob.minY + 1;
    const bgCol = sampleColors[idx % sampleColors.length];

    sCtx.fillStyle = bgCol;
    sCtx.fillRect(blob.minX, blob.minY, w, h);

    // Cute silhouette avatar placeholder
    sCtx.fillStyle = '#1c1c1825';
    const cx = blob.minX + w / 2;
    const cy = blob.minY + h * 0.42;
    const r = Math.min(w, h) * 0.22;
    sCtx.beginPath();
    sCtx.arc(cx, cy, r, 0, Math.PI * 2);
    sCtx.fill();

    // Body curve
    sCtx.beginPath();
    sCtx.ellipse(cx, blob.minY + h * 0.9, r * 1.5, r * 1.1, 0, 0, Math.PI * 2);
    sCtx.fill();

    // Pose Label
    sCtx.fillStyle = '#1c1c18';
    sCtx.font = `bold ${Math.max(12, Math.round(w * 0.08))}px sans-serif`;
    sCtx.textAlign = 'center';
    sCtx.fillText(`Pose #${idx + 1}`, cx, blob.minY + h * 0.5);
  });

  // Layer the punched frame ON TOP of the photos!
  sCtx.drawImage(punchedFrameCanvas, 0, 0);

  return simCanvas.toDataURL('image/png');
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Gagal memuat gambar template frame'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}
