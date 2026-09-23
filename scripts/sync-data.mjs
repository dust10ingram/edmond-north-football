import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checking = process.argv.includes('--check');

const schemas = {
  players: ['player_id', 'team', 'number', 'name', 'position', 'class_year', 'image', 'height', 'weight', 'x_url', 'hudl_url', 'maxpreps_url', 'recruiting_profile', 'active'],
  staff: ['staff_id', 'name', 'role', 'class_year', 'image', 'active'],
  schedules: ['game_id', 'team', 'season', 'date_label', 'date_iso', 'opponent', 'detail', 'location', 'logo', 'ticket_url', 'result', 'score', 'program_url'],
  badges: ['player_id', 'badge'],
  offers: ['player_id', 'school', 'status'],
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else value += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (value || row.length) {
    row.push(value.replace(/\r$/, ''));
    if (row.some((cell) => cell !== '')) rows.push(row);
  }
  return rows;
}

function load(name) {
  const file = path.join(root, 'data', `${name}.csv`);
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const header = rows.shift() || [];
  if (header.join('|') !== schemas[name].join('|')) {
    throw new Error(`${name}.csv has unexpected columns. Expected: ${schemas[name].join(', ')}`);
  }
  return rows.map((row, rowIndex) => {
    if (row.length !== header.length) throw new Error(`${name}.csv row ${rowIndex + 2} has ${row.length} cells; expected ${header.length}.`);
    return Object.fromEntries(header.map((column, columnIndex) => [column, row[columnIndex].trim()]));
  });
}

const data = Object.fromEntries(Object.keys(schemas).map((name) => [name, load(name)]));
const errors = [];
const unique = (rows, key, file) => {
  const seen = new Set();
  rows.forEach((row, index) => {
    if (!row[key]) errors.push(`${file}.csv row ${index + 2}: ${key} is required.`);
    else if (seen.has(row[key])) errors.push(`${file}.csv row ${index + 2}: duplicate ${key} “${row[key]}”.`);
    seen.add(row[key]);
  });
};
const validUrl = (value) => !value || /^https?:\/\//.test(value);
const validFlag = (value) => ['yes', 'no'].includes(value);

unique(data.players, 'player_id', 'players');
unique(data.staff, 'staff_id', 'staff');
unique(data.schedules, 'game_id', 'schedules');
const playerIds = new Set(data.players.map((player) => player.player_id));

data.players.forEach((player, index) => {
  const row = index + 2;
  if (!['Varsity', 'Freshman'].includes(player.team)) errors.push(`players.csv row ${row}: team must be Varsity or Freshman.`);
  if (!player.name || !player.number) errors.push(`players.csv row ${row}: name and number are required.`);
  if (player.class_year && !/^20\d{2}$/.test(player.class_year)) errors.push(`players.csv row ${row}: class_year must be a four-digit year.`);
  for (const column of ['x_url', 'hudl_url', 'maxpreps_url']) if (!validUrl(player[column])) errors.push(`players.csv row ${row}: ${column} must be a complete http(s) URL.`);
  for (const column of ['recruiting_profile', 'active']) if (!validFlag(player[column])) errors.push(`players.csv row ${row}: ${column} must be yes or no.`);
  if (player.image && !fs.existsSync(path.join(root, 'public', 'assets', 'players', player.image))) errors.push(`players.csv row ${row}: player image “${player.image}” was not found.`);
});

data.staff.forEach((person, index) => {
  const row = index + 2;
  if (!person.name || !person.role) errors.push(`staff.csv row ${row}: name and role are required.`);
  if (!validFlag(person.active)) errors.push(`staff.csv row ${row}: active must be yes or no.`);
  if (person.image && !fs.existsSync(path.join(root, 'public', 'assets', 'players', person.image))) errors.push(`staff.csv row ${row}: staff image “${person.image}” was not found.`);
});

data.schedules.forEach((game, index) => {
  const row = index + 2;
  if (!['Varsity', 'JV', 'Freshman'].includes(game.team)) errors.push(`schedules.csv row ${row}: team must be Varsity, JV, or Freshman.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(game.date_iso)) errors.push(`schedules.csv row ${row}: date_iso must use YYYY-MM-DD.`);
  if (!['Home', 'Away', 'TBD'].includes(game.location)) errors.push(`schedules.csv row ${row}: location must be Home, Away, or TBD.`);
  if (game.result && !['W', 'L', 'T'].includes(game.result)) errors.push(`schedules.csv row ${row}: result must be W, L, T, or blank.`);
  if (game.ticket_url && !validUrl(game.ticket_url)) errors.push(`schedules.csv row ${row}: ticket_url must be a complete URL.`);
  if (game.logo && !fs.existsSync(path.join(root, 'public', 'assets', 'opponents', game.logo))) errors.push(`schedules.csv row ${row}: opponent logo “${game.logo}” was not found.`);
});

for (const [file, rows] of [['badges', data.badges], ['offers', data.offers]]) {
  rows.forEach((record, index) => {
    if (!playerIds.has(record.player_id)) errors.push(`${file}.csv row ${index + 2}: unknown player_id “${record.player_id}”.`);
  });
}
data.offers.forEach((offer, index) => {
  if (!offer.school || !['Offer', 'Committed', 'Interest'].includes(offer.status)) errors.push(`offers.csv row ${index + 2}: school is required and status must be Offer, Committed, or Interest.`);
});
const committed = new Set();
data.offers.filter((offer) => offer.status === 'Committed').forEach((offer) => {
  if (committed.has(offer.player_id)) errors.push(`offers.csv: ${offer.player_id} has more than one committed school.`);
  committed.add(offer.player_id);
});

if (errors.length) throw new Error(`Data validation failed:\n- ${errors.join('\n- ')}`);

const generated = `// Generated by scripts/sync-data.mjs. Edit data/*.csv instead.\n${Object.entries(data).map(([name, rows]) => `export const ${name} = ${JSON.stringify(rows, null, 2)};`).join('\n\n')}\n`;
const output = path.join(root, 'app', 'generated-site-data.ts');

if (checking) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== generated) throw new Error('Generated site data is stale. Run npm run data:sync.');
  console.log(`CSV data is valid and synchronized (${data.players.length} players, ${data.staff.length} staff, ${data.schedules.length} games).`);
} else {
  fs.writeFileSync(output, generated);
  const publicData = path.join(root, 'static', 'data');
  fs.mkdirSync(publicData, {recursive: true});
  for (const name of Object.keys(schemas)) fs.copyFileSync(path.join(root, 'data', `${name}.csv`), path.join(publicData, `${name}.csv`));
  console.log(`Synchronized ${data.players.length} players, ${data.staff.length} staff, ${data.schedules.length} games, ${data.badges.length} badges, and ${data.offers.length} offers.`);
}
