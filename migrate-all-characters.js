// migrate-all-characters.js
// Script untuk mengonversi semua file karakter dari format lama ke format baru
// Usage: node migrate-all-characters.js [--dry-run]

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

function convertDescriptionToEffects(description) {
  if (!description || typeof description !== 'string') return [];
  
  // Split berdasarkan single newline
  const lines = description.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length === 0) return [];
  
  // Jika hanya 1 baris, return sebagai single effect tanpa title
  if (lines.length === 1) {
    return [{
      title: '',
      description: lines[0],
      isTitleVisible: false
    }];
  }
  
  const effects = [];
  let i = 0;
  
  while (i < lines.length) {
    const currentLine = lines[i];
    
    // Cek apakah ini kemungkinan title:
    // 1. Panjang < 50 karakter
    // 2. Tidak diakhiri tanda baca (.,;:!?)
    // 3. Baris berikutnya ada dan lebih panjang (deskripsi)
    const isLikelyTitle = currentLine.length < 50 && 
                         !currentLine.match(/[.,;:!?]$/) &&
                         (i + 1 < lines.length) &&
                         lines[i + 1].length > currentLine.length;
    
    if (isLikelyTitle) {
      // Ini adalah title, ambil baris berikutnya sebagai description
      // Gabungkan semua baris deskripsi sampai ketemu title berikutnya atau habis
      let descParts = [];
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j];
        // Cek apakah baris berikutnya adalah title baru
        const isNextTitle = nextLine.length < 50 && 
                           !nextLine.match(/[.,;:!?]$/) &&
                           (j + 1 < lines.length) &&
                           lines[j + 1].length > nextLine.length;
        
        if (isNextTitle) break;
        
        descParts.push(nextLine);
        j++;
      }
      
      effects.push({
        title: currentLine,
        description: descParts.join('\n'),
        isTitleVisible: true
      });
      
      i = j; // Lanjut dari posisi terakhir
    } else {
      // Ini adalah deskripsi standalone (tanpa title)
      effects.push({
        title: '',
        description: currentLine,
        isTitleVisible: false
      });
      i++;
    }
  }
  
  return effects;
}

function migrateCharacterFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    let hasChanges = false;
    const changes = [];
    
    // Cek apakah sudah format baru
    const isAlreadyNewFormat = data.skills?.basic?.effects !== undefined;
    
    if (isAlreadyNewFormat) {
      return { status: 'skip', name: path.basename(filePath) };
    }
    
    // Konversi skills
    if (data.skills) {
      const skillTypes = ['basic', 'skill', 'liberation', 'forte', 'intro', 'outro'];
      
      for (const skillType of skillTypes) {
        const skill = data.skills[skillType];
        if (skill && skill.description && !skill.effects) {
          skill.effects = convertDescriptionToEffects(skill.description);
          delete skill.description;
          hasChanges = true;
          changes.push(`skills.${skillType}`);
        }
      }
      
      // Handle inherent skills (array)
      if (Array.isArray(data.skills.inherent)) {
        data.skills.inherent.forEach((inherent, idx) => {
          if (inherent.description && !inherent.effects) {
            inherent.effects = convertDescriptionToEffects(inherent.description);
            delete inherent.description;
            hasChanges = true;
            changes.push(`skills.inherent[${idx}]`);
          }
        });
      }
    }
    
    // Konversi sequences
    if (Array.isArray(data.sequences)) {
      data.sequences.forEach((seq, idx) => {
        if (seq.description && !seq.effects) {
          seq.effects = convertDescriptionToEffects(seq.description);
          delete seq.description;
          hasChanges = true;
          changes.push(`sequences[${idx}]`);
        }
      });
    }
    
    // Tambahkan time field ke changelog jika belum ada (format: YYYY-MM-DD)
    if (data.changelog && Array.isArray(data.changelog)) {
      const today = new Date().toISOString().split('T')[0];
      data.changelog.forEach((entry, idx) => {
        if (!entry.time) {
          entry.time = today;
          hasChanges = true;
          changes.push(`changelog[${idx}].time`);
        }
      });
    }
    
    if (hasChanges) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      }
      return { 
        status: 'ok', 
        name: path.basename(filePath),
        changes 
      };
    } else {
      return { status: 'no-change', name: path.basename(filePath) };
    }
    
  } catch (error) {
    return { 
      status: 'error', 
      name: path.basename(filePath),
      error: error.message 
    };
  }
}

function main() {
  const resonatorsDir = path.join(__dirname, 'resonators');
  
  if (!fs.existsSync(resonatorsDir)) {
    console.error('❌ Folder resonators/ tidak ditemukan!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(resonatorsDir).filter(f => f.endsWith('.json'));
  
  if (DRY_RUN) {
    console.log('\n🔍 MODE DRY-RUN (tidak ada file yang diubah)\n');
  } else {
    console.log('\n🚀 Memulai migrasi semua karakter...\n');
  }
  
  const results = {
    ok: [],
    skip: [],
    noChange: [],
    error: []
  };
  
  for (const file of files) {
    const filePath = path.join(resonatorsDir, file);
    const result = migrateCharacterFile(filePath);
    
    switch (result.status) {
      case 'ok':
        results.ok.push(result);
        break;
      case 'skip':
        results.skip.push(result);
        break;
      case 'no-change':
        results.noChange.push(result);
        break;
      case 'error':
        results.error.push(result);
        break;
    }
  }
  
  // Print summary
  console.log('=== HASIL MIGRASI ===\n');
  
  if (results.ok.length > 0) {
    console.log(`✅ Berhasil (${results.ok.length}):`);
    results.ok.forEach(r => {
      console.log(`   • ${r.name}`);
      if (DRY_RUN) {
        r.changes.forEach(c => console.log(`     - ${c}`));
      }
    });
    console.log('');
  }
  
  if (results.skip.length > 0) {
    console.log(`⏭️  Dilewati - Sudah Format Baru (${results.skip.length}):`);
    results.skip.forEach(r => console.log(`   • ${r.name}`));
    console.log('');
  }
  
  if (results.noChange.length > 0) {
    console.log(`➖ Tidak Ada Perubahan (${results.noChange.length}):`);
    results.noChange.forEach(r => console.log(`   • ${r.name}`));
    console.log('');
  }
  
  if (results.error.length > 0) {
    console.log(`❌ Error (${results.error.length}):`);
    results.error.forEach(r => console.log(`   • ${r.name}: ${r.error}`));
    console.log('');
  }
  
  console.log(`Total: ${files.length} file | OK: ${results.ok.length} | Skip: ${results.skip.length} | No Change: ${results.noChange.length} | Error: ${results.error.length}`);
  
  if (DRY_RUN && results.ok.length > 0) {
    console.log('\n💡 Jalankan tanpa --dry-run untuk menerapkan perubahan');
  }
}

main();