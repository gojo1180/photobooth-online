import { CanvasTexture, SRGBColorSpace } from 'three';

// Small local textures keep the demo independent of fonts, HDR downloads, and
// image services. The portraits are illustrations, never user camera captures.
export function makeSceneTexture(kind: 'brand' | 'postcard' | 'strip', variant = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'strip' ? 256 : 512;
  canvas.height = kind === 'strip' ? 640 : 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas textures unavailable');

  if (kind === 'brand') {
    ctx.fillStyle = '#001c97';
    ctx.font = 'italic bold 80px Georgia';
    ctx.fillText('scribblepie', 8, 88);
    ctx.font = '22px monospace';
    ctx.fillText('SNAPBOOTH / 01', 14, 136);
  } else if (kind === 'postcard') {
    ctx.fillStyle = '#ffd8ec';
    ctx.fillRect(0, 0, 512, 192);
    ctx.fillStyle = '#541b44';
    ctx.font = '42px Georgia';
    ctx.fillText('made for', 34, 66);
    ctx.font = 'italic 60px Georgia';
    ctx.fillText('memories.', 34, 136);
    ctx.font = '70px Georgia';
    ctx.fillText('✦', 390, 110);
  } else {
    const palettes = ['#abcac2', '#dcae8e', '#bfc3e9'];
    ctx.fillStyle = variant % 2 ? '#ffebc6' : '#ffe2ee';
    ctx.fillRect(0, 0, 256, 640);
    ctx.fillStyle = '#541b44';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TODAY LOOKS GOOD ON YOU', 128, 26);
    for (let i = 0; i < 3; i++) {
      const y = 43 + i * 173;
      ctx.save();
      ctx.beginPath();
      ctx.rect(16, y, 224, 160);
      ctx.clip();
      ctx.fillStyle = palettes[(i + variant) % 3];
      ctx.fillRect(16, y, 224, 160);
      ctx.fillStyle = '#fff5c6';
      ctx.beginPath(); ctx.arc(192, y + 36, 26, 0, Math.PI * 2); ctx.fill();
      ctx.translate(120 + Math.sin(i + variant) * 17, y + 85);
      ctx.rotate(Math.sin(i * 2 + variant) * .17);
      ctx.fillStyle = (i + variant) % 2 ? '#1230c7' : '#fff0d1';
      ctx.beginPath(); ctx.ellipse(0, 77, 66, 67, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a65b3c';
      ctx.beginPath(); ctx.ellipse(0, -4, 35, 44, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#342a37';
      ctx.beginPath(); ctx.ellipse(-3, -29, 38, 24, -.18, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-36, -26, 12, 35);
      ctx.fillStyle = '#342a37';
      ctx.beginPath(); ctx.arc(-12, -2, 3, 0, Math.PI * 2); ctx.arc(12, -2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffe2cb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 12, 9, 0, Math.PI); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fff8df'; ctx.font = '32px Georgia'; ctx.fillText('✦', 40, y + 38);
      ctx.font = '12px monospace'; ctx.fillText(`0${i + 1}`, 222, y + 147);
    }
    ctx.fillStyle = '#541b44'; ctx.font = 'italic bold 30px Georgia';
    ctx.fillText('scribblepie', 128, 610);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}
