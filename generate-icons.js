const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(s => {
  const rx = Math.round(s * 0.18);
  const cx = s / 2;
  const cy = Math.round(s * 0.43);
  const r = Math.round(s * 0.15);
  const ty = Math.round(s * 0.85);
  const fz = Math.round(s * 0.12);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${rx}" fill="#4f46e5"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbbf24"/>
  <text x="${cx}" y="${ty}" font-family="system-ui" font-weight="700" font-size="${fz}" fill="white" text-anchor="middle">Sri's Day</text>
</svg>`;

  fs.writeFileSync(`public/icons/icon-${s}.png`, svg);
});

console.log('Icons created!');
