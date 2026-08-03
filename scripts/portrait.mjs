/**
 * Derives the two portrait crops the site uses from the single source photo.
 *
 * A script rather than a one off command, because the framing is a judgement
 * call: if the crop ever needs to move, the numbers to change are here and
 * named, instead of being lost in a shell history.
 *
 * The source is 2304x2952 with the face high in the frame and slightly left of
 * centre, so neither output is a centred crop. Both windows are expressed as
 * fractions of the source, so replacing the photo with another of a different
 * size still produces something sane.
 *
 * Usage: node scripts/portrait.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets/portrait-source.jpeg";
const OUT = "public";

/**
 * Where the centre of the face sits in the source, as fractions of width and
 * height. Measured off the photo: the head runs from roughly 0.14 to 0.62 of
 * the height and 0.25 to 0.78 of the width.
 */
const FACE = { x: 0.515, y: 0.38 };

const outputs = [
  {
    /*
     * The header avatar. `span` is the crop width as a fraction of the source
     * width; 0.84 puts the head across most of the circle while keeping the
     * hair off the top edge and the chin off the bottom one. Tighter than this
     * and the circle clips the beard.
     */
    name: "soorya-avatar.webp",
    span: 0.84,
    aspect: 1, // width / height
    size: 128,
  },
  {
    /* The about page portrait: head and shoulders, 4:5. */
    name: "soorya-portrait.webp",
    span: 0.85,
    aspect: 4 / 5,
    size: 920,
  },
];

const image = sharp(SRC);
const { width: SW, height: SH } = await image.metadata();
console.log(`source ${SW}x${SH}`);

await mkdir(OUT, { recursive: true });

for (const o of outputs) {
  const cw = Math.round(SW * o.span);
  const ch = Math.round(cw / o.aspect);

  // centre the window on the face, then push it back inside the source rather
  // than letting sharp throw on an out of bounds extract
  const left = Math.max(0, Math.min(SW - cw, Math.round(SW * FACE.x - cw / 2)));
  const top = Math.max(0, Math.min(SH - ch, Math.round(SH * FACE.y - ch / 2)));

  const info = await sharp(SRC)
    .extract({ left, top, width: cw, height: ch })
    .resize(o.size, Math.round(o.size / o.aspect), { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${o.name}`);

  console.log(
    `${o.name.padEnd(24)} crop ${cw}x${ch} at (${left},${top}) -> ` +
      `${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)}KB`,
  );
}
