// Usage: npm run ssync (Kin)

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SONATAS_DIR = path.join(ROOT_DIR, 'sonatas');
const SOURCE_PATH = path.join(SONATAS_DIR, 'sonatas.json');
const INDEX_PATH = path.join(SONATAS_DIR, 'index.json');

function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error('File sonatas/sonatas.json tidak ditemukan!');
    process.exit(1);
  }

  console.log('Membaca sonatas/sonatas.json...');
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));

  if (!Array.isArray(sourceData)) {
    console.error('Format sonatas.json bukan array!');
    process.exit(1);
  }

  console.log(`Memproses ${sourceData.length} sonata...`);
  
  const indexData = sourceData.map(sonata => {
    let slug = sonata.slug;
    if (!slug && sonata.name) {
      slug = sonata.name.toLowerCase().replace(/\s+/g, '-');
    }

    return {
      name: sonata.name,
      slug: slug,
      image: sonata.image,
      version: sonata.version || "3.0", 
      color: sonata.color || "#0E8C7A",
    };
  });

  console.log('Menyimpan sonatas/index.json (Pure Array)...');
  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');

  console.log(`Selesai! ${indexData.length} sonata di-index.`);
}

main();