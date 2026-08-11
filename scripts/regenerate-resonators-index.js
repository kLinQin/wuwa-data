// scripts/regenerate-resonators-index.js
const fs = require('fs');
const path = require('path');

// ==================== MAPPING ====================
const ROLE_ID_MAP = {
  'Support and Healer': 1,
  'Main Damage Dealer': 2,
  'Concerto Efficiency': 3,
  'Basic Attack DMG': 4,
  'Heavy Attack DMG': 5,
  'Resonance Skill DMG': 6,
  'Resonance Liberation Damage': 7,
  'Traction': 8,
  'Coordinated Attack': 9,
  'Echo Skill DMG': 10,
  'Resonance Liberation Regeneration': 11,
  'Stagnation': 12,
  'DMG Amplification': 13,
  'Vibration Strength Reduction': 14,
  'Interruption Resistance Boost': 15,
  'Aero DMG Amplification': 16,
  'Electro DMG Amplification': 17,
  'Fusion DMG Amplification': 18,
  'Glacio DMG Amplification': 19,
  'Havoc DMG Amplification': 20,
  'Spectro DMG Amplification': 21,
  'Aero Erosion': 22,
  'Electro Flare': 23,
  'Glacio Chafe': 24,
  'Spectro Frazzle': 25,
  'Havoc Bane': 26,
  'Fusion Burst': 27,
  'Basic Attack DMG Amplification': 28,
  'Heavy Attack DMG Amplification': 29,
  'Resonance Skill DMG Amplification': 30,
  'Resonance Liberation DMG Amplification': 31,
  'Echo Skill DMG Amplification': 32,
  'Coordinated Attack DMG Amplification': 33,
  'Tune Break Boost': 34,
  'Tune Rupture Response': 35,
  'Tune Strain Response': 36,
  'Off-Tune Buildup Efficiency': 37,
  'Hack Response': 38
};

const SONATA_ID_MAP = {
  'Freezing Frost': 1,
  'Molten Rift': 2,
  'Void Thunder': 3,
  'Sierra Gale': 4,
  'Celestial Light': 5,
  'Havoc Eclipse': 6,
  'Rejuvenating Glow': 7,
  'Moonlit Clouds': 8,
  'Lingering Tunes': 9,
  'Frosty Resolve': 10,
  'Eternal Radiance': 11,
  'Midnight Veil': 12,
  'Empyrean Anthem': 13,
  'Tidebreaking Courage': 14,
  'Flaming Clawprint': 15,
  'Crown of Valor': 16,
  'Windward Pilgrimage': 17,
  'Gusts of Welkin': 18,
  'Dream of the Lost': 19,
  'Law of Harmony': 20,
  'Flamewing\'s Shadow': 21,
  'Thread of Severed Fate': 22,
  'Rite of Gilded Revelation': 23,
  'Pact of Neonlight Leap': 24,
  'Halo of Starry Radiance': 25,
  'Chromatic Foam': 26,
  'Sound of True Name': 27,
  'Wishes of Quiet Snowfall': 28,
  'Shadow of Shattered Dreams': 29,
  'Reel of Spliced Memories': 30,
  'Trailblazing Star': 31,
  'Song of Feather Trace': 32,
  'Heart of Evil\'s Purge': 33,
  'Lamp of Nether Road': 34
};

// ==================== MAIN ====================
const resonatorsPath = path.join(__dirname, '../resonators');
const files = fs.readdirSync(resonatorsPath).filter(f => f.endsWith('.json') && f !== 'index.json');

const index = [];

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(resonatorsPath, file), 'utf8'));
  if (!data.id) return;
  
  // Convert roles from string to number
  const roles = (data.roles || []).map(r => ROLE_ID_MAP[r]).filter(id => id !== undefined);
  
  // Convert sonatas from string to number
  const sonatas = (data.sonatas || []).map(s => SONATA_ID_MAP[s]).filter(id => id !== undefined);
  
  index.push({
    id: data.id,
    name: data.name,
    element: data.element,
    rarity: data.rarity,
    weapon: data.weapon,
    version: data.version || '1.0',
    lastUpdated: data.lastUpdated || '',
    roles: roles,
    sonatas: sonatas,
    image: data.image || '',
    icon: data.icon || '',
    faction: data.faction || '',
    affiliation: data.affiliation || '',
    class: data.class || ''
  });
});

// Sort by id
index.sort((a, b) => a.id - b.id);

// Write to file
fs.writeFileSync(
  path.join(resonatorsPath, 'index.json'),
  JSON.stringify(index, null, 2)
);

console.log(`✅ Resonators index regenerated: ${index.length} entries`);