/**
 * Script to download skill icons from ffxivrotations.com
 *
 * Usage: node scripts/download-icons.js
 *
 * This script:
 * 1. Scans all opener JSON files in src/data/openers/
 * 2. Extracts unique skill names from actions
 * 3. Downloads icons from https://ffxivrotations.com/icon/{skillName}.png
 * 4. Saves them to public/icons/ with the iconId as filename
 * 5. Skips icons that already exist locally
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const OPENERS_DIR = join(projectRoot, 'src', 'data', 'openers');
const ICONS_DIR = join(projectRoot, 'public', 'icons');
const SKILL_MAP_FILE = join(__dirname, 'skill-id-map.json');
const ICON_BASE_URL = 'https://ffxivrotations.com/icon/';

// Load skill ID mapping
let skillIdMap = {};
if (existsSync(SKILL_MAP_FILE)) {
  const mapContent = readFileSync(SKILL_MAP_FILE, 'utf-8');
  skillIdMap = JSON.parse(mapContent).mappings || {};
  console.log(`Loaded ${Object.keys(skillIdMap).length} skill ID mappings`);
}

// Ensure icons directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
  console.log(`Created directory: ${ICONS_DIR}`);
}

/**
 * Download a file from a URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = writeFileSync.bind(null, destPath);
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            writeFileSync(destPath, Buffer.concat(chunks));
            resolve(true);
          });
        } else if (response.statusCode === 404) {
          resolve(false); // Icon not found, that's okay
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      })
      .on('error', reject);
  });
}

/**
 * URL encode skill name for the API
 */
function encodeSkillName(name) {
  return encodeURIComponent(name);
}

/**
 * Get alternative name formats to try
 */
function getNameVariants(name) {
  const variants = [
    name, // Original: "Fire III"
    name.replace(/\s+/g, ''), // No spaces: "FireIII"
    name.replace(/\s+/g, '_'), // Underscores: "Fire_III"
    name.replace(/\s+/g, '-'), // Dashes: "Fire-III"
    name.replace(/'/g, ''), // No apostrophes: "Storms Path"
    name.replace(/'/g, '').replace(/\s+/g, ''), // No apostrophes or spaces: "StormsPath"
  ];

  // Remove duplicates
  return [...new Set(variants)];
}

/**
 * Convert hex action ID to decimal skill ID
 */
function hexToDecimal(hexString) {
  // Remove any leading zeros or "0x" prefix
  const cleaned = hexString.replace(/^0x/i, '').replace(/^0+/, '') || '0';
  return parseInt(cleaned, 16);
}

/**
 * Get all unique icons needed from opener files
 */
function getRequiredIcons() {
  const icons = new Map(); // iconId -> { name, actionId }

  const openerFiles = readdirSync(OPENERS_DIR).filter((f) => f.endsWith('.json'));

  for (const file of openerFiles) {
    const filePath = join(OPENERS_DIR, file);
    const content = readFileSync(filePath, 'utf-8');
    const opener = JSON.parse(content);

    console.log(`Scanning ${file}...`);

    for (const action of opener.actions) {
      if (action.iconId && action.name) {
        icons.set(action.iconId, {
          name: action.name,
          actionId: action.actionId,
        });
      }
    }
  }

  return icons;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== FFXIV Icon Downloader ===\n');

  const requiredIcons = getRequiredIcons();
  console.log(`\nFound ${requiredIcons.size} unique icons needed\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [iconId, skillData] of requiredIcons) {
    const { name: skillName, actionId } = skillData;
    const filename = `${iconId}.png`;
    const destPath = join(ICONS_DIR, filename);

    // Skip if already exists
    if (existsSync(destPath)) {
      console.log(`✓ Skip: ${skillName} (${iconId}) - already exists`);
      skipped++;
      continue;
    }

    let success = false;

    try {
      console.log(`⬇ Downloading: ${skillName} (${iconId})...`);

      // Try 1: Manual skill ID mapping (most reliable)
      if (actionId) {
        const normalizedActionId = actionId.toUpperCase().replace(/^0X/, '');
        if (skillIdMap[normalizedActionId]) {
          const mappedSkillId = skillIdMap[normalizedActionId];
          const url = `${ICON_BASE_URL}s${mappedSkillId}.png`;
          success = await downloadFile(url, destPath);

          if (success) {
            console.log(`✓ Downloaded: ${skillName} -> ${filename} (using mapped skill ID: s${mappedSkillId})`);
            downloaded++;
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }
        }
      }

      // Try 2: Skill ID format via hex conversion (sometimes works)
      if (actionId) {
        const skillId = hexToDecimal(actionId);
        const url = `${ICON_BASE_URL}s${skillId}.png`;
        success = await downloadFile(url, destPath);

        if (success) {
          console.log(`✓ Downloaded: ${skillName} -> ${filename} (using converted skill ID: s${skillId})`);
          downloaded++;
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Try 3: Name variants
      const variants = getNameVariants(skillName);
      for (const variant of variants) {
        const url = `${ICON_BASE_URL}${encodeSkillName(variant)}.png`;
        success = await downloadFile(url, destPath);

        if (success) {
          console.log(`✓ Downloaded: ${skillName} -> ${filename} (using name: "${variant}")`);
          downloaded++;
          break;
        }

        // Small delay between variant attempts
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      if (!success) {
        // Fallback: Use placeholder icon (Limit Break)
        const placeholderPath = join(ICONS_DIR, 'placeholder.png');
        if (existsSync(placeholderPath)) {
          const placeholderContent = readFileSync(placeholderPath);
          writeFileSync(destPath, placeholderContent);
          console.log(`⚠ Using placeholder: ${skillName} -> ${filename} (icon not found)`);
          downloaded++;
        } else {
          console.log(
            `✗ Not found: ${skillName} (tried skill ID s${actionId ? hexToDecimal(actionId) : 'N/A'} + ${variants.length} name variants)`
          );
          failed++;
        }
      }

      // Rate limit: wait 100ms between icons
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`✗ Error downloading ${skillName}:`, error.message);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${requiredIcons.size}`);

  if (failed > 0) {
    console.log(`\nNote: Failed icons may need to be downloaded manually or have different names.`);
    console.log(`Check: https://ffxivrotations.com/`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
