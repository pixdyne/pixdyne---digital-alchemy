// Regenerates lib/data/image-meta.json — the intrinsic size of every project
// image under /public/work and /public/projects, plus, for transparent device
// mockups, the box their visible pixels occupy. Layouts use it to show each
// image at its own proportions (never cropped) and to drop the empty
// transparent margin around a mockup so the device itself sets the size.
//
//   node scripts/image-meta.mjs
//
// Re-run after adding or replacing a project image. Images missing from the
// table still render — at their header size, untrimmed (lib/image-dims.ts).
// Uses sharp, which ships with Next.js.

import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dirs = ['work', 'projects'];
const out = {};

for (const dir of dirs) {
  for (const file of readdirSync(path.join(root, 'public', dir)).sort()) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const src = `/${dir}/${file}`;
    const full = path.join(root, 'public', dir, file);
    const meta = await sharp(full).metadata();
    const entry = { w: meta.width, h: meta.height, kind: 'screen' };
    if (meta.hasAlpha) {
      // trim() against the top-left pixel — transparent for a mockup
      const { info } = await sharp(full).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
      const box = [-(info.trimOffsetLeft ?? 0), -(info.trimOffsetTop ?? 0), info.width, info.height];
      const corner = await sharp(full).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
      if (corner[3] < 20) {
        entry.kind = 'device';
        if (box[2] < meta.width || box[3] < meta.height) entry.box = box;
      }
    }
    out[src] = entry;
  }
}

// one image per line keeps the diff readable when an image is added
const lines = Object.entries(out).map(([src, v]) => `  ${JSON.stringify(src)}: ${JSON.stringify(v)}`);
writeFileSync(path.join(root, 'lib/data/image-meta.json'), `{\n${lines.join(',\n')}\n}\n`);
console.log(`image-meta: ${Object.keys(out).length} images`);
