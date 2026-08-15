import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const LORES_DIR = join(process.cwd(), 'lores');
const INDEX_PATH = join(LORES_DIR, 'index.json');

// 1. Baca kedua sumber
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

const files = readdirSync(LORES_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');

const report = { added: [], updated: [], unchanged: 0, skipped: [] };

for (const file of files) {
	const filePath = join(LORES_DIR, file);
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
	const newDescription = data?.lore?.description ?? '';
	const newHasStories = Array.isArray(data?.lore?.stories) && data.lore.stories.length > 0;

	if (!existing) {
		// Tambah entry baru ke index
		const newItem = {
			id,
			name: data.name || '',
			description: newDescription,
			faction: data.faction || '',
			affiliation: data.affiliation || '',
			hasStories: newHasStories
		};
		indexData.push(newItem);
		indexMap.set(id, newItem);
		report.added.push({ id, name: data.name });
	} else {
		// Cek perubahan description dan hasStories saja
		let changed = false;
		if (existing.description !== newDescription) {
			existing.description = newDescription;
			changed = true;
		}
		if (existing.hasStories !== newHasStories) {
			existing.hasStories = newHasStories;
			changed = true;
		}
		if (changed) {
			report.updated.push({ id, name: existing.name });
		} else {
			report.unchanged++;
		}
	}
}

// 2. Print laporan
console.log('\n=== LORES INDEX SYNC REPORT ===');
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

// 3. Konfirmasi sebelum write
import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nWrite changes to lores/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ lores/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});