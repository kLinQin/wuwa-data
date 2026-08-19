import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const BUILDS_DIR = join(process.cwd(), 'builds');
const INDEX_PATH = join(BUILDS_DIR, 'index.json');
const RESONATORS_DIR = join(process.cwd(), 'resonators');

const indexData = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
const indexMap = new Map(indexData.map((item) => [item.id, item]));

const files = readdirSync(BUILDS_DIR)
	.filter((f) => f.endsWith('.json') && f !== 'index.json');

const report = { processed: 0, updated: 0, skipped: [], changes: [], added: [] };

// Helper: ambil image dari file resonator
function getImageFromResonator(name) {
	try {
		const resPath = join(RESONATORS_DIR, `${name}.json`);
		const resData = JSON.parse(readFileSync(resPath, 'utf-8'));
		return resData.image || null;
	} catch {
		return null;
	}
}

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
	
	if (!id || id === 0) {
		report.skipped.push({ file, reason: `ID ${id} perlu diisi manual` });
		continue;
	}
	
	if (!indexMap.has(id)) {
		const sets = data?.build?.echoDetails?.sets || [];
		const bestEcho = [
			...new Set(
				sets
					.flatMap((s) => [s.echoSlug, s.echoSlugSecondary])
					.filter((v) => typeof v === 'string' && v.trim() !== '')
			)
		];
		
		// Ambil image dari folder resonators
		const name = data.name || basename(file, '.json');
		const image = getImageFromResonator(name.toLowerCase().replace(/\s/g, '-'));
		
		const newEntry = {
			id: id,
			name: name,
			bestWeapon: data?.build?.bestWeapon || null,
			bestEcho: bestEcho,
			teams: data?.build?.teams || []
		};
		
		if (image) newEntry.image = image;
		
		const optionalFields = ['icon', 'element', 'rarity', 'weapon', 'version', 'lastUpdated', 'roles', 'sonatas', 'faction', 'affiliation', 'class'];
		for (const field of optionalFields) {
			if (data[field] !== undefined && data[field] !== null) {
				newEntry[field] = data[field];
			}
		}
		
		indexData.push(newEntry);
		indexMap.set(id, newEntry);
		report.added.push({ name: newEntry.name, id, file });
		continue;
	}

	const entry = indexMap.get(id);
	const changeLog = {};

	const newWeapon = data?.build?.bestWeapon ?? entry.bestWeapon;
	if (newWeapon !== entry.bestWeapon) {
		changeLog.bestWeapon = { old: entry.bestWeapon, new: newWeapon };
		entry.bestWeapon = newWeapon;
	}

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

console.log('\n=== SYNC REPORT ===');
console.log(`Files processed : ${report.processed}`);
console.log(`Entries updated : ${report.updated}`);
console.log(`Entries added   : ${report.added.length}`);
console.log(`Skipped         : ${report.skipped.length}`);

if (report.skipped.length > 0) {
	console.log('\n--- SKIPPED ---');
	report.skipped.forEach((s) => console.log(`  [${s.file}] ${s.reason}`));
}

if (report.added.length > 0) {
	console.log('\n--- ADDED ---');
	report.added.forEach((a) => console.log(`  [+] ${a.name} (ID: ${a.id}) ← ${a.file}`));
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
} else if (report.added.length === 0) {
	console.log('\nNo changes detected.');
}

if (report.updated === 0 && report.added.length === 0) {
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