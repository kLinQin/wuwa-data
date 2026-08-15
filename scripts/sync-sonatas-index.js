import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SONATAS_DIR = join(process.cwd(), 'sonatas');
const INDEX_PATH = join(SONATAS_DIR, 'index.json');
const FULL_PATH = join(SONATAS_DIR, 'sonatas.json');

// Field ringkas yang disinkronkan ke index
const INDEX_FIELDS = ['id', 'name', 'slug', 'image', 'version', 'color'];

// 1. Baca kedua file
const fullData = JSON.parse(readFileSync(FULL_PATH, 'utf-8'));
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

const report = { added: [], updated: [], unchanged: 0 };

// 2. Iterasi sonatas.json sebagai source of truth
for (const entry of fullData) {
	const existing = indexMap.get(entry.id);

	if (!existing) {
		// Entry baru → tambahkan ke index dengan field ringkas
		const newItem = {};
		for (const field of INDEX_FIELDS) {
			newItem[field] = entry[field] ?? null;
		}
		indexData.push(newItem);
		indexMap.set(entry.id, newItem);
		report.added.push({ id: entry.id, name: entry.name });
	} else {
		// Cek perubahan pada field ringkas
		let changed = false;
		for (const field of INDEX_FIELDS) {
			if (field === 'id') continue;
			if (JSON.stringify(existing[field]) !== JSON.stringify(entry[field])) {
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
console.log('\n=== SONATAS SYNC REPORT ===');
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

rl.question('\nWrite changes to sonatas/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ sonatas/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});