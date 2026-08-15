import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const RESONATORS_DIR = join(process.cwd(), 'resonators');
const INDEX_PATH = join(RESONATORS_DIR, 'index.json');

// Field ringkas yang disinkronkan ke index
const INDEX_FIELDS = [
	'id', 'name', 'element', 'rarity', 'weapon', 'version',
	'lastUpdated', 'roles', 'sonatas', 'image', 'icon',
	'faction', 'affiliation', 'class'
];

// 1. Baca index
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

// 2. Scan file individual
const files = readdirSync(RESONATORS_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');

const report = { added: [], updated: [], unchanged: 0, skipped: [] };

for (const file of files) {
	const filePath = join(RESONATORS_DIR, file);
	let data;
	try {
		data = JSON.parse(readFileSync(filePath, 'utf-8'));
	} catch {
		report.skipped.push({ file, reason: 'JSON parse error' });
		continue;
	}

	const id = data?.id;
	if (!id) {
		report.skipped.push({ file, reason: 'No ID found' });
		continue;
	}

	const existing = indexMap.get(id);

	if (!existing) {
		// Entry baru → tambahkan ke index dengan field ringkas
		const newItem = {};
		for (const field of INDEX_FIELDS) {
			newItem[field] = data[field] ?? null;
		}
		indexData.push(newItem);
		indexMap.set(id, newItem);
		report.added.push({ id, name: data.name });
	} else {
		// Cek perubahan pada field ringkas
		let changed = false;
		for (const field of INDEX_FIELDS) {
			if (field === 'id') continue;
			const oldVal = JSON.stringify(existing[field]);
			const newVal = JSON.stringify(data[field]);
			if (oldVal !== newVal) {
				existing[field] = data[field];
				changed = true;
			}
		}
		if (changed) {
			report.updated.push({ id, name: existing.name });
		} else {
			report.unchanged++;
		}
	}
}

// 3. Print laporan
console.log('\n=== RESONATORS SYNC REPORT ===');
console.log(`Files processed : ${files.length}`);
console.log(`Added           : ${report.added.length}`);
console.log(`Updated         : ${report.updated.length}`);
console.log(`Unchanged       : ${report.unchanged}`);
console.log(`Skipped         : ${report.skipped.length}`);

if (report.skipped.length > 0) {
	console.log('\n--- SKIPPED ---');
	report.skipped.forEach((s) => console.log(`  [${s.file}] ${s.reason}`));
}

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

rl.question('\nWrite changes to resonators/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ resonators/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});