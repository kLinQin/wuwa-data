import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ECHOES_DIR = join(process.cwd(), 'echoes');
const INDEX_PATH = join(ECHOES_DIR, 'index.json');
const FULL_PATH = join(ECHOES_DIR, 'echoes.json');

// Field yang disinkronkan ke index (struktur ringkas)
const INDEX_FIELDS = ['id', 'name', 'slug', 'cost', 'sonatas', 'image', 'version'];

// 1. Baca kedua file
const fullData = JSON.parse(readFileSync(FULL_PATH, 'utf-8'));
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

const report = { added: [], updated: [], unchanged: 0 };

// 2. Iterasi echoes.json sebagai source of truth
for (const entry of fullData) {
	const existing = indexMap.get(entry.id);

	if (!existing) {
		// Entry baru → tambahkan
		const newItem = {};
		for (const field of INDEX_FIELDS) {
			newItem[field] = entry[field];
		}
		indexData.push(newItem);
		indexMap.set(entry.id, newItem);
		report.added.push({ id: entry.id, name: entry.name });
	} else {
		// Cek apakah ada perubahan
		let changed = false;
		for (const field of INDEX_FIELDS) {
			const oldVal = JSON.stringify(existing[field]);
			const newVal = JSON.stringify(entry[field]);
			if (oldVal !== newVal) {
				existing[field] = entry[field];
				changed = true;
			}
		}
		if (changed) {
			report.updated.push({ id: entry.id, name: entry.name });
		} else {
			report.unchanged++;
		}
	}
}

// 3. Print laporan
console.log('\n=== ECHO SYNC REPORT ===');
console.log(`Source entries  : ${fullData.length}`);
console.log(`Index entries   : ${indexData.length}`);
console.log(`Added           : ${report.added.length}`);
console.log(`Updated         : ${report.updated.length}`);
console.log(`Unchanged       : ${report.unchanged}`);

if (report.added.length > 0) {
	console.log('\n--- ADDED ---');
	report.added.forEach((a) => console.log(`  + [${a.id}] ${a.name}`));
}

if (report.updated.length > 0) {
	console.log('\n--- UPDATED ---');
	report.updated.forEach((u) => console.log(`  ~ [${u.id}] ${u.name}`));
}

if (report.added.length === 0 && report.updated.length === 0) {
	console.log('\nNo changes detected.');
	process.exit(0);
}

// 4. Konfirmasi sebelum write
import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nWrite changes to echoes/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ echoes/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});