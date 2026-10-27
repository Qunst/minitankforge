const fs = require('node:fs/promises');
const { FileBlob, SpreadsheetFile } = require('@oai/artifact-tool');

async function main() {
  const inputPath = process.argv[2];
  const previewPath = process.argv[3];
  if (!inputPath || !previewPath) throw new Error('Usage: node inspect-dimensions-workbook.cjs <input.xlsx> <preview.png>');

  const input = await FileBlob.load(inputPath);
  const workbook = await SpreadsheetFile.importXlsx(input);
  const summary = await workbook.inspect({
    kind: 'workbook,sheet,table,region',
    maxChars: 9000,
    tableMaxRows: 12,
    tableMaxCols: 8,
    tableMaxCellChars: 80,
  });
  process.stdout.write(`${summary.ndjson || JSON.stringify(summary, null, 2)}\n`);

  const first = workbook.worksheets.getItemAt(0);
  const preview = await workbook.render({ sheetName: first.name, autoCrop: 'all', scale: 1, format: 'png' });
  await fs.mkdir(require('node:path').dirname(previewPath), { recursive: true });
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
