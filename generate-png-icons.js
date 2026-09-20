const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(size) {
  const width = size;
  const height = size;

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: RGBA (6)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  // Scanlines: height rows, each row has 1 filter byte (0) + width * 4 RGBA bytes
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height * 0.44;
  const sunRadius = width * 0.22;
  const cornerRadius = width * 0.2;

  // Colors
  const bgR = 79, bgG = 70, bgB = 229; // Indigo #4f46e5
  const sunR = 251, sunG = 191, sunB = 36; // Amber #fbbf24
  const rayR = 253, rayG = 224, rayB = 71; // Light amber #fde047
  const whiteR = 255, whiteG = 255, whiteB = 255;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rounded rectangle test
      let inBounds = true;
      const dxCorn = Math.max(Math.abs(x - width / 2) - (width / 2 - cornerRadius), 0);
      const dyCorn = Math.max(Math.abs(y - height / 2) - (height / 2 - cornerRadius), 0);
      if (dxCorn * dxCorn + dyCorn * dyCorn > cornerRadius * cornerRadius) {
        inBounds = false;
      }

      if (!inBounds) {
        // Transparent outside rounded rect
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Inside app icon background
      let r = bgR, g = bgG, b = bgB, a = 255;

      // Sun circle
      const dxSun = x - cx;
      const dySun = y - cy;
      const distSun = Math.sqrt(dxSun * dxSun + dySun * dySun);

      // Sun rays: 8 rays around sun
      const angle = Math.atan2(dySun, dxSun);
      const rayDistMin = sunRadius * 1.3;
      const rayDistMax = sunRadius * 1.65;
      const numRays = 8;
      const rayAngleSpacing = (2 * Math.PI) / numRays;
      const normAngle = (angle + 2 * Math.PI) % rayAngleSpacing;
      const distFromRayCenter = Math.abs(normAngle - rayAngleSpacing / 2);

      if (distSun >= rayDistMin && distSun <= rayDistMax && distFromRayCenter < 0.15) {
        r = rayR; g = rayG; b = rayB;
      } else if (distSun <= sunRadius) {
        // Sun body with anti-aliasing edge
        if (distSun > sunRadius - 1.5) {
          const t = (distSun - (sunRadius - 1.5)) / 1.5;
          r = Math.round(sunR * (1 - t) + bgR * t);
          g = Math.round(sunG * (1 - t) + bgG * t);
          b = Math.round(sunB * (1 - t) + bgB * t);
        } else {
          r = sunR; g = sunG; b = sunB;
        }
      }

      // Simple smiling arc below sun or small horizon bar
      const barY = height * 0.74;
      const barWidth = width * 0.45;
      const barHeight = Math.max(2, Math.round(height * 0.04));
      if (Math.abs(x - cx) < barWidth / 2 && Math.abs(y - barY) < barHeight / 2) {
        r = whiteR; g = whiteG; b = whiteB;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress scanlines with zlib
  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const pngBuffer = createPNG(size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Generated valid PNG: icon-${size}.png (${pngBuffer.length} bytes)`);
});

console.log('All real PNG icons generated successfully!');
