const fs = require('node:fs/promises');
const path = require('node:path');
const { FileBlob, SpreadsheetFile, Workbook } = require('@oai/artifact-tool');

const SCALES = [160, 180, 200, 250, 285];
const HEADERS = [
  'Tank',
  'Width (mm)',
  'Length incl. barrel (mm)',
  'Width - 3 mm',
  'Length + 4 mm',
];

async function loadBaseRows(inputPath) {
  const source = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
  const sheet = source.worksheets.getItem('Tank dimensions');
  const values = sheet.getRange('A6:C115').values;
  const rows = values
    .filter(row => row[0] && Number.isFinite(Number(row[1])) && Number.isFinite(Number(row[2])))
    .map(row => ({ tank: String(row[0]), width: Number(row[1]), length: Number(row[2]) }));

  const blitz = rows.find(row => row.tank === 'Opel Blitz Truck');
  if (!blitz) throw new Error('Opel Blitz Truck was not found in the source workbook');
  blitz.width = 7.02;
  blitz.length = 18.66;

  rows.push(
    { tank: 'Type 1 47 mm AT Gun', width: 18.184, length: 24.464 },
    { tank: 'Type 45 24 cm Siege Howitzer', width: 17.35, length: 32.649 },
  );

  return rows.sort((a, b) => a.tank.localeCompare(b.tank, 'en', { numeric: true }));
}

function styleSheet(sheet, scale, rowCount) {
  const lastRow = 4 + rowCount;
  sheet.showGridLines = false;
  sheet.tabColor = scale === 250 ? '#C55A11' : '#4472C4';
  sheet.freezePanes.freezeRows(4);

  sheet.mergeCells('A1:E1');
  sheet.getRange('A1').values = [[`Tank dimensions — 1:${scale}`]];
  sheet.getRange('A1:E1').format = {
    fill: '#1F4E78',
    font: { bold: true, color: '#FFFFFF', size: 16 },
    verticalAlignment: 'center',
  };
  sheet.getRange('A1:E1').format.rowHeight = 28;

  sheet.mergeCells('A2:E2');
  sheet.getRange('A2').values = [[
    scale === 250
      ? 'Base model measurements. Length includes the barrel.'
      : `Scaled proportionally from the 1:250 measurements. Length includes the barrel.`,
  ]];
  sheet.getRange('A2:E2').format = {
    fill: '#D9EAF7',
    font: { italic: true, color: '#1F1F1F', size: 10 },
    verticalAlignment: 'center',
  };
  sheet.getRange('A2:E2').format.rowHeight = 22;

  const header = sheet.getRange('A4:E4');
  header.values = [HEADERS];
  header.format = {
    fill: '#4472C4',
    font: { bold: true, color: '#FFFFFF' },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'all', style: 'thin', color: '#D9E2F3' },
  };
  header.format.rowHeight = 34;

  const data = sheet.getRange(`A5:E${lastRow}`);
  data.format = {
    verticalAlignment: 'center',
    borders: { preset: 'all', style: 'thin', color: '#D9E2F3' },
  };
  sheet.getRange(`B5:E${lastRow}`).format.numberFormat = '0.000';
  sheet.getRange(`B5:E${lastRow}`).format.horizontalAlignment = 'right';

  sheet.getRange(`A5:A${lastRow}`).format.columnWidth = 34;
  sheet.getRange(`B5:B${lastRow}`).format.columnWidth = 16;
  sheet.getRange(`C5:C${lastRow}`).format.columnWidth = 27;
  sheet.getRange(`D5:D${lastRow}`).format.columnWidth = 17;
  sheet.getRange(`E5:E${lastRow}`).format.columnWidth = 18;
  sheet.getRange(`A5:E${lastRow}`).format.rowHeight = 19;

  const table = sheet.tables.add(`A4:E${lastRow}`, true, `TankDimensions${scale}`);
  table.style = 'TableStyleMedium2';
}

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  const previewDir = process.argv[4];
  if (!inputPath || !outputPath || !previewDir) {
    throw new Error('Usage: node build-all-scale-tank-dimensions.cjs <source.xlsx> <output.xlsx> <preview-dir>');
  }

  const baseRows = await loadBaseRows(inputPath);
  if (baseRows.length !== 112) throw new Error(`Expected 112 models, found ${baseRows.length}`);

  const workbook = Workbook.create();
  const sheets = new Map(SCALES.map(scale => [scale, workbook.worksheets.add(`1-${scale}`)]));
  const lastRow = 4 + baseRows.length;

  for (const scale of SCALES) {
    const sheet = sheets.get(scale);
    styleSheet(sheet, scale, baseRows.length);
    sheet.getRange(`A5:A${lastRow}`).values = baseRows.map(row => [row.tank]);

    if (scale === 250) {
      sheet.getRange(`B5:C${lastRow}`).values = baseRows.map(row => [row.width, row.length]);
    } else {
      sheet.getRange('B5').formulas = [[`='1-250'!B5*250/${scale}`]];
      sheet.getRange(`B5:B${lastRow}`).fillDown();
      sheet.getRange('C5').formulas = [[`='1-250'!C5*250/${scale}`]];
      sheet.getRange(`C5:C${lastRow}`).fillDown();
    }

    sheet.getRange('D5').formulas = [['=B5-3']];
    sheet.getRange(`D5:D${lastRow}`).fillDown();
    sheet.getRange('E5').formulas = [['=C5+4']];
    sheet.getRange(`E5:E${lastRow}`).fillDown();
  }

  await workbook.recalculate();

  const summary = await workbook.inspect({
    kind: 'workbook,sheet,table',
    maxChars: 8000,
    tableMaxRows: 4,
    tableMaxCols: 5,
    tableMaxCellChars: 70,
  });
  process.stdout.write(`${summary.ndjson || JSON.stringify(summary, null, 2)}\n`);

  const checks = [];
  for (const scale of SCALES) {
    const check = await workbook.inspect({
      kind: 'region',
      sheetId: `1-${scale}`,
      range: `A4:E${lastRow}`,
      maxChars: 1800,
    });
    checks.push(check.ndjson || JSON.stringify(check));
  }
  process.stdout.write(`${checks.join('\n')}\n`);

  const errors = await workbook.inspect({
    kind: 'match',
    searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
    options: { useRegex: true, maxResults: 100 },
    maxChars: 3000,
  });
  process.stdout.write(`FORMULA_ERRORS\n${errors.ndjson || JSON.stringify(errors, null, 2)}\n`);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
  for (const scale of [160, 250, 285]) {
    const preview = await workbook.render({ sheetName: `1-${scale}`, range: 'A1:E20', scale: 1.25, format: 'png' });
    await fs.writeFile(path.join(previewDir, `preview-1-${scale}.png`), new Uint8Array(await preview.arrayBuffer()));
  }

  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(outputPath);
  process.stdout.write(`OUTPUT ${outputPath}\nMODELS ${baseRows.length}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
