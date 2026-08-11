const fs = require('fs');
const path = require('path');

const BUILDS_DIR = path.join(__dirname, '../builds');
const TEAMS_PATH = path.join(__dirname, '../teams/index.json');

console.log('Reading teams...');
const teams = JSON.parse(fs.readFileSync(TEAMS_PATH, 'utf8'));
console.log('Teams loaded:', teams.length);

// Buat mapping: characterId → team IDs
const charTeamsMap = {};
teams.forEach(function(team) {
  const charId = team.characterId;
  if (!charTeamsMap[charId]) {
    charTeamsMap[charId] = [];
  }
  charTeamsMap[charId].push(team.id);
});
console.log('Char mapping:', Object.keys(charTeamsMap).length);

const files = fs.readdirSync(BUILDS_DIR).filter(function(f) {
  return f.endsWith('.json') && f !== 'index.json';
});
console.log('Build files:', files.length);

files.forEach(function(file) {
  const filePath = path.join(BUILDS_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const charId = data.id;
    const teamIds = charTeamsMap[charId];
    if (teamIds && teamIds.length > 0 && data.build) {
      console.log('✅ Updating ' + file + ' with ' + teamIds.length + ' teams');
      data.build.teams = teamIds;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Error processing ' + file + ':', err.message);
  }
});
console.log('Done');
