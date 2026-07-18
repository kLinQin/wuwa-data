// Usage: npm run wsync (Kin)

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const WEAPONS_DIR = path.join(ROOT_DIR, 'weapons');
const INDEX_PATH = path.join(WEAPONS_DIR, 'index.json');

const INDEX_FIELDS = [
  'id',
  'slug',
  'name',
  'weaponType',
  'rarity',
  'version',
  'image',
  'subStat' // ✅ Tambahan: subStat (CRIT Rate, ATK%, dll)
];

function main() {
  if (!fs.existsSync(WEAPONS_DIR)) {
    console.error('Folder weapons/ tidak ditemukan!');
    process.exit(1);
  }

  const files = fs.readdirSync(WEAPONS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  if (files.length === 0) {
    console.log('Tidak ada file weapon ditemukan di folder weapons/.');
    return;
  }

  console.log(`Memproses ${files.length} file tipe weapon...`);
  
  let allWeapons = [];

  files.forEach(fileName => {
    const filePath = path.join(WEAPONS_DIR, fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        data.forEach(weapon => {
          if (weapon && typeof weapon === 'object') {
            const weaponEntry = {};
            
            INDEX_FIELDS.forEach(field => {
              if (weapon[field] !== undefined) {
                weaponEntry[field] = weapon[field];
              }
            });

            // ✅ Tambahan: Ekstrak stats level 90
            if (weapon.stats && weapon.stats['90']) {
              weaponEntry.stats = weapon.stats['90']; // [ATK, SubStat Value]
            }

            if (!weaponEntry.id) weaponEntry.id = weapon.slug || weapon.name?.toLowerCase().replace(/\s+/g, '-');
            if (!weaponEntry.slug) weaponEntry.slug = weapon.id || weapon.name?.toLowerCase().replace(/\s+/g, '-');

            allWeapons.push(weaponEntry);
          }
        });
        console.log(`✓ ${fileName}: ${data.length} weapon ditemukan`);
      } else {
        console.warn(`⚠️ ${fileName} bukan format array, dilewati.`);
      }
    } catch (err) {
      console.error(`Error membaca ${fileName}: ${err.message}`);
    }
  });

  const uniqueIds = new Set();
  const uniqueWeapons = [];
  
  allWeapons.forEach(w => {
    if (w.id && !uniqueIds.has(w.id)) {
      uniqueIds.add(w.id);
      uniqueWeapons.push(w);
    }
  });

  uniqueWeapons.sort((a, b) => {
    const rA = a.rarity || 0;
    const rB = b.rarity || 0;
    if (rB !== rA) return rB - rA;
    return (a.name || '').localeCompare(b.name || '');
  });

  console.log('\nMenyimpan weapons/index.json');
  fs.writeFileSync(INDEX_PATH, JSON.stringify(uniqueWeapons, null, 2) + '\n', 'utf-8');
  
  console.log(`Selesai! ${uniqueWeapons.length} weapon berhasil di-index.`);
}

main();