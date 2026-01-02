#!/usr/bin/env node
/**
 * PWA Icon Generator Script
 * Generates PNG icons from SVG for PWA manifest
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requirements:
 * - npm install sharp (run from project root)
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise provide instructions
async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const svgPath = path.join(publicDir, 'favicon.svg');

  // Read SVG content
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Icon sizes to generate
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-192.png', size: 192, maskable: true },
    { name: 'icon-maskable-512.png', size: 512, maskable: true },
  ];

  try {
    const sharp = require('sharp');

    for (const { name, size, maskable } of sizes) {
      let svg = svgContent;

      // For maskable icons, add extra padding (safe zone)
      if (maskable) {
        // Maskable icons need 10% safe zone on each side (20% total)
        const innerSize = Math.round(size * 0.8);
        const offset = Math.round(size * 0.1);
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <rect width="${size}" height="${size}" fill="#FFC425"/>
          <svg x="${offset}" y="${offset}" width="${innerSize}" height="${innerSize}" viewBox="0 0 512 512">
            ${svgContent.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
          </svg>
        </svg>`;
      }

      const outputPath = path.join(publicDir, name);

      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate apple-touch-icon (180x180)
    await sharp(Buffer.from(svgContent))
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png (180x180)');

    console.log('\n✅ All icons generated successfully!');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Sharp module not found. To generate icons:');
      console.log('');
      console.log('1. Install sharp: npm install sharp --save-dev');
      console.log('2. Run this script again: node scripts/generate-icons.js');
      console.log('');
      console.log('Alternatively, use an online tool:');
      console.log('- https://realfavicongenerator.net/');
      console.log('- https://www.pwabuilder.com/imageGenerator');
      console.log('');
      console.log('Upload your favicon.svg and download the generated icons.');

      // Create placeholder files so the manifest doesn't 404
      createPlaceholders(publicDir, sizes);
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

// Create placeholder PNG files (minimal valid PNG)
function createPlaceholders(publicDir, sizes) {
  console.log('\nCreating placeholder PNGs (replace with real icons later)...');

  // Minimal 1x1 transparent PNG (base64)
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  for (const { name } of sizes) {
    const outputPath = path.join(publicDir, name);
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, minimalPng);
      console.log(`  Created placeholder: ${name}`);
    }
  }
}

generateIcons();
