import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#f97316"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#1a1a1a" stroke-width="10"/>
  <path d="M256 76 V436" stroke="#1a1a1a" stroke-width="10" fill="none"/>
  <path d="M76 256 H436" stroke="#1a1a1a" stroke-width="10" fill="none"/>
  <path d="M110 140 C 180 210, 180 302, 110 372" stroke="#1a1a1a" stroke-width="10" fill="none"/>
  <path d="M402 140 C 332 210, 332 302, 402 372" stroke="#1a1a1a" stroke-width="10" fill="none"/>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`wrote public/icons/icon-${size}.png`);
}
