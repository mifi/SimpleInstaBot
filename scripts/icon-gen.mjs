import sharp from 'sharp';

const svg2png = (from, to, width, height) => sharp(from)
  .png()
  .resize(width, height, {
    fit: sharp.fit.contain,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toFile(to);

await svg2png('src/icon.svg', './icon-build/app-512.png', 512, 512);
