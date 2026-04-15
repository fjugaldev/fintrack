import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../public/icon-dark.png");
const OUT = join(__dirname, "../public/icons");

mkdirSync(OUT, { recursive: true });

const sizes = [16, 32, 48, 72, 96, 128, 152, 167, 180, 192, 384, 512];

// Iconos estándar
for (const size of sizes) {
  const name =
    size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await sharp(SRC).resize(size, size).toFile(join(OUT, name));
  console.log(`✓ ${name}`);
}

// Iconos maskable: fondo #111110 + ícono al 75% centrado
for (const size of [192, 512]) {
  const iconSize = Math.round(size * 0.75);
  const padding = Math.round((size - iconSize) / 2);

  const resized = await sharp(SRC).resize(iconSize, iconSize).toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 17, g: 17, b: 16, alpha: 1 },
    },
  })
    .composite([{ input: resized, top: padding, left: padding }])
    .png()
    .toFile(join(OUT, `icon-maskable-${size}.png`));

  console.log(`✓ icon-maskable-${size}.png`);
}

console.log("\n✅ Todos los iconos generados en public/icons/");
