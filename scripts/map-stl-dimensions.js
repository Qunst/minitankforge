const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { readStl, round } = require('./extract-stl-dimensions');

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.stl$/i, '')
    .replace(/^1[\s_-]*\d+[\s_-]*/i, '')
    .replace(/\bno crew\b/g, '')
    .replace(/\bv\d+\b/g, '')
    .replace(/\bfat(?:er|ter)?\b/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function displayName(name) {
  return String(name || '').split(' (')[0].trim();
}

function alternateName(name) {
  return String(name || '').match(/\s+\(([^)]+)\)\s*$/)?.[1]?.trim() || '';
}

function loadTanks(root) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(root, 'assets/js/tanks-data.js'), 'utf8'),
    sandbox,
    { filename: 'assets/js/tanks-data.js' }
  );
  return (sandbox.window.TANKS || []).filter(tank => tank.disabled !== true);
}

const fileOverrides = new Map([
  ['b4', 'b-4-howitzer'],
  ['jagdpanther2', 'jagdpanther-ii'],
  ['panzerviiloewe2', 'panzer-vii-loewe'],
  ['sherman', 'sherman-m4a3'],
  ['stz5cov', 'stz-5'],
  ['stug', 'stug-iii'],
  ['t26double', 't-26-twin-turret'],
  ['t28us', 't28-t95-transport'],
  ['t34us', 't34-heavy-tank'],
  ['t95', 't28-t95-combat'],
  ['tiger', 'tiger-i'],
  ['tiger2', 'tiger-ii'],
]);

function sourceScaleFromFile(file) {
  const scale = Number(String(file).match(/^1[\s_-]*(\d+)/i)?.[1]);
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error(`Could not determine source scale from filename: ${file}`);
  }
  return scale;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeMeasurementCsv(file, matched) {
  const scales = [250, 285, 200, 180, 160];
  const axes = ['length', 'width', 'height'];
  const headers = [
    'model',
    'site_slug',
    'source_stl',
    'source_scale',
    ...scales.flatMap(scale => axes.map(axis => `${axis}_1_${scale}_mm`)),
  ];
  const rows = matched
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(row => {
      const values = [row.name, row.slug, row.file, `1:${row.sourceScale}`];
      for (const scale of scales) {
        const factor = 250 / scale;
        for (const axis of axes) {
          values.push((row.dimensions250[axis] * factor).toFixed(1));
        }
      }
      return values.map(csvCell).join(',');
    });

  fs.writeFileSync(file, `${headers.join(',')}\n${rows.join('\n')}\n`, 'utf8');
}

function tankKeys(tank) {
  return new Set([
    normalize(tank.slug),
    normalize(tank.name),
    normalize(displayName(tank.name)),
    normalize(alternateName(tank.name)),
  ].filter(Boolean));
}

function main() {
  const stlDirectory = path.resolve(process.argv[2] || 'stls');
  const writeArgument = process.argv.find(argument => argument.startsWith('--write='));
  const csvArgument = process.argv.find(argument => argument.startsWith('--csv='));
  const root = path.resolve(__dirname, '..');
  const tanks = loadTanks(root);
  const keyedTanks = tanks.map(tank => ({ tank, keys: tankKeys(tank) }));
  const files = fs.readdirSync(stlDirectory)
    .filter(file => file.toLowerCase().endsWith('.stl'))
    .sort((a, b) => a.localeCompare(b));

  const matched = [];
  const extras = [];
  const ambiguous = [];
  const suspicious = [];

  for (const file of files) {
    const key = normalize(file);
    const overrideSlug = fileOverrides.get(key);
    const candidates = overrideSlug
      ? keyedTanks.filter(item => item.tank.slug === overrideSlug)
      : keyedTanks.filter(item => item.keys.has(key));

    if (!candidates.length) {
      extras.push(file);
      continue;
    }
    if (candidates.length > 1) {
      ambiguous.push({ file, candidates: candidates.map(item => item.tank.slug) });
      continue;
    }

    const result = readStl(path.join(stlDirectory, file));
    const sourceScale = sourceScaleFromFile(file);
    const dimensions = {
      length: round(result.dimensions.length),
      width: round(result.dimensions.width),
      height: round(result.dimensions.height),
    };
    const referenceFactor = sourceScale / 250;
    const dimensions250 = Object.fromEntries(
      Object.entries(dimensions).map(([axis, value]) => [axis, round(value * referenceFactor)])
    );
    const row = {
      slug: candidates[0].tank.slug,
      name: displayName(candidates[0].tank.name),
      file,
      sourceScale,
      dimensions,
      dimensions250,
    };
    matched.push(row);

    const { length, width, height } = dimensions250;
    const reasons = [];
    if (length < 10 || length > 60) reasons.push(`length ${length} mm`);
    if (width < 4 || width > 25) reasons.push(`width ${width} mm`);
    if (height < 3 || height > 25) reasons.push(`height ${height} mm`);
    if (length < width || length < height) reasons.push('Z is not the largest physical axis');
    if (reasons.length) suspicious.push({ ...row, reasons });
  }

  const duplicateMatches = [...new Set(matched.map(row => row.slug))]
    .map(slug => ({ slug, files: matched.filter(row => row.slug === slug).map(row => row.file) }))
    .filter(row => row.files.length > 1);
  const matchedSlugs = new Set(matched.map(row => row.slug));
  const missing = tanks
    .filter(tank => !matchedSlugs.has(tank.slug))
    .map(tank => ({ slug: tank.slug, name: displayName(tank.name) }));

  const report = {
    summary: {
      siteTanks: tanks.length,
      stlFiles: files.length,
      matched: matched.length,
      missing: missing.length,
      extras: extras.length,
      ambiguous: ambiguous.length,
      duplicateMatches: duplicateMatches.length,
      suspicious: suspicious.length,
    },
    missing,
    extras,
    ambiguous,
    duplicateMatches,
    suspicious,
    matched,
  };

  if (writeArgument) {
    if (ambiguous.length || duplicateMatches.length || suspicious.length) {
      throw new Error('Refusing to write dimension data while mapping discrepancies remain');
    }

    const outputFile = path.resolve(root, writeArgument.slice('--write='.length));
    const dimensionData = {
      units: 'mm',
      axes: { x: 'width', y: 'height', z: 'length' },
      sourceScales: [...new Set(matched.map(row => row.sourceScale))].sort((a, b) => a - b),
      tanks: Object.fromEntries(
        matched
          .slice()
          .sort((a, b) => a.slug.localeCompare(b.slug))
          .map(row => [row.slug, { sourceScale: row.sourceScale, ...row.dimensions }])
      ),
    };
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${JSON.stringify(dimensionData, null, 2)}\n`, 'utf8');
  }

  if (csvArgument) {
    if (ambiguous.length || duplicateMatches.length || suspicious.length || missing.length) {
      throw new Error('Refusing to write measurement CSV while mapping discrepancies remain');
    }
    writeMeasurementCsv(path.resolve(csvArgument.slice('--csv='.length)), matched);
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
