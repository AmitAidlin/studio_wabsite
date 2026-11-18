// Cleans the wall background and softens the light, keeping the product.
// usage: node edit-photo.mjs input output [previewMask.png] [x0 x1]
//   x0/x1 (0..1) = keep the product only between these horizontal fractions of the photo
import sharp from "sharp";

const [, , input, output, previewMask, fx0 = "0", fx1 = "1", fx1Top = fx1] = process.argv;

// apply EXIF rotation first so width/height match what you see
const rotated = await sharp(input).rotate().toBuffer();
const { width: W, height: H } = await sharp(rotated).metadata();
const N = W * H;

// 1) soft mask of the product (dark or colourful pixels vs. the pale, low-saturation wall)
const src = await sharp(rotated).removeAlpha().raw().toBuffer();
const raw = Buffer.alloc(N);
for (let i = 0; i < N; i++) {
  const r = src[i * 3], g = src[i * 3 + 1], b = src[i * 3 + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = mx ? (mx - mn) / mx : 0;
  const dark = lum < 70 ? 255 : lum < 100 ? ((100 - lum) / 30) * 255 : 0;
  const color = sat > 0.2 ? 255 : sat > 0.13 ? ((sat - 0.13) / 0.07) * 255 : 0;
  const x = (i % W) / W;
  const y = Math.floor(i / W) / H;
  const right = y < 0.3 ? Number(fx1Top) : Number(fx1); // narrower limit near the top (hanging loop)
  raw[i] = x < Number(fx0) || x > right ? 0 : Math.max(dark, color);
}
const gray = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 1 } });
// close small holes, feather the edge
const maskBuf = await gray(await gray(raw).blur(6).threshold(90).extractChannel(0).raw().toBuffer())
  .blur(2.5).extractChannel(0).raw().toBuffer();
if (previewMask) await gray(maskBuf).resize({ width: 500 }).png().toFile(previewMask);

// 2) soft studio light on the product
const lit = await sharp(rotated)
  .modulate({ brightness: 1.2, saturation: 1.05 })
  .linear(0.9, 22)
  .removeAlpha().raw().toBuffer();

// 3) soft contact shadow = blurred, shifted copy of the mask
// (sharp runs extract before extend, so shift in two separate steps)
const blurred = await gray(maskBuf).blur(40).extend({ top: 22, left: 14, background: { r: 0, g: 0, b: 0 } }).png().toBuffer();
const shadow = await sharp(blurred)
  .extract({ left: 0, top: 0, width: W, height: H })
  .extractChannel(0)
  .raw().toBuffer();
if (shadow.length !== N) throw new Error(`shadow buffer is ${shadow.length} bytes, expected ${N}`);
if (maskBuf.length !== N) throw new Error(`mask buffer is ${maskBuf.length} bytes, expected ${N}`);

// 4) composite: clean warm off-white background (soft top-to-bottom gradient) + shadow + product
const out = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  const y = Math.floor(i / W) / H;
  const bg = [250 - 7 * y, 249 - 8 * y, 246 - 9 * y];
  const sh = 1 - (shadow[i] / 255) * 0.2;
  const m = maskBuf[i] / 255;
  for (let c = 0; c < 3; c++) {
    out[i * 3 + c] = bg[c] * sh * (1 - m) + lit[i * 3 + c] * m;
  }
}
await sharp(out, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 92 })
  .toFile(output);
console.log("saved", output);
