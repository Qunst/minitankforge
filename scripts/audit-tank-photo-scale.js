const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'scale-audit');
fs.mkdirSync(outDir, { recursive: true });

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/tanks-data.js'), 'utf8'), sandbox);

const tanks = (sandbox.window.TANKS || []).filter(tank => tank.disabled !== true);

// Approximate real vehicle body/hull lengths in millimetres.
// This intentionally avoids gun-forward overall length so crop scale follows vehicle body size.
const bodyLengths = {
  'panzer-iv': 5920,
  'sherman-m4a3': 5840,
  't-34-85': 6100,
  'tiger-i': 6320,
  'su-85': 6100,
  'm18-hellcat': 5280,
  'e-100': 8700,
  'e-25': 5660,
  'e-50': 6870,
  'e-75': 7400,
  ferdinand: 6810,
  hetzer: 4870,
  'is-3': 6900,
  'is-7': 7380,
  'isu-152': 6770,
  jagdpanther: 6870,
  'jagdpanther-ii': 6870,
  'jagdpz-iv': 5900,
  jagdtiger: 7450,
  luchs: 4630,
  'm3-lee': 5640,
  'm5a1-stuart': 4840,
  maus: 10200,
  nashorn: 6200,
  panther: 6870,
  'panzer-iii': 5380,
  'panzer-vii-loewe': 7700,
  'panzer-35t': 4900,
  'panzer-38t': 4610,
  pershing: 6330,
  'sherman-firefly': 5840,
  'stug-iii': 5900,
  'sd-kfz-234': 5860,
  't-28': 7440,
  't-34': 6100,
  'tiger-ii': 7380,
  hummel: 7170,
  'is-1': 6770,
  'is-2': 6770,
  'isu-122': 6770,
  'jagdpanzer-e100': 8700,
  'kv-1': 6750,
  'kv-2': 6790,
  'kv-5': 7800,
  'kv-85': 6750,
  'churchill-iv-fascine': 7440,
  'churchill-iv': 7440,
  cromwell: 6350,
  valentine: 5410,
  'matilda-ii': 5720,
  bishop: 5490,
  centaur: 6350,
  archer: 6540,
  'm24-chaffee': 5030,
  'fcm-f1': 10530,
  'kv-1s': 6750,
  tortoise: 7240,
  't28-t95-transport': 7490,
  't28-t95-combat': 7490,
  t29: 7610,
  t30: 7610,
  't34-heavy-tank': 7610,
  'm10-wolverine': 5970,
  'm10-achilles': 5970,
  'm13-40': 4920,
  'm14-41': 4920,
  'm3-half-track': 6180,
  'opel-blitz': 6100,
  m60a1: 6950,
  'm7-priest': 6020,
  'm8-greyhound': 5000,
  'su-76': 5000,
  'su-100': 6100,
  'su-122': 6100,
  sturmtiger: 6280,
  't-34-minesweeper': 6100,
  'a-32': 5920,
  't-35': 9720,
  'zis-42': 6100,
  't-38': 3780,
  'gaz-aa': 5340,
  't-26': 4650,
  'ba-64': 3660,
  'stz-5': 4150,
  't-26-twin-turret': 4650,
  'ba-6': 4900,
  'b-4-howitzer': 9360,
  't-70': 4290,
  wespe: 4790,
  'type-95-ha-go': 4380,
  'type-97-chi-ha': 5520,
};

const rows = tanks.map(tank => ({
  slug: tank.slug,
  name: tank.name,
  nation: tank.nation,
  type: tank.type,
  status: tank.historicalStatus || '',
  image: tank.image,
  bodyLengthMm: bodyLengths[tank.slug] || null,
  imageExists: fs.existsSync(path.join(root, ...String(tank.image || '').split('/'))),
}));

const missing = rows.filter(row => !row.bodyLengthMm);
if (missing.length) {
  console.warn(`Missing body lengths for: ${missing.map(row => row.slug).join(', ')}`);
}

fs.writeFileSync(
  path.join(outDir, 'tank-photo-scale-audit.json'),
  JSON.stringify(rows, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outDir, 'tank-photo-scale-audit.csv'),
  [
    'slug,name,nation,type,status,bodyLengthMm,image,imageExists',
    ...rows.map(row => [
      row.slug,
      JSON.stringify(row.name),
      row.nation,
      JSON.stringify(row.type),
      JSON.stringify(row.status),
      row.bodyLengthMm || '',
      row.image,
      row.imageExists,
    ].join(',')),
  ].join('\n'),
  'utf8'
);

console.log(`Wrote ${rows.length} audit rows to ${path.relative(root, outDir)}`);
