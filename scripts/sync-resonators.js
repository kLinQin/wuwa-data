// Usage: npm run rsync (Kin)

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const RESONATORS_DIR = path.join(ROOT_DIR, 'resonators');

const INDEX_PATH = path.join(RESONATORS_DIR, 'index.json');

const SYNC_FIELDS = [
  'version',
  'lastUpdated',
  'roles',
  'sonatas',
  'image',
  'icon'
];

function main() {
  if (!fs.existsSync(RESONATORS_DIR)) {
    console.error('❌ Folder resonators/ tidak ditemukan!');
    process.exit(1);
  }

  if (!fs.existsSync(INDEX_PATH)) {
    console.error('❌ File resonators/index.json tidak ditemukan!');
    console.log('💡 Tips: Jalankan script init atau buat file index.json manual terlebih dahulu.');
    process.exit(1);
  }
  
  console.log('📖 Membaca resonators/index.json...');
  const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  
  if (!indexData.characters) {
    indexData.characters = [];
  }

  const existingIds = new Set(indexData.characters.map(c => c.id));
  const charMap = new Map(indexData.characters.map(c => [c.id, c]));
  
  const files = fs.readdirSync(RESONATORS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  let addedCount = 0;
  let updatedCount = 0;
  
  console.log('🔧 Memproses sinkronisasi...\n');
  
  files.forEach(fileName => {
    const id = fileName.replace('.json', '');
    const filePath = path.join(RESONATORS_DIR, fileName);
    
    try {
      const charData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      if (existingIds.has(id)) {
        const charObj = charMap.get(id);
        let hasChanges = false;
        
        SYNC_FIELDS.forEach(field => {
          if (charData[field] !== undefined) {
            const currentVal = JSON.stringify(charObj[field]);
            const newVal = JSON.stringify(charData[field]);
            
            if (currentVal !== newVal) {
              charObj[field] = charData[field];
              hasChanges = true;
            }
          }
        });
        
        if (hasChanges) {
          updatedCount++;
          console.log(`   ✓ Update: ${charData.name} (${id})`);
        }
      } else {
        const newChar = {
          id: id,
          name: charData.name || id,
          element: charData.element || "Unknown",
          rarity: charData.rarity || 4,
          weapon: charData.weapon || "Unknown"
        };
        
        SYNC_FIELDS.forEach(field => {
          if (charData[field] !== undefined) {
            newChar[field] = charData[field];
          }
        });
        
        indexData.characters.push(newChar);
        addedCount++;
        console.log(`   ➕ Baru: ${newChar.name} (${id})`);
      }
      
    } catch (err) {
      console.error(`   ❌ Error pada ${fileName}: ${err.message}`);
    }
  });
  
  indexData.characters.sort((a, b) => {
    if (b.rarity !== a.rarity) return b.rarity - a.rarity;
    return a.name.localeCompare(b.name);
  });
  
  if (addedCount > 0 || updatedCount > 0) {
    console.log('\n💾 Menyimpan resonators/index.json...');
    fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');
    console.log(`\n✅ Selesai!`);
    console.log(`   • Karakter Baru: ${addedCount}`);
    console.log(`   • Diperbarui: ${updatedCount}`);
  } else {
    console.log('\n⏭️  Index sudah up-to-date.');
  }
}

main();