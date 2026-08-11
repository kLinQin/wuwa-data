const fs = require('fs');
const path = require('path');

const TEAMS_PATH = path.join(__dirname, '../teams/index.json');
const RESONATORS_PATH = path.join(__dirname, '../resonators');

// Load teams
const teams = JSON.parse(fs.readFileSync(TEAMS_PATH, 'utf8'));

// Load resonators index to get character IDs
const resonators = JSON.parse(fs.readFileSync(path.join(RESONATORS_PATH, 'index.json'), 'utf8'));
const charMap = {};
resonators.forEach(function(c) {
  charMap[c.name] = c.id;
  charMap[c.name.toLowerCase()] = c.id;
});

// Update teams with characterId
teams.forEach(function(team) {
  // Ambil karakter pertama dari members
  if (team.members && team.members.length > 0) {
    const firstSlot = team.members[0];
    const firstChar = Array.isArray(firstSlot) ? firstSlot[0] : firstSlot;
    const charId = charMap[firstChar];
    if (charId) {
      team.characterId = charId;
    } else {
      console.log('❌ Character not found for:', firstChar);
    }
  }
});

fs.writeFileSync(TEAMS_PATH, JSON.stringify(teams, null, 2));
console.log('✅ Updated teams with characterId');
