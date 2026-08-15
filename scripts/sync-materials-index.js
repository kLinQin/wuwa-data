import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MATERIALS_DIR = join(process.cwd(), 'materials');
const INDEX_PATH = join(MATERIALS_DIR, 'index.json');
const FULL_PATH = join(MATERIALS_DIR, 'materials.json');

// 1. Baca kedua file
const fullData = JSON.parse(readFileSync(FULL_PATH, 'utf-8'));
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

const report = { added: [], updated: [], unchanged: 0 };

// 2. Iterasi materials.json sebagai source of truth
for (const entry of fullData) {
	const existing = indexMap.get(entry.id);

	if (!existing) {
		// Entry baru → tambahkan ke index
		indexData.push({ ...entry });
		indexMap.set(entry.id, entry);
		report.added.push({ id: entry.id, name: entry.name });
	} else {
		// Cek perubahan
		let changed = false;
		for (const key of Object.keys(entry)) {
			if (JSON.stringify(existing[key]) !== JSON.stringify(entry[key])) {
				existing[key] = entry[key];
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
console.log('\n=== MATERIALS SYNC REPORT ===');
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

rl.question('\nWrite changes to materials/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ materials/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});