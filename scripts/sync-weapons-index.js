import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const WEAPONS_DIR = join(process.cwd(), 'weapons');
const INDEX_PATH = join(WEAPONS_DIR, 'index.json');
const TYPE_FILES = ['broadblade.json', 'gauntlet.json', 'pistol.json', 'rectifier.json', 'sword.json'];

// 1. Baca index
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

// 2. Gabung semua file per-tipe
const allWeapons = [];
for (const file of TYPE_FILES) {
	const filePath = join(WEAPONS_DIR, file);
	try {
		const data = JSON.parse(readFileSync(filePath, 'utf-8'));
		allWeapons.push(...data);
	} catch (err) {
		console.error(`Failed to parse ${file}:`, err.message);
	}
}

const report = { added: [], updated: [], unchanged: 0 };

// 3. Iterasi semua weapons sebagai source of truth
for (const entry of allWeapons) {
	const existing = indexMap.get(entry.id);

	// Ekstrak stats ringkas: ambil value level max (90) atau fallback
	let statsArray = null;
	if (entry.stats && typeof entry.stats === 'object' && !Array.isArray(entry.stats)) {
		const maxLevel = entry.stats['90'] || entry.stats['80'] || Object.values(entry.stats).pop();
		statsArray = Array.isArray(maxLevel) ? maxLevel : null;
	} else if (Array.isArray(entry.stats)) {
		statsArray = entry.stats;
	}

	if (!existing) {
		const newItem = {
			id: entry.id,
			slug: entry.slug,
			name: entry.name,
			weaponType: entry.weaponType,
			rarity: entry.rarity,
			version: entry.version,
			image: entry.image,
			subStat: entry.subStat,
			stats: statsArray
		};
		indexData.push(newItem);
		indexMap.set(entry.id, newItem);
		report.added.push({ id: entry.id, name: entry.name });
	} else {
		let changed = false;
		const fieldsToCheck = ['slug', 'name', 'weaponType', 'rarity', 'version', 'image', 'subStat'];
		for (const field of fieldsToCheck) {
			if (JSON.stringify(existing[field]) !== JSON.stringify(entry[field])) {
				existing[field] = entry[field];
				changed = true;
			}
		}
		if (JSON.stringify(existing.stats) !== JSON.stringify(statsArray)) {
			existing.stats = statsArray;
			changed = true;
		}
		if (changed) {
			report.updated.push({ id: entry.id, name: entry.name });
		} else {
			report.unchanged++;
		}
	}
}

// 4. Print laporan
console.log('\n=== WEAPONS SYNC REPORT ===');
console.log(`Source entries  : ${allWeapons.length}`);
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

// 5. Konfirmasi sebelum write
import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nWrite changes to weapons/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ weapons/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});