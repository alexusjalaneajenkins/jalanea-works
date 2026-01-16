/**
 * PWA Icon Generator
 *
 * Generates all required PWA icon sizes from the source SVG.
 * Run with: node scripts/generate-pwa-icons.js
 *
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_SVG = path.join(__dirname, '../public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read the SVG source
  const svgBuffer = fs.readFileSync(SOURCE_SVG);

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Created: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error creating ${size}x${size}: ${error.message}`);
    }
  }

  // Generate Apple Touch Icon (180x180)
  try {
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
    console.log('Created: apple-touch-icon.png');
  } catch (error) {
    console.error(`Error creating apple-touch-icon: ${error.message}`);
  }

  // Generate favicon sizes
  for (const size of [16, 32]) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`));
      console.log(`Created: favicon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error creating favicon-${size}: ${error.message}`);
    }
  }

  console.log('\nDone! All PWA icons generated.');
  console.log('\nNext steps:');
  console.log('1. Verify icons look correct in public/icons/');
  console.log('2. Convert favicon-32x32.png to favicon.ico if needed');
}

generateIcons().catch(console.error);
