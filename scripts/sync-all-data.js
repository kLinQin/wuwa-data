// scripts/sync-all-data.js
const fs = require('fs');
const path = require('path');

// ==================== KONFIGURASI ====================
const BASE_DIR = path.join(__dirname, '..');
const FOLDERS = {
  resonators: path.join(BASE_DIR, 'resonators'),
  builds: path.join(BASE_DIR, 'builds'),
  lores: path.join(BASE_DIR, 'lores'),
  echoes: path.join(BASE_DIR, 'echoes'),
  weapons: path.join(BASE_DIR, 'weapons'),
  sonatas: path.join(BASE_DIR, 'sonatas'),
  constants: path.join(BASE_DIR, 'constants')
};

// ==================== MAPPING ====================
const WEAPON_TYPE_MAP = {
  1: 'Broadblade',
  2: 'Sword',
  3: 'Pistols',
  4: 'Gauntlets',
  5: 'Rectifier'
};

const ELEMENT_MAP = {
  1: 'Glacio',
  2: 'Fusion',
  3: 'Electro',
  4: 'Aero',
  5: 'Spectro',
  6: 'Havoc'
};

// ==================== FUNGSI UTILITY ====================
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return null;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e.message);
    return false;
  }
}

function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// ==================== 1. CHECK STATUS ====================
function checkStatus() {
  console.log('\n📊 DATA STATUS CHECK\n' + '='.repeat(50));
  
  const results = {};
  let totalIssues = 0;
  
  // Check resonators
  const resonatorsPath = FOLDERS.resonators;
  if (fs.existsSync(resonatorsPath)) {
    const files = fs.readdirSync(resonatorsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(resonatorsPath, 'index.json'));
    
    let hasId = 0;
    let noId = 0;
    let missingInIndex = 0;
    
    files.forEach(file => {
      const data = readJSON(path.join(resonatorsPath, file));
      if (data) {
        if (data.id) hasId++;
        else noId++;
        
        // Check if in index
        if (index) {
          const found = index.some(item => item.id === data.id || item.name === data.name);
          if (!found && data.id) missingInIndex++;
        }
      }
    });
    
    results.resonators = { files: files.length, hasId, noId, missingInIndex };
    totalIssues += noId + missingInIndex;
    console.log(`📁 resonators/ : ${files.length} files, ${hasId} have ID, ${noId} missing ID, ${missingInIndex} missing in index`);
  }
  
  // Check builds
  const buildsPath = FOLDERS.builds;
  if (fs.existsSync(buildsPath)) {
    const files = fs.readdirSync(buildsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(buildsPath, 'index.json'));
    const missingInIndex = index ? files.filter(f => {
      const data = readJSON(path.join(buildsPath, f));
      return data && !index.some(item => item.id === data.id);
    }).length : files.length;
    
    results.builds = { files: files.length, missingInIndex };
    totalIssues += missingInIndex;
    console.log(`📁 builds/     : ${files.length} files, ${files.length - missingInIndex} in index, ${missingInIndex} missing in index`);
  }
  
  // Check lores
  const loresPath = FOLDERS.lores;
  if (fs.existsSync(loresPath)) {
    const files = fs.readdirSync(loresPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(loresPath, 'index.json'));
    const missingInIndex = index ? files.filter(f => {
      const data = readJSON(path.join(loresPath, f));
      return data && !index.some(item => item.id === data.id);
    }).length : files.length;
    
    results.lores = { files: files.length, missingInIndex };
    totalIssues += missingInIndex;
    console.log(`📁 lores/      : ${files.length} files, ${files.length - missingInIndex} in index, ${missingInIndex} missing in index`);
  }
  
  // Check echoes
  const echoesPath = FOLDERS.echoes;
  if (fs.existsSync(echoesPath)) {
    const files = fs.readdirSync(echoesPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(echoesPath, 'index.json'));
    const data = readJSON(path.join(echoesPath, 'echoes.json'));
    
    let hasId = 0;
    let noId = 0;
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        if (item.id) hasId++;
        else noId++;
      });
    }
    
    results.echoes = { files: files.length, hasId, noId };
    totalIssues += noId;
    console.log(`📁 echoes/     : ${files.length} files, ${hasId} have ID, ${noId} missing ID`);
  }
  
  // Check weapons
  const weaponsPath = FOLDERS.weapons;
  if (fs.existsSync(weaponsPath)) {
    const files = fs.readdirSync(weaponsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(weaponsPath, 'index.json'));
    
    let hasId = 0;
    let noId = 0;
    if (index && Array.isArray(index)) {
      index.forEach(item => {
        if (item.id && typeof item.id === 'number') hasId++;
        else noId++;
      });
    }
    
    results.weapons = { files: files.length, hasId, noId };
    totalIssues += noId;
    console.log(`📁 weapons/    : ${files.length} files, ${hasId} have ID, ${noId} missing ID`);
  }
  
  // Check sonatas
  const sonatasPath = FOLDERS.sonatas;
  if (fs.existsSync(sonatasPath)) {
    const files = fs.readdirSync(sonatasPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = readJSON(path.join(sonatasPath, 'index.json'));
    
    let hasId = 0;
    let noId = 0;
    if (index && Array.isArray(index)) {
      index.forEach(item => {
        if (item.id) hasId++;
        else noId++;
      });
    }
    
    results.sonatas = { files: files.length, hasId, noId };
    totalIssues += noId;
    console.log(`📁 sonatas/   : ${files.length} files, ${hasId} have ID, ${noId} missing ID`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`⚠️ Total issues found: ${totalIssues}`);
  
  return { results, totalIssues };
}

// ==================== 2. UPDATE RESONATORS ====================
async function updateResonators() {
  console.log('\n🔄 UPDATING RESONATORS\n' + '='.repeat(50));
  
  const response = await fetch('https://api-v2.encore.moe/api/en/character');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  
  const roleMap = {};
  data.roleList.forEach(role => {
    roleMap[role.Name] = role;
  });
  
  const resonatorsPath = FOLDERS.resonators;
  const files = fs.readdirSync(resonatorsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  let updated = 0;
  let skipped = 0;
  
  for (const file of files) {
    const filePath = path.join(resonatorsPath, file);
    const char = readJSON(filePath);
    if (!char) continue;
    
    // Try to find by name, or by mapping
    let encore = roleMap[char.name];
    
    // Handle Rover variants
    if (!encore) {
      const roverMap = {
        'Aero Rover': 'Rover: Aero',
        'Electro Rover': 'Rover: Electro',
        'Havoc Rover': 'Rover: Havoc',
        'Spectro Rover': 'Rover: Spectro',
        'Yangyang-xuanling': 'Yangyang: Xuanling'
      };
      const mappedName = roverMap[char.name];
      if (mappedName) encore = roleMap[mappedName];
    }
    
    if (encore) {
      const updatedChar = {
        id: encore.Id,
        name: encore.Name,
        element: encore.Element.Id,
        rarity: encore.QualityId,
        weapon: encore.WeaponType.Id,
        version: char.version || '1.0',
        lastUpdated: char.lastUpdated || new Date().toISOString().split('T')[0],
        roles: char.roles || [],
        sonatas: char.sonatas || [],
        changelog: char.changelog || [],
        faction: char.faction || '',
        affiliation: char.affiliation || '',
        class: char.class || '',
        image: char.image || '',
        icon: char.icon || '',
        imageBanner: char.imageBanner || '',
        skills: char.skills || {},
        materials: char.materials || {},
        sequences: char.sequences || []
      };
      
      // Add favorRole if exists
      if (char.favorRole) {
        updatedChar.favorRole = char.favorRole;
      }
      
      writeJSON(filePath, updatedChar);
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`✅ Updated: ${updated}, Skipped: ${skipped}`);
  return { updated, skipped };
}

// ==================== 3. SPLIT CHARACTERS ====================
function splitCharacters() {
  console.log('\n🔄 SPLITTING CHARACTERS\n' + '='.repeat(50));
  
  const resonatorsPath = FOLDERS.resonators;
  const buildsPath = FOLDERS.builds;
  const loresPath = FOLDERS.lores;
  
  ensureFolder(buildsPath);
  ensureFolder(loresPath);
  
  const files = fs.readdirSync(resonatorsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  let split = 0;
  
  for (const file of files) {
    const filePath = path.join(resonatorsPath, file);
    const char = readJSON(filePath);
    if (!char || !char.id) continue;
    
    const name = char.name.toLowerCase();
    
    // Build file
    const buildData = {
      id: char.id,
      name: char.name,
      recommendedStats: char.recommendedStats || {},
      build: char.build || {},
      analysisCharts: char.analysisCharts || []
    };
    writeJSON(path.join(buildsPath, `${name}.json`), buildData);
    
    // Lore file
    const loreData = {
      id: char.id,
      name: char.name,
      lore: {
        description: char.lore?.description || '',
        manualEntries: char.lore?.manualEntries || [],
        report: char.lore?.report || {},
        items: char.lore?.items || [],
        specialFood: char.lore?.specialFood || {}
      }
    };
    if (char.lore?.stories) {
      loreData.lore.stories = char.lore.stories;
    }
    writeJSON(path.join(loresPath, `${name}.json`), loreData);
    
    // Remove build and lore from main file
    const mainChar = { ...char };
    delete mainChar.recommendedStats;
    delete mainChar.build;
    delete mainChar.analysisCharts;
    delete mainChar.lore;
    writeJSON(filePath, mainChar);
    
    split++;
  }
  
  console.log(`✅ Split ${split} characters`);
  return split;
}

// ==================== 4. GENERATE INDEXES ====================
function generateIndexes() {
  console.log('\n🔄 GENERATING INDEXES\n' + '='.repeat(50));
  
  // Builds index
  const buildsPath = FOLDERS.builds;
  if (fs.existsSync(buildsPath)) {
    const files = fs.readdirSync(buildsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = [];
    files.forEach(file => {
      const data = readJSON(path.join(buildsPath, file));
      if (data && data.id) {
        index.push({
          id: data.id,
          name: data.name,
          image: `/characters/${data.name.toLowerCase()}.webp`,
          bestWeapon: data.build?.bestWeapon || '',
          bestEcho: data.build?.bestEcho || [],
          teams: data.build?.teams?.map(t => t.name) || []
        });
      }
    });
    index.sort((a, b) => a.id - b.id);
    writeJSON(path.join(buildsPath, 'index.json'), index);
    console.log(`✅ Builds index: ${index.length} entries`);
  }
  
  // Lores index
  const loresPath = FOLDERS.lores;
  if (fs.existsSync(loresPath)) {
    const files = fs.readdirSync(loresPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = [];
    files.forEach(file => {
      const data = readJSON(path.join(loresPath, file));
      if (data && data.id) {
        const resonatorsPath = FOLDERS.resonators;
        let faction = '';
        let affiliation = '';
        if (fs.existsSync(path.join(resonatorsPath, `${data.name.toLowerCase()}.json`))) {
          const charData = readJSON(path.join(resonatorsPath, `${data.name.toLowerCase()}.json`));
          if (charData) {
            faction = charData.faction || '';
            affiliation = charData.affiliation || '';
          }
        }
        index.push({
          id: data.id,
          name: data.name,
          description: data.lore?.description || '',
          faction: faction,
          affiliation: affiliation,
          hasStories: !!(data.lore?.stories && data.lore.stories.length > 0)
        });
      }
    });
    index.sort((a, b) => a.id - b.id);
    writeJSON(path.join(loresPath, 'index.json'), index);
    console.log(`✅ Lores index: ${index.length} entries`);
  }
  
  // Resonators index
  const resonatorsPath = FOLDERS.resonators;
  if (fs.existsSync(resonatorsPath)) {
    const files = fs.readdirSync(resonatorsPath).filter(f => f.endsWith('.json') && f !== 'index.json');
    const index = [];
    files.forEach(file => {
      const data = readJSON(path.join(resonatorsPath, file));
      if (data && data.id) {
        index.push({
          id: data.id,
          name: data.name,
          element: data.element,
          rarity: data.rarity,
          weapon: data.weapon,
          version: data.version || '1.0',
          lastUpdated: data.lastUpdated || '',
          roles: data.roles || [],
          sonatas: data.sonatas || [],
          image: data.image || '',
          icon: data.icon || '',
          faction: data.faction || '',
          affiliation: data.affiliation || '',
          class: data.class || ''
        });
      }
    });
    index.sort((a, b) => a.id - b.id);
    writeJSON(path.join(resonatorsPath, 'index.json'), index);
    console.log(`✅ Resonators index: ${index.length} entries`);
  }
}

// ==================== 5. UPDATE WEAPONS ====================
async function updateWeapons() {
  console.log('\n🔄 UPDATING WEAPONS\n' + '='.repeat(50));
  
  const response = await fetch('https://api-v2.encore.moe/api/en/weapon');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  
  const weaponMap = {};
  data.weapons.forEach(w => {
    weaponMap[w.Name] = w;
  });
  
  // Manual mapping untuk weapon yang namanya berbeda
  const nameMap = {
    'firstlights-herald': 'Firstlight\'s Herald',
    'Gauntlet#21D': 'Gauntlets#21D'
  };
  
  const weaponsPath = FOLDERS.weapons;
  const typeFiles = ['sword.json', 'broadblade.json', 'pistol.json', 'gauntlet.json', 'rectifier.json'];
  let updated = 0;
  
  for (const file of typeFiles) {
    const filePath = path.join(weaponsPath, file);
    if (!fs.existsSync(filePath)) continue;
    
    const data = readJSON(filePath);
    if (!data || !Array.isArray(data)) continue;
    
    const updatedData = data.map(item => {
      const encoreName = nameMap[item.name] || item.name;
      const encore = weaponMap[encoreName];
      if (encore) {
        updated++;
        return {
          id: encore.Id,
          slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
          version: item.version || '1.0',
          lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0],
          name: encore.Name,
          weaponType: encore.Type,
          image: item.image,
          rarity: encore.QualityId,
          subStat: item.subStat || '',
          stats: item.stats || {}
        };
      }
      return item;
    });
    
    writeJSON(filePath, updatedData);
  }
  
  // Update index.json
  const indexPath = path.join(weaponsPath, 'index.json');
  const indexData = readJSON(indexPath);
  if (indexData && Array.isArray(indexData)) {
    const updatedIndex = indexData.map(item => {
      const encoreName = nameMap[item.name] || item.name;
      const encore = weaponMap[encoreName];
      if (encore) {
        return {
          id: encore.Id,
          slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
          name: encore.Name,
          weaponType: encore.Type,
          rarity: encore.QualityId,
          version: item.version || '1.0',
          image: item.image,
          subStat: item.subStat || '',
          stats: item.stats || []
        };
      }
      return item;
    });
    writeJSON(indexPath, updatedIndex);
  }
  
  console.log(`✅ Updated ${updated} weapons`);
  return updated;
}

// ==================== 6. UPDATE ECHOES ====================
async function updateEchoes() {
  console.log('\n🔄 UPDATING ECHOES\n' + '='.repeat(50));
  
  const response = await fetch('https://api-v2.encore.moe/api/en/echo');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  
  const echoMap = {};
  data.Echo.forEach(echo => {
    echoMap[echo.Name] = {
      id: echo.Id,
      sonataIds: echo.FetterGroups.map(g => g.Id),
      rarity: echo.Rarity,
      elementId: echo.Element.Id
    };
  });
  
  // Manual mapping
  const nameMap = {
    'Fleurdelys': 'Reminiscence: Fleurdelys',
    'lorelei': 'Lorelei',
    'Thousand-puppet pavilion': 'Thousand-Puppet Pavilion',
    'Threnodian - Voidborne Construct': 'Reminiscence: Threnodian - Voidborne Construct',
    'Threnodian Leviathan': 'Reminiscence: Threnodian - Leviathan',
    'Nightmare: Beringal': 'Nightmare: Feilian Beringal',
    'Nightmare: Heron': 'Nightmare: Impermanence Heron',
    'Nightmare: Myriad': 'Nightmare: Lampylumen Myriad',
    'Nightmare: Rider': 'Nightmare: Inferno Rider',
    'Reminiscence: Adam Smasher': 'Reminiscence - Nightmare: Adam Smasher'
  };
  
  const echoesPath = FOLDERS.echoes;
  const echoesFile = path.join(echoesPath, 'echoes.json');
  const dataFile = readJSON(echoesFile);
  
  if (dataFile && Array.isArray(dataFile)) {
    let updated = 0;
    const updatedData = dataFile.map(item => {
      const encoreName = nameMap[item.name] || item.name;
      const encore = echoMap[encoreName];
      if (encore) {
        updated++;
        return {
          id: encore.id,
          name: item.name,
          slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
          image: item.image,
          description: item.description,
          sonatas: encore.sonataIds,
          cost: item.cost || 4,
          rarity: encore.rarity,
          elementId: encore.elementId,
          version: item.version || '1.0'
        };
      }
      return item;
    });
    writeJSON(echoesFile, updatedData);
    console.log(`✅ Updated ${updated} echoes`);
    
    // Update index.json
    const indexPath = path.join(echoesPath, 'index.json');
    const indexData = readJSON(indexPath);
    if (indexData && Array.isArray(indexData)) {
      const updatedIndex = indexData.map(item => {
        const encoreName = nameMap[item.name] || item.name;
        const encore = echoMap[encoreName];
        if (encore) {
          return {
            id: encore.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
            cost: item.cost || 4,
            sonatas: encore.sonataIds,
            image: item.image,
            version: item.version || '1.0'
          };
        }
        return item;
      });
      writeJSON(indexPath, updatedIndex);
    }
  }
}

// ==================== 7. UPDATE SONATAS ====================
async function updateSonatas() {
  console.log('\n🔄 UPDATING SONATAS\n' + '='.repeat(50));
  
  const response = await fetch('https://api-v2.encore.moe/api/en/echo');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  
  const sonataMap = {};
  data.Echo.forEach(echo => {
    echo.FetterGroups.forEach(group => {
      if (!sonataMap[group.Name]) {
        sonataMap[group.Name] = group.Id;
      }
    });
  });
  
  const sonatasPath = FOLDERS.sonatas;
  const indexFile = path.join(sonatasPath, 'index.json');
  const indexData = readJSON(indexFile);
  
  if (indexData && Array.isArray(indexData)) {
    let updated = 0;
    const updatedData = indexData.map(item => {
      const id = sonataMap[item.name];
      if (id) {
        updated++;
        return {
          id: id,
          name: item.name,
          slug: item.slug || item.name.toLowerCase().replace(/ /g, '-'),
          image: item.image,
          version: item.version || '1.0',
          color: item.color || '#000000'
        };
      }
      return item;
    });
    writeJSON(indexFile, updatedData);
    console.log(`✅ Updated ${updated} sonatas`);
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('\n🔄 SYNC ALL DATA\n' + '='.repeat(60));
  
  // 1. Check status
  const { totalIssues } = checkStatus();
  
  if (totalIssues === 0) {
    console.log('\n✅ All data is up to date! No issues found.');
    return;
  }
  
  console.log(`\n📝 Found ${totalIssues} issues. Starting sync...`);
  
  try {
    // 2. Update resonators from Encore
    await updateResonators();
    
    // 3. Split characters
    splitCharacters();
    
    // 4. Generate indexes
    generateIndexes();
    
    // 5. Update weapons
    await updateWeapons();
    
    // 6. Update echoes
    await updateEchoes();
    
    // 7. Update sonatas
    await updateSonatas();
    
    // 8. Final check
    console.log('\n📊 FINAL CHECK');
    checkStatus();
    
    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
  }
}

// Jalankan
main();