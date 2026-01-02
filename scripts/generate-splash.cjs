#!/usr/bin/env node
/**
 * iOS Splash Screen Generator
 * Generates splash screen PNGs for all iOS device sizes
 *
 * Usage: node scripts/generate-splash.cjs
 *
 * Requirements:
 * - npm install sharp (run from project root)
 */

const fs = require('fs');
const path = require('path');

// All iOS splash screen sizes
const splashSizes = [
  { name: 'splash-640x1136.png', width: 640, height: 1136 },    // iPhone SE
  { name: 'splash-750x1334.png', width: 750, height: 1334 },    // iPhone 6/7/8
  { name: 'splash-1242x2208.png', width: 1242, height: 2208 },  // iPhone 6+/7+/8+
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 },  // iPhone X/XS/11 Pro
  { name: 'splash-828x1792.png', width: 828, height: 1792 },    // iPhone XR/11
  { name: 'splash-1242x2688.png', width: 1242, height: 2688 },  // iPhone XS Max/11 Pro Max
  { name: 'splash-1080x2340.png', width: 1080, height: 2340 },  // iPhone 12 mini
  { name: 'splash-1170x2532.png', width: 1170, height: 2532 },  // iPhone 12/13/14
  { name: 'splash-1284x2778.png', width: 1284, height: 2778 },  // iPhone 12/13/14 Pro Max
  { name: 'splash-1179x2556.png', width: 1179, height: 2556 },  // iPhone 14 Pro
  { name: 'splash-1290x2796.png', width: 1290, height: 2796 },  // iPhone 14/15 Pro Max
  { name: 'splash-1536x2048.png', width: 1536, height: 2048 },  // iPad Mini/Air
  { name: 'splash-1668x2224.png', width: 1668, height: 2224 },  // iPad Pro 10.5
  { name: 'splash-1668x2388.png', width: 1668, height: 2388 },  // iPad Pro 11
  { name: 'splash-2048x2732.png', width: 2048, height: 2732 },  // iPad Pro 12.9
];

async function generateSplashScreens() {
  const publicDir = path.join(__dirname, '..', 'public');
  const splashDir = path.join(publicDir, 'splash');

  // Ensure splash directory exists
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  try {
    const sharp = require('sharp');

    for (const { name, width, height } of splashSizes) {
      // Create SVG splash screen
      const iconSize = Math.min(width, height) * 0.2;
      const iconX = (width - iconSize) / 2;
      const iconY = (height - iconSize) / 2 - height * 0.05;
      const textY = iconY + iconSize + height * 0.05;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <!-- Gradient Background -->
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#0f172a"/>
              <stop offset="50%" style="stop-color:#020617"/>
              <stop offset="100%" style="stop-color:#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#bg)"/>

          <!-- Icon Container with Glow -->
          <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.2}" fill="#FFC425"/>

          <!-- Lightning Bolt -->
          <svg x="${iconX + iconSize * 0.2}" y="${iconY + iconSize * 0.15}" width="${iconSize * 0.6}" height="${iconSize * 0.7}">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
               fill="#0f172a"
               stroke="#0f172a"
               stroke-width="1"
               stroke-linejoin="round"
               stroke-linecap="round"
               transform="scale(${(iconSize * 0.6) / 24})" />
          </svg>

          <!-- App Name -->
          <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${width * 0.06}" font-weight="700" fill="white">Jalanea<tspan fill="#FFC425">Works</tspan></text>

          <!-- Tagline -->
          <text x="${width / 2}" y="${textY + width * 0.04}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${width * 0.025}" fill="#64748b">Career Launchpad</text>
        </svg>
      `;

      const outputPath = path.join(splashDir, name);

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${name}`);
    }

    console.log('\n✅ All splash screens generated successfully!');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Sharp module not found. To generate splash screens:');
      console.log('');
      console.log('1. Install sharp: npm install sharp --save-dev');
      console.log('2. Run this script again: node scripts/generate-splash.cjs');
      console.log('');
      console.log('Alternatively, use an online tool:');
      console.log('- https://appsco.pe/developer/splash-screens');
      console.log('- https://progressier.com/pwa-icons-and-ios-splash-screen-generator');
      console.log('');

      // Create placeholder files
      createPlaceholders(splashDir, splashSizes);
    } else {
      console.error('Error generating splash screens:', error);
    }
  }
}

// Create placeholder PNG files
function createPlaceholders(splashDir, sizes) {
  console.log('Creating placeholder splash screens...');

  // Minimal 1x1 PNG
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  for (const { name } of sizes) {
    const outputPath = path.join(splashDir, name);
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, minimalPng);
      console.log(`  Created placeholder: ${name}`);
    }
  }
}

generateSplashScreens();
