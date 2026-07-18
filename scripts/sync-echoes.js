// Usage: npm run esync (Kin)

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ECHOES_DIR = path.join(ROOT_DIR, 'echoes');
const INDEX_PATH = path.join(ECHOES_DIR, 'index.json');

const INDEX_FIELDS = ['name', 'slug', 'cost', 'sonatas', 'image', 'version'];

function extractEchoData(data, sourceName = 'unknown') {
  const results = [];
  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      if (item && typeof item === 'object') results.push(processSingleEcho(item, `${sourceName}[${idx}]`));
    });
  } else if (data && typeof data === 'object') {
    results.push(processSingleEcho(data, sourceName));
  }
  return results;
}

function processSingleEcho(data, sourceName) {
  const echoEntry = {};
  INDEX_FIELDS.forEach(field => {
    if (data[field] !== undefined) echoEntry[field] = data[field];
  });

  if (!echoEntry.slug) {
    if (echoEntry.name) echoEntry.slug = echoEntry.name.toLowerCase().replace(/\s+/g, '-');
    else echoEntry.slug = sourceName.replace('.json', '');
  }
  
  if (echoEntry.cost) echoEntry.cost = Number(echoEntry.cost);
  return echoEntry;
}

function main() {
  if (!fs.existsSync(ECHOES_DIR)) {
    console.error('Folder echoes/ tidak ditemukan!');
    process.exit(1);
  }

  const files = fs.readdirSync(ECHOES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  if (files.length === 0) {
    console.log('Tidak ada file echo ditemukan.');
    return;
  }

  console.log(`Memproses ${files.length} file...`);
  let allEchoes = [];

  files.forEach(fileName => {
    const filePath = path.join(ECHOES_DIR, fileName);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const extracted = extractEchoData(data, fileName);
      allEchoes = allEchoes.concat(extracted);
      if (extracted.length > 0) console.log(`✓ ${fileName}: ${extracted.length} echo`);
    } catch (err) {
      console.error(`Error ${fileName}: ${err.message}`);
    }
  });

  const uniqueSlugs = new Set();
  const uniqueEchoes = [];
  allEchoes.forEach(echo => {
    if (echo.slug && !uniqueSlugs.has(echo.slug)) {
      uniqueSlugs.add(echo.slug);
      uniqueEchoes.push(echo);
    }
  });

  uniqueEchoes.sort((a, b) => {
    const costA = a.cost || 0;
    const costB = b.cost || 0;
    if (costB !== costA) return costB - costA;
    return (a.name || '').localeCompare(b.name || '');
  });

  console.log('\nMenyimpan echoes/index.json...');
  fs.writeFileSync(INDEX_PATH, JSON.stringify(uniqueEchoes, null, 2) + '\n', 'utf-8');
  
  console.log(`Selesai! ${uniqueEchoes.length} echo.`);
}

main();