import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const BUILDS_DIR = join(process.cwd(), 'builds');
const INDEX_PATH = join(BUILDS_DIR, 'index.json');

// 1. Baca index
const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

// 2. Scan file individual
const files = readdirSync(BUILDS_DIR)
	.filter((f) => f.endsWith('.json') && f !== 'index.json');

const report = { processed: 0, updated: 0, skipped: [], changes: [] };

for (const file of files) {
	const filePath = join(BUILDS_DIR, file);
	let data;
	try {
		data = JSON.parse(readFileSync(filePath, 'utf-8'));
	} catch {
		report.skipped.push({ file, reason: 'JSON parse error' });
		continue;
	}

	report.processed++;
	const id = data?.id;
	if (!id || !indexMap.has(id)) {
		report.skipped.push({ file, reason: `ID ${id} not found in index` });
		continue;
	}

	const entry = indexMap.get(id);
	const changeLog = {};

	// bestWeapon
	const newWeapon = data?.build?.bestWeapon ?? entry.bestWeapon;
	if (newWeapon !== entry.bestWeapon) {
		changeLog.bestWeapon = { old: entry.bestWeapon, new: newWeapon };
		entry.bestWeapon = newWeapon;
	}

	// bestEcho
	const sets = data?.build?.echoDetails?.sets || [];
	const newEchoes = [
		...new Set(
			sets
				.flatMap((s) => [s.echoSlug, s.echoSlugSecondary])
				.filter((v) => typeof v === 'string' && v.trim() !== '')
		)
	];
	const oldEchoesStr = JSON.stringify(entry.bestEcho);
	const newEchoesStr = JSON.stringify(newEchoes);
	if (oldEchoesStr !== newEchoesStr) {
		changeLog.bestEcho = { old: entry.bestEcho, new: newEchoes };
		entry.bestEcho = newEchoes;
	}

	// teams
	const newTeams = data?.build?.teams ?? entry.teams;
	const oldTeamsStr = JSON.stringify(entry.teams);
	const newTeamsStr = JSON.stringify(newTeams);
	if (oldTeamsStr !== newTeamsStr) {
		changeLog.teams = { old: entry.teams, new: newTeams };
		entry.teams = newTeams;
	}

	if (Object.keys(changeLog).length > 0) {
		report.updated++;
		report.changes.push({ name: entry.name, id, file, ...changeLog });
	}
}

// 3. Print laporan
console.log('\n=== SYNC REPORT ===');
console.log(`Files processed : ${report.processed}`);
console.log(`Entries updated : ${report.updated}`);
console.log(`Skipped         : ${report.skipped.length}`);

if (report.skipped.length > 0) {
	console.log('\n--- SKIPPED ---');
	report.skipped.forEach((s) => console.log(`  [${s.file}] ${s.reason}`));
}

if (report.changes.length > 0) {
	console.log('\n--- CHANGES ---');
	report.changes.forEach((c) => {
		console.log(`\n  ▶ ${c.name} (ID: ${c.id}) ← ${c.file}`);
		for (const [field, val] of Object.entries(c)) {
			if (['name', 'id', 'file'].includes(field)) continue;
			console.log(`    ${field}:`);
			console.log(`      OLD: ${JSON.stringify(val.old)}`);
			console.log(`      NEW: ${JSON.stringify(val.new)}`);
		}
	});
} else {
	console.log('\nNo changes detected.');
}

// 4. Konfirmasi sebelum write
if (report.updated === 0) {
	console.log('\nNothing to write. Exiting.');
	process.exit(0);
}

import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('\nWrite changes to builds/index.json? (y/N): ', (answer) => {
	if (answer.toLowerCase() === 'y') {
		writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2) + '\n');
		console.log('✅ builds/index.json updated successfully.');
	} else {
		console.log('❌ Aborted. No changes written.');
	}
	rl.close();
});