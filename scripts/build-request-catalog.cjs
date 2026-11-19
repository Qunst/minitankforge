const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const document = {
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
};
const context = vm.createContext({ window: {}, document, URL, URLSearchParams });
for (const file of ['tanks-data.js', 'sets-data.js', 'app.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js', file), 'utf8'), context, { filename: file });
}

const catalog = vm.runInContext(`
  const optionsByKey = Object.create(null);
  function add(line) {
    const item = getHydratedRequestBasketItem(line);
    if (!item) return;
    const { key, type, fullName, scale, finish, packQuantity, optionLabel, optionValue, unitPrice, itemUrl } = item;
    if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Invalid price: ' + key);
    optionsByKey[key] = { type, fullName, scale, finish, packQuantity, optionLabel, optionValue, unitPrice, itemUrl: absoluteUrl(itemUrl) };
  }
  for (const tank of tankData) {
    for (const scale of getAvailableScales(tank)) {
      for (const finish of validFinishes) {
        for (const { quantity: packQuantity } of validTankPacks) {
          add({ type: 'tank', slug: tank.slug, scale, finish, packQuantity });
        }
      }
    }
  }
  for (const set of setData) {
    for (const scale of getAvailableSetScales(set)) {
      for (const finish of getAvailableSetFinishes(set)) {
        const options = getAvailableSetOptions(set);
        for (const option of options.length ? options : [{ slug: '' }]) {
          add({ type: 'set', slug: set.slug, scale, finish, optionSlug: option.slug });
        }
      }
    }
  }
  optionsByKey;
`, context);

if (Object.keys(catalog).length === 0) throw new Error('The request catalog is empty.');
const outDir = path.join(root, 'functions', '.generated');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'request-catalog.mjs'), `export default ${JSON.stringify(catalog)};\n`);
