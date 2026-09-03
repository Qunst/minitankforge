const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://minitankforge.com';
const today = new Date().toISOString().slice(0, 10);
const assetVersions = Object.freeze({
  styles: 28,
  app: 54,
  tanks: 32,
  sets: 22,
});
const tankBrowsePopularityOrder = [
  'sherman-m4a3',
  'tiger-i',
  't-34',
  'panther',
  'panzer-iv',
  'tiger-ii',
  't-34-85',
  'maus',
  'kv-2',
  'sherman-firefly',
  'churchill-iv',
  'stug-iii',
  'sturmtiger',
  'pershing',
  'panzer-iii',
  'is-2',
  'kv-1',
  'jagdpanther',
  'm60a1',
  'm18-hellcat',
  'm10-wolverine',
  'hetzer',
  'jagdtiger',
  'ferdinand',
  'm3-lee',
  'm5a1-stuart',
  'm24-chaffee',
  'cromwell',
  'matilda-ii',
  'valentine',
  'char-b1-bis',
  'somua-s35',
  'somua-s40',
  'is-3',
  'is-7',
  't29',
  't30',
  't34-heavy-tank',
  'isu-152',
  'kv-85',
  'su-100',
  'su-85',
  'jagdpz-iv',
  't28-t95-combat',
  'tortoise',
  'fv4005-stage-ii',
  'e-100',
  'kv-5',
  'e-25',
  'e-50',
  'e-75',
  'jagdpanzer-e100',
  'panzer-vii-loewe',
  'jagdpanther-ii',
  't-35',
  't28-t95-transport',
  'type-97-chi-ha',
  'type-95-ha-go',
  'm8-greyhound',
  'sd-kfz-234',
  'm7-priest',
  'm3-half-track',
  'luchs',
  'panzer-38t',
  'panzer-35t',
  't-34-minesweeper',
  'su-76',
  'su-85b',
  'nashorn',
  'hummel',
  'wespe',
  'archer',
  'm10-achilles',
  'churchill-iv-fascine',
  'm13-40',
  'm14-41',
  'su-122',
  'isu-122',
  'kv-1s',
  't-70',
  't-26',
  't-28',
  't-26-twin-turret',
  'fcm-f1',
  'centaur',
  'bishop',
  'ba-64',
  'ba-6',
  'gaz-aa',
  'opel-blitz',
  'zis-42',
  'stz-5',
  'b-4-howitzer',
  't-38',
  'a-32',
  'is-1',
];
const tankBrowsePopularityScores = new Map(
  tankBrowsePopularityOrder.map((slug, index) => [slug, tankBrowsePopularityOrder.length - index])
);
const setBrowseRank = new Map([
  ['german-basic', 10],
  ['ussr-basic', 11],
  ['us-basic', 12],
  ['german-tanks', 20],
  ['ussr-tanks', 21],
  ['german-tank-destroyers', 30],
  ['ussr-tank-destroyers', 31],
]);

function readData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);

  for (const file of ['assets/js/tanks-data.js', 'assets/js/sets-data.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(source, sandbox, { filename: file });
  }

  const dimensionsPath = path.join(root, 'assets/data/tank-dimensions.json');
  const tankDimensions = fs.existsSync(dimensionsPath)
    ? JSON.parse(fs.readFileSync(dimensionsPath, 'utf8'))
    : { units: 'mm', tanks: {} };

  return {
    tanks: sandbox.window.TANKS || [],
    sets: sandbox.window.SETS || [],
    scales: sandbox.window.MTF_SCALES || ['1:160', '1:180', '1:200', '1:250', '1:285'],
    finishes: sandbox.window.MTF_FINISHES || ['Base coat', 'Unpainted'],
    setFinishes: sandbox.window.MTF_SET_FINISHES || ['Base coat', 'Unpainted'],
    tankDimensions,
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripTags(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').trim();
}

function absoluteUrl(value) {
  return new URL(value || 'assets/img/hero.jpg', `${siteUrl}/`).href;
}

function rootRelativeUrl(value) {
  const raw = String(value || '');
  if (!raw) return '/';
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('#')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\.?\//, '')}`;
}

function pageHref(value) {
  const raw = String(value || '');
  if (!raw) return '/';
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('#')) return raw;

  const match = raw.match(/^([^?#]*)(.*)$/);
  const pathPart = (match?.[1] || raw).replace(/^\.?\//, '');
  const suffix = match?.[2] || '';
  const cleanPath = pathPart.replace(/\.html$/i, '');

  return cleanPath.toLowerCase() === 'index' ? `/${suffix}` : `/${cleanPath}${suffix}`;
}

function imageObject(src, caption) {
  return {
    '@type': 'ImageObject',
    url: absoluteUrl(src),
    caption,
  };
}

function tankImageAlt(tank, detail = 'base coat side detail') {
  return [
    tank.name,
    tank.nation,
    tank.era,
    tank.type,
    detail,
    '3D printed miniature model',
  ].filter(Boolean).join(' ');
}

function setImageAlt(set, detail = 'base coat set overview') {
  return [
    set.name,
    set.nation,
    set.era,
    set.category,
    detail,
    '3D printed miniature set',
  ].filter(Boolean).join(' ');
}

function formatPrice(value) {
  return `EUR ${Number(value).toFixed(2)}`;
}

function formatCatalogPrice(value) {
  return `€${Number(value).toFixed(2)}`;
}

function catalogPriceSummary(prices) {
  const valid = prices.map(Number).filter(value => Number.isFinite(value) && value > 0);
  if (!valid.length) return '';

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return min === max ? formatCatalogPrice(min) : `${formatCatalogPrice(min)} – ${formatCatalogPrice(max)}`;
}

function tankCatalogPriceSummary(prices) {
  const valid = prices.map(Number).filter(Number.isFinite);
  if (!valid.length) return '';

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return min === max ? formatCatalogPrice(min) : `${formatCatalogPrice(min)} – ${formatCatalogPrice(max)}`;
}

function priceSummary(prices) {
  const valid = prices.map(Number).filter(value => Number.isFinite(value) && value > 0);
  if (!valid.length) return '';

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`;
}

function aggregateOffer(prices, url) {
  const valid = prices.map(Number).filter(value => Number.isFinite(value) && value > 0);
  if (!valid.length) return null;

  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: Math.min(...valid).toFixed(2),
    highPrice: Math.max(...valid).toFixed(2),
    offerCount: valid.length,
    url,
    seller: {
      '@type': 'Organization',
      name: 'MiniTankForge',
      url: siteUrl,
    },
  };
}

function tankPrices(tank, scales, finishes) {
  const availableScales = tank.availableScales || scales;
  return availableScales.flatMap(scale => {
    return finishes.map(finish => {
      const base = Number((tank.scalePrices || {})[scale] ?? 0);
      const surcharge = Number((tank.finishSurcharges || {})[finish] ?? 0);
      return base + surcharge;
    });
  });
}

function setPrices(set, finishes) {
  const availableScales = set.availableScales || Object.keys(set.prices || {});
  const options = Array.isArray(set.options) ? set.options : [];
  const values = [];

  if (options.length) {
    for (const option of options) {
      for (const finish of finishes) {
        values.push(Number(option?.prices?.[finish] ?? 0));
      }
    }

    return values;
  }

  for (const scale of availableScales) {
    for (const finish of finishes) {
      values.push(Number(set?.prices?.[scale]?.[finish] ?? 0));
    }
  }

  return values;
}

function headerHtml() {
  return `
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="/">MINITANKFORGE</a>
      <div class="nav-stack">
        <nav class="nav nav-row">
          <a href="/tanks">Browse Tanks</a><a href="/sets">Browse Sets</a><a href="/gallery">Gallery</a><a href="/finish-guide">Finish Guide</a><a href="/tank-requests">Requests</a>
        </nav>
        <nav class="nav nav-row">
          <a href="/how-this-works">How Buying Works</a><a href="/scale-comparison">Scale Comparison</a><a href="/reviews">Reviews</a><a href="/faq">FAQ</a><a href="/about">About</a>
        </nav>
      </div>
      <a class="btn btn-etsy" href="https://www.etsy.com/shop/Quali3DPrints?section_id=58368275" rel="noopener" target="_blank">Visit Etsy Shop</a>
    </div>
  </header>`;
}

function footerHtml(copy) {
  return `
  <footer>
    <div class="container footer-grid">
      <div>
        <div class="brand">MINITANKFORGE</div>
        <p>${escapeHtml(copy)}</p>
      </div>
      <div class="nav" style="display:flex">
        <a href="/tanks">Browse Tanks</a><a href="/sets">Browse Sets</a><a href="/how-this-works">How Buying Works</a><a href="/gallery">Gallery</a><a href="/finish-guide">Finish Guide</a><a href="/scale-comparison">Scale Comparison</a><a href="/tank-requests">Requests</a><a href="/faq">FAQ</a><a href="/about">About</a>
      </div>
    </div>
  </footer>`;
}

function jsonLdScript(id, data) {
  return `<script id="${id}" type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function pageShell({ title, description, canonical, image, imageAlt, body, scripts, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta content="width=device-width,initial-scale=1" name="viewport" />
  <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/favicon-96.png" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:site_name" content="MiniTankForge" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${absoluteUrl(image)}" />
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${absoluteUrl(image)}" />
  <link href="/assets/css/styles.css?v=${assetVersions.styles}" rel="stylesheet" />
  ${jsonLd.join('\n  ')}
  ${scripts.join('\n  ')}
</head>
<body>
${headerHtml()}
${body}
${footerHtml('Browse product details, scale choices, finish options, and Etsy links in one place.')}
</body>
</html>
`;
}

function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/[ \t]+$/gm, ''), 'utf8');
}

function collectHtmlFiles(directory, files = []) {
  const skippedDirectories = new Set(['.git', '.agents', '.codex', '.tmp', 'node_modules', 'output', 'tmp']);

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) {
        collectHtmlFiles(path.join(directory, entry.name), files);
      }
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function normalizeInternalHtmlLinks() {
  const localHtmlHref = /href=(["'])(\/?)([a-z0-9][a-z0-9._-]*)\.html((?:[?#][^"']*)?)\1/gi;
  let changedFiles = 0;
  let changedLinks = 0;

  for (const file of collectHtmlFiles(root)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = original.replace(localHtmlHref, (match, quote, leadingSlash, pageName, suffix = '') => {
      changedLinks += 1;
      const cleanPath = pageName.toLowerCase() === 'index' ? '/' : `/${pageName}`;
      return `href=${quote}${cleanPath}${suffix}${quote}`;
    });

    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      changedFiles += 1;
    }
  }

  return { files: changedFiles, links: changedLinks };
}

function ensureFaviconLinks() {
  const favicon = '  <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/favicon-96.png" />';
  let changedFiles = 0;

  for (const file of collectHtmlFiles(root)) {
    const original = fs.readFileSync(file, 'utf8');
    if (/rel=["'](?:shortcut )?icon["']/i.test(original)) continue;

    const updated = original.replace(/(<meta\s+content=["']width=device-width,initial-scale=1["']\s+name=["']viewport["']\s*\/?>)/i, `$1\n${favicon}`);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      changedFiles += 1;
    }
  }

  return changedFiles;
}

function normalizeAssetVersions() {
  const replacements = [
    [/styles\.css\?v=\d+/g, `styles.css?v=${assetVersions.styles}`],
    [/app\.js\?v=\d+/g, `app.js?v=${assetVersions.app}`],
    [/tanks-data\.js\?v=\d+/g, `tanks-data.js?v=${assetVersions.tanks}`],
    [/sets-data\.js\?v=\d+/g, `sets-data.js?v=${assetVersions.sets}`],
  ];
  let changedFiles = 0;

  for (const file of collectHtmlFiles(root)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = replacements.reduce(
      (html, [pattern, replacement]) => html.replace(pattern, replacement),
      original
    );

    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      changedFiles += 1;
    }
  }

  return changedFiles;
}

function isVisible(item) {
  return item?.disabled !== true;
}

function getDisplayName(name) {
  return String(name || '').split(' (')[0].trim();
}

function getAlternateName(name) {
  return String(name || '').match(/\s+\(([^)]+)\)\s*$/)?.[1]?.trim() || '';
}

function getTankSnippetType(tank) {
  const type = String(tank?.type || '').toLowerCase();
  if (type.includes('tank destroyer')) return 'Tank Destroyer Miniature';
  if (type.includes('assault gun')) return 'Assault Gun Miniature';
  if (type.includes('artillery')) return 'Artillery Miniature';
  if (type.includes('transport')) return 'Vehicle Miniature';
  if (type.includes('tank')) return 'Tank Miniature';
  return 'Miniature';
}

const tankSeoOverrides = {
  'tiger-i': {
    title: 'Tiger I Ausf. E Heavy Tank Miniature | MiniTankForge',
    description: 'Browse the Tiger I Ausf. E 3D printed German heavy tank miniature for mid-war and elite armor scenarios. Choose scale, finish, direct request, or Etsy.',
  },
  'tiger-ii': {
    title: 'Tiger II King Tiger Miniature | MiniTankForge',
    description: 'Browse the Tiger II King Tiger 3D printed late-war German heavy tank miniature with angular armor detail. Choose scale, finish, direct request, or Etsy.',
  },
  'panzer-iii': {
    title: 'Panzer III Early-War Tank Miniature | MiniTankForge',
    description: 'Browse the Panzer III 3D printed German early and mid-war medium tank miniature for campaign forces, platoons, and mixed armor groups.',
  },
  'panzer-iv': {
    title: 'Panzer IV Workhorse Tank Miniature | MiniTankForge',
    description: 'Browse the Panzer IV 3D printed German workhorse medium tank miniature for early, mid, and late-war tabletop forces in multiple scales.',
  },
  'panzer-35t': {
    title: 'Panzer 35(t) vz.35 Light Tank Miniature | MiniTankForge',
    description: 'Browse the Panzer 35(t) 3D printed Czech-built early-war German light tank miniature for invasion-era forces and compact tabletop scenarios.',
  },
  'panzer-38t': {
    title: 'Panzer 38(t) Light Tank Miniature | MiniTankForge',
    description: 'Browse the Panzer 38(t) 3D printed Czech-built German light tank miniature, useful for early-war forces and Hetzer chassis-family collections.',
  },
  't28-t95-transport': {
    title: 'T28/T95 Transport Tank Miniature | MiniTankForge',
  },
};

function getTankMetaTitle(tank) {
  if (tankSeoOverrides[tank.slug]?.title) return tankSeoOverrides[tank.slug].title;
  return `${getTankHeading(tank)} | MiniTankForge`;
}

function getTankMetaDescription(tank, availableScales) {
  if (tankSeoOverrides[tank.slug]?.description) return tankSeoOverrides[tank.slug].description;
  return `Browse the ${getDisplayName(tank.name)} 3D printed ${tank.era} ${getTankSnippetType(tank).toLowerCase()} in ${availableScales.join(', ')}. Choose finish, request direct, or use Etsy.`;
}

function getTankHeading(tank) {
  const displayName = getDisplayName(tank.name);
  const snippetType = getTankSnippetType(tank);

  if (snippetType === 'Tank Miniature' && /\btank$/i.test(displayName)) {
    return `${displayName} Miniature`;
  }

  return `${displayName} ${snippetType}`;
}

function getTankIntro(tank, availableScales) {
  const nationality = {
    Germany: 'German',
    USA: 'American',
    USSR: 'Soviet',
    UK: 'British',
    Italy: 'Italian',
    Japan: 'Japanese',
    France: 'French',
  }[tank.nation] || tank.nation;

  return `The ${getDisplayName(tank.name)} is a 3D printed ${nationality} ${tank.era} ${getTankSnippetType(tank).toLowerCase()} available in ${availableScales.join(', ')}.`;
}

function getTankDimensionsByScale(tank, availableScales, dimensionData) {
  const sourceDimensions = dimensionData?.tanks?.[tank.slug];
  if (!sourceDimensions) return null;

  const sourceScale = Number(sourceDimensions.sourceScale || dimensionData.sourceScale) || 250;
  const scales = availableScales.map(scale => {
    const denominator = Number(String(scale).split(':')[1]);
    if (!Number.isFinite(denominator) || denominator <= 0) return null;
    const factor = sourceScale / denominator;
    const format = value => (Number(value) * factor).toFixed(1);

    return {
      scale,
      length: format(sourceDimensions.length),
      width: format(sourceDimensions.width),
      height: format(sourceDimensions.height),
    };
  }).filter(Boolean);

  return scales.length ? { sourceScale, scales } : null;
}

function renderTankDimensions(tank, dimensions, selectedScale = '1:180') {
  if (!dimensions?.scales?.length) return '';

  const selected = dimensions.scales.find(item => item.scale === selectedScale) || dimensions.scales[0];
  const rows = dimensions.scales.map(item => `
            <tr>
              <td><strong>${escapeHtml(item.scale)}</strong></td>
              <td>${item.length} mm</td>
              <td>${item.width} mm</td>
              <td>${item.height} mm</td>
            </tr>`).join('');

  return `
        <p class="tank-dimension-inline" data-tank-dimension-display aria-live="polite">
          <span>Approx. size at <strong data-dimension-scale>${escapeHtml(selected.scale)}</strong>:</span>
          <strong class="tank-dimension-value" data-dimension-value>${selected.length} × ${selected.width} × ${selected.height} mm</strong>
          <span class="tank-dimension-axis">L × W × H · includes barrel</span>
        </p>
        <details class="tank-dimensions-details">
          <summary>All scale dimensions</summary>
          <div class="table-scroll" role="region" aria-label="${escapeHtml(getDisplayName(tank.name))} dimensions by scale" tabindex="0">
            <table class="table tank-dimensions-table">
              <thead>
                <tr><th>Scale</th><th>Length</th><th>Width</th><th>Height</th></tr>
              </thead>
              <tbody>${rows}
              </tbody>
            </table>
          </div>
          <p class="helper">Measurements use the STL bounding box; other scales are proportional estimates.</p>
        </details>`;
}

const tankHighlightTagOverrides = {
  'e-100': ['What-if', 'Game-famous', 'WoT'],
  'e-25': ['What-if', 'Game-famous', 'WoT'],
  'jagdpanther': ['Iconic', 'WoT'],
  'kv-2': ['Meme tank', 'Game-famous', 'WoT'],
  'maus': ['Iconic', 'Game-famous', 'WoT'],
  'panther': ['Iconic', 'Late war', 'WoT'],
  'sherman-m4a3': ['Iconic', 'Beginner pick', 'WoT'],
  'stug-iii': ['Beginner pick', 'Late war', 'WoT'],
  't-34': ['Iconic', 'Beginner pick', 'WoT'],
  't-34-85': ['Iconic', 'Late war', 'WoT'],
  'tiger-i': ['Iconic', 'Game-famous', 'WoT'],
  'tiger-ii': ['Iconic', 'Late war', 'WoT'],
};

function getTankHighlightTags(tank) {
  const tags = [];
  const addTag = tag => {
    const label = String(tag || '').trim();
    if (label && !tags.includes(label)) tags.push(label);
  };

  (Array.isArray(tank?.siteTags) ? tank.siteTags : tankHighlightTagOverrides[tank?.slug] || []).forEach(addTag);

  const status = String(tank?.historicalStatus || '').toLowerCase();
  if (status.includes('what-if')) addTag('What-if');
  if (status.includes('prototype') || status.includes('paper') || status.includes('unfinished')) addTag('Prototype');

  return tags;
}

function getTankDetailTags(tank) {
  return [
    tank.nation,
    tank.era,
    tank.type,
    ...getTankHighlightTags(tank),
  ].filter(Boolean);
}

function renderTankSiteTags(tank, { limit = Infinity, modifier = '' } = {}) {
  const tags = getTankDetailTags(tank).slice(0, limit);
  if (!tags.length) return '';

  return `
      <div class="tank-tag-list ${modifier}" aria-label="Browse tags">
        ${tags.map(tag => `<span class="tank-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>`;
}

function renderSetStaticContents(set) {
  const options = Array.isArray(set.options) ? set.options : [];

  if (options.length) {
    return options.map(option => `
          <div>
            <h3>${escapeHtml(option.label)}</h3>
            <ul class="set-contents-list compact">
              ${(option.contents || []).map(item => `<li>${escapeHtml(stripTags(item))}</li>`).join('\n              ')}
            </ul>
          </div>`).join('\n');
  }

  const contents = Array.isArray(set.contents) ? set.contents : [];
  return `
          <ul class="set-contents-list compact">
            ${contents.map(item => `<li>${escapeHtml(stripTags(item))}</li>`).join('\n            ')}
          </ul>`;
}

function normalizeSetContentName(value) {
  return stripTags(value)
    .toLowerCase()
    .replace(/^\s*\d+\s*(x|×|ã—)?\s*/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const setContentTankAliases = {
  'a 32': 'a-32',
  'char b1 bis': 'char-b1-bis',
  'b1 bis': 'char-b1-bis',
  'e 100': 'e-100',
  'e 25': 'e-25',
  'e 50': 'e-50',
  'e 75': 'e-75',
  'ferdinand': 'ferdinand',
  'fv4005': 'fv4005-stage-ii',
  'fv4005 stage ii': 'fv4005-stage-ii',
  'fv4005 stage 2': 'fv4005-stage-ii',
  'hetzer': 'hetzer',
  'hummel': 'hummel',
  'is 1': 'is-1',
  'is 2': 'is-2',
  'is 3': 'is-3',
  'isu 122': 'isu-122',
  'isu 152': 'isu-152',
  'jagdpanther': 'jagdpanther',
  'jagdpanzer e100': 'jagdpanzer-e100',
  'jagdpz iv': 'jagdpz-iv',
  'jagdpanzer iv': 'jagdpz-iv',
  'jagdtiger': 'jagdtiger',
  'kv 2': 'kv-2',
  'kv 5': 'kv-5',
  'kv5': 'kv-5',
  'kv 85': 'kv-85',
  'kv85': 'kv-85',
  'luchs': 'luchs',
  'm10 wolverine': 'm10-wolverine',
  'm18 hellcat': 'm18-hellcat',
  'hellcat': 'm18-hellcat',
  'm3 half track': 'm3-half-track',
  'm3 lee': 'm3-lee',
  'm5a1 stuart': 'm5a1-stuart',
  'm60a1': 'm60a1',
  'm7 priest': 'm7-priest',
  'm8 greyhound': 'm8-greyhound',
  'maus': 'maus',
  'nashorn': 'nashorn',
  'opel blitz': 'opel-blitz',
  'opel blitz truck': 'opel-blitz',
  'panther': 'panther',
  'panzer iii': 'panzer-iii',
  'panzer iv': 'panzer-iv',
  'panzer vii loewe': 'panzer-vii-loewe',
  'panzer vii lowe': 'panzer-vii-loewe',
  'panzer 35 t': 'panzer-35t',
  'panzer 35t': 'panzer-35t',
  'panzer 38 t': 'panzer-38t',
  'panzer 38t': 'panzer-38t',
  'pershing': 'pershing',
  'sd kfz 234': 'sd-kfz-234',
  'sherman firefly': 'sherman-firefly',
  'sherman': 'sherman-m4a3',
  'somua s35': 'somua-s35',
  'somua s40': 'somua-s40',
  'sturmtiger': 'sturmtiger',
  'stug iii': 'stug-iii',
  'su 76': 'su-76',
  'su 85': 'su-85',
  'su 85b': 'su-85b',
  'su 85 b': 'su-85b',
  'su 100': 'su-100',
  'su 122': 'su-122',
  't 28': 't-28',
  't29': 't29',
  't30': 't30',
  't 34': 't-34',
  't34 heavy': 't34-heavy-tank',
  'heavy tank t34': 't34-heavy-tank',
  't 34 85': 't-34-85',
  't 34 minesweeper': 't-34-minesweeper',
  't 70': 't-70',
  'tiger i': 'tiger-i',
  'tiger ii': 'tiger-ii',
  'type 95 ha go': 'type-95-ha-go',
  'type 97 chi ha': 'type-97-chi-ha',
  'wespe': 'wespe',
};

function tankSlugFromSetContent(item) {
  return setContentTankAliases[normalizeSetContentName(item)] || '';
}

function getSetContentsForLinks(set) {
  const options = Array.isArray(set.options) ? set.options : [];
  return options.length
    ? options.flatMap(option => option.contents || [])
    : (Array.isArray(set.contents) ? set.contents : []);
}

function getSetLinkedTanks(set, tanks) {
  const seen = new Set();
  return getSetContentsForLinks(set)
    .map(tankSlugFromSetContent)
    .filter(Boolean)
    .filter(slug => {
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map(slug => tanks.find(tank => tank.slug === slug && isVisible(tank)))
    .filter(Boolean);
}

function setLinksToTank(set, tank, tanks) {
  return getSetLinkedTanks(set, tanks).some(linkedTank => linkedTank.slug === tank.slug);
}

function scoreRelatedTank(tank, candidate) {
  if (!tank || !candidate || tank.slug === candidate.slug) return 0;

  let score = 0;
  if (candidate.nation === tank.nation) score += 6;
  if (candidate.type === tank.type) score += 6;
  if (candidate.era === tank.era) score += 2;

  const tankName = getDisplayName(tank.name).toLowerCase();
  const candidateName = getDisplayName(candidate.name).toLowerCase();
  ['sherman', 't-34', 'panzer', 'tiger', 'is-', 'su-', 'e-'].forEach(token => {
    if (tankName.includes(token) && candidateName.includes(token)) score += 4;
  });

  if (/heavy tank|super heavy tank/i.test(tank.type) && /heavy tank|super heavy tank/i.test(candidate.type)) {
    score += 3;
  }

  return score;
}

function getRelatedTanks(tank, tanks, limit = 3) {
  return tanks
    .filter(isVisible)
    .map(candidate => ({ tank: candidate, score: scoreRelatedTank(tank, candidate) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || getDisplayName(a.tank.name).localeCompare(getDisplayName(b.tank.name)))
    .slice(0, limit)
    .map(item => item.tank);
}

function getGuideLinksForTank(tank) {
  const links = [];
  const add = (label, href, note) => {
    if (!links.some(link => link.href === href)) links.push({ label, href, note });
  };

  if (tank.nation === 'Germany') add('German WW2 tank miniatures', '/german-ww2-tank-miniatures', 'Browse nearby German armor and set paths.');
  if (tank.nation === 'USSR') add('Soviet WW2 tank miniatures', '/soviet-ww2-tank-miniatures', 'Browse nearby Soviet armor and set paths.');
  if (tank.nation === 'USA') add('American WW2 tank miniatures', '/american-ww2-tank-miniatures', 'Browse US armor, Shermans, Hellcats, and game packs.');
  if (/sherman/i.test(tank.name)) add('Sherman tank miniatures', '/sherman-tank-miniatures', 'Compare Sherman-focused tanks and game packs.');
  if (/tank destroyer|assault gun/i.test(tank.type)) add('WW2 tank destroyer miniatures', '/ww2-tank-destroyer-miniatures', 'Compare anti-armor and assault-gun vehicles.');
  if (/heavy tank|super heavy tank/i.test(tank.type)) add('WW2 heavy tank miniatures', '/ww2-heavy-tank-miniatures', 'Compare heavy and super-heavy vehicle choices.');
  if (tank.historicalStatus) add('Prototype and what-if tanks', '/prototype-tank-miniatures', 'Compare prototype, unfinished, and paper-project vehicles.');
  add('Tabletop tank miniatures', '/tabletop-tank-miniatures', 'Browse scale, set, and vehicle paths for tabletop play.');

  return links.slice(0, 4);
}

function renderStaticInternalLinks({ heading, intro, links }) {
  if (!Array.isArray(links) || !links.length) return '';

  return `
    <section class="browse-preview-section guide-links-bottom">
      <div class="section-head">
        <div>
          <h2>${escapeHtml(heading)}</h2>
          <p>${escapeHtml(intro)}</p>
        </div>
      </div>
      <div class="guide-link-grid guide-link-grid-compact">
        ${links.map(link => `
          <a class="guide-link guide-link-subtle" href="${escapeHtml(pageHref(link.href))}">
            <span>${escapeHtml(link.label)}</span>
            ${link.note ? `<small>${escapeHtml(link.note)}</small>` : ''}
          </a>
        `).join('')}
      </div>
    </section>`;
}

function renderTankStaticInternalLinks(tank, data) {
  const relatedTankLinks = getRelatedTanks(tank, data.tanks, 3).map(relatedTank => ({
    label: getDisplayName(relatedTank.name),
    href: `/tanks/${relatedTank.slug}/`,
    note: `${relatedTank.nation} ${relatedTank.type.toLowerCase()}`,
  }));
  const setLinks = data.sets
    .filter(set => isVisible(set) && setLinksToTank(set, tank, data.tanks))
    .slice(0, 2)
    .map(set => ({
      label: set.name,
      href: `/sets/${set.slug}/`,
      note: 'Set or game pack that includes this vehicle.',
    }));

  return renderStaticInternalLinks({
    heading: 'Explore Related Pages',
    intro: 'Useful next pages for nearby vehicles, sets, and buying guides.',
    links: [...relatedTankLinks, ...setLinks, ...getGuideLinksForTank(tank)],
  });
}

function renderSetStaticIncludedVehicleLinks(set, tanks) {
  const links = getSetLinkedTanks(set, tanks).slice(0, 8).map(tank => ({
    label: getDisplayName(tank.name),
    href: `/tanks/${tank.slug}/`,
    note: `${tank.nation} ${tank.type.toLowerCase()} page.`,
  }));

  return renderStaticInternalLinks({
    heading: 'More About These Vehicles',
    intro: 'Individual model pages for vehicles that appear in this set or pack.',
    links,
  });
}

function setProductDescription(set) {
  return set.description || `Browse the ${set.name}, a ${set.category.toLowerCase()} for ${set.nation} ${set.era} miniature games. Review contents, finish choices, and direct request or Etsy options.`;
}

function isSetInDevelopment(set) {
  return set?.inDevelopment === true;
}

function getSetAvailabilityNote(set) {
  return set.availabilityNote || 'This set is still being built and tested. Final ordering details may change before release.';
}

function getSetStaticPriceLabel(set, prices) {
  if (isSetInDevelopment(set)) return set.priceLabel || 'Price will be confirmed when ready';
  return priceSummary(prices);
}

function setMetaTitle(set) {
  if (set.metaTitle) return set.metaTitle;

  if (set.filterGroup === 'Game') {
    const gameName = set.slug === 'undaunted-reinforcements-normandy-tank-pack'
      ? 'Undaunted Reinforcements Tank'
      : set.name.replace(/\s+Pack$/i, '');
    return `${gameName} Miniature Pack | MiniTankForge`;
  }

  return `${set.name.replace(/\s+Set$/i, '')} Miniature Set | MiniTankForge`;
}

function setMetaDescription(set) {
  if (set.metaDescription) return set.metaDescription;

  const buyingOptions = set.etsyUrl ? 'Etsy and direct request options' : 'direct request options';

  if (set.filterGroup === 'Game') {
    const scale = (Array.isArray(set.availableScales) && set.availableScales[0]) || 'fixed scale';
    return `Explore the ${set.name} unofficial ${scale} game accessory pack. Review included miniatures, finishes, and ${buyingOptions}.`;
  }

  return `Explore the ${set.name}, a 3D printed ${set.era} tank miniature set. Review vehicles, scales, finishes, and ${buyingOptions}.`;
}

function getSetIntro(set, availableScales) {
  if (set.filterGroup === 'Game') {
    return `The ${set.name} is an unofficial 3D printed ${availableScales.join(', ')} miniature accessory pack for tabletop play.`;
  }

  return `The ${set.name} is a 3D printed ${set.era} tank miniature set featuring vehicles from ${set.nation}, available in ${availableScales.join(', ')}.`;
}

function renderTankCatalogTags(tank) {
  const tags = [tank.nation, tank.type, ...getTankHighlightTags(tank)].filter(Boolean).slice(0, 4);
  if (!tags.length) return '';

  return `<div class="tank-tag-list tank-tag-list-card" aria-label="Browse tags">${tags.map(tag => `<span class="tank-tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderTankCatalogCard(tank, data) {
  const detailUrl = `/tanks/${encodeURIComponent(tank.slug)}/`;
  const image = tank.image
    ? `<div class="product-image "><img src="${escapeHtml(rootRelativeUrl(tank.image))}" width="1600" height="900" alt="${escapeHtml(tankImageAlt(tank, 'product card photo'))}" loading="lazy" decoding="async"></div>`
    : `<div class="product-image tank-placeholder"><div class="tank tank-lg"></div></div>`;

  return `    <article class="card product-card">
      <a href="${detailUrl}" data-scale-link="${detailUrl}" class="product-image-link">
        ${image}
      </a>
      <div>
        <h3>${escapeHtml(tank.name)}</h3>
        ${renderTankCatalogTags(tank)}
        <div class="tank-card-price">${escapeHtml(tankCatalogPriceSummary(tankPrices(tank, data.scales, data.finishes)))}</div>
        <p class="muted fun-fact">${escapeHtml(tank.fact)}</p>
      </div>
      <a class="btn btn-primary" data-scale-link="${detailUrl}" href="${detailUrl}">View Tank</a>
    </article>`;
}

function getEstimatedTankPopularity(tank) {
  const tags = getTankHighlightTags(tank);
  const status = String(tank?.historicalStatus || '').toLowerCase();
  const type = String(tank?.type || '').toLowerCase();
  let score = 34;

  if (tags.includes('Iconic')) score += 16;
  if (tags.includes('Beginner pick')) score += 10;
  if (tags.includes('Game-famous')) score += 8;
  if (tags.includes('Meme tank')) score += 8;
  if (tags.includes('Late war')) score += 5;
  if (tags.includes('What-if')) score += 4;
  if (tags.includes('Prototype')) score += 2;
  if (type.includes('medium')) score += 7;
  if (type.includes('heavy')) score += 6;
  if (type.includes('tank destroyer')) score += 5;
  if (type.includes('super heavy')) score += 4;
  if (type.includes('armored car') || type.includes('truck') || type.includes('tractor')) score -= 8;
  if (type.includes('artillery') || type.includes('howitzer')) score -= 6;
  if (status.includes('what-if') || status.includes('paper')) score -= 5;
  if (status.includes('prototype') || status.includes('unfinished')) score -= 3;
  if (tank?.etsyUrl) score += 2;

  return score;
}

function getTankBrowsePriority(tank) {
  const manualPriority = Number(tank?.browsePriority);
  if (Number.isFinite(manualPriority)) return manualPriority;

  const researchedScore = tankBrowsePopularityScores.get(tank?.slug);
  if (Number.isFinite(researchedScore)) return researchedScore;

  return getEstimatedTankPopularity(tank);
}

function renderSetCatalogCard(set, data) {
  const detailUrl = `/sets/${encodeURIComponent(set.slug)}/`;
  const image = rootRelativeUrl(set.image || 'assets/img/sets/genset.jpg');
  const priceLabel = isSetInDevelopment(set)
    ? set.priceLabel || 'Price will be confirmed when ready'
    : catalogPriceSummary(setPrices(set, data.setFinishes));

  return `    <article class="card product-card">
      <a href="${detailUrl}" class="product-image-link">
        <div class="product-image "><img src="${escapeHtml(image)}" width="1200" height="900" alt="${escapeHtml(setImageAlt(set, 'product card photo'))}" loading="lazy" decoding="async"></div>
      </a>
      <div>
        <h3>${escapeHtml(set.name)}</h3>
        <div class="product-meta">
          <span class="badge">${escapeHtml(set.category)}</span>
          <span class="badge">${escapeHtml(set.nation)}</span>
          <span class="badge">${escapeHtml(set.era)}</span>
        </div>
        <div class="tank-card-price">${escapeHtml(priceLabel)}</div>
        <p class="muted fun-fact">${escapeHtml(set.note)}</p>
      </div>
      <a class="btn btn-primary" href="${detailUrl}">View Set</a>
    </article>`;
}

function sortTankCatalog(tanks) {
  return tanks
    .map((tank, index) => ({ tank, index }))
    .sort((a, b) => {
      const popularityDiff = getTankBrowsePriority(b.tank) - getTankBrowsePriority(a.tank);
      if (popularityDiff) return popularityDiff;

      const featuredDiff = Number(Boolean(b.tank.featured)) - Number(Boolean(a.tank.featured));
      if (featuredDiff) return featuredDiff;

      return (a.tank.featuredOrder || 999) - (b.tank.featuredOrder || 999)
        || getDisplayName(a.tank.name).localeCompare(getDisplayName(b.tank.name))
        || a.index - b.index;
    })
    .map(item => item.tank);
}

function sortSetCatalog(sets) {
  return sets
    .map((set, index) => ({ set, index }))
    .sort((a, b) => {
      const aRank = setBrowseRank.get(a.set.slug) ?? (a.set.filterGroup === 'Game' ? 90 : 60);
      const bRank = setBrowseRank.get(b.set.slug) ?? (b.set.filterGroup === 'Game' ? 90 : 60);
      return aRank - bRank || a.index - b.index;
    })
    .map(item => item.set);
}

function replaceGeneratedCatalog(html, marker, selector, cards) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  const generated = `${start}\n${cards}\n      ${end}`;
  const existingPattern = new RegExp(`<!-- ${marker}:START -->[\\s\\S]*?<!-- ${marker}:END -->`);

  if (existingPattern.test(html)) return html.replace(existingPattern, generated);

  const emptyGrid = `<div class="grid-3" ${selector}></div>`;
  if (!html.includes(emptyGrid)) {
    throw new Error(`Could not find catalog grid: ${selector}`);
  }

  return html.replace(emptyGrid, `<div class="grid-3" ${selector}>\n      ${generated}\n      </div>`);
}

function writeCatalogPages(data) {
  const tanks = sortTankCatalog(data.tanks.filter(isVisible));
  const sets = sortSetCatalog(data.sets.filter(isVisible));
  const tanksPath = path.join(root, 'tanks.html');
  const setsPath = path.join(root, 'sets.html');
  let tanksHtml = fs.readFileSync(tanksPath, 'utf8');
  let setsHtml = fs.readFileSync(setsPath, 'utf8');

  tanksHtml = replaceGeneratedCatalog(
    tanksHtml,
    'STATIC-TANK-CARDS',
    'data-tank-grid',
    tanks.map(tank => renderTankCatalogCard(tank, data)).join('\n')
  );
  tanksHtml = tanksHtml.replace(
    /(<div class="browse-results-count" data-tank-result-count>)[^<]*(<\/div>)/,
    `$1Showing ${tanks.length} tanks$2`
  );
  tanksHtml = tanksHtml.replace(
    /(<p data-tank-result-note>)[^<]*(<\/p>)/,
    '$1All catalog vehicles are visible.$2'
  );
  setsHtml = replaceGeneratedCatalog(
    setsHtml,
    'STATIC-SET-CARDS',
    'data-sets-grid',
    sets.map(set => renderSetCatalogCard(set, data)).join('\n')
  );

  writeFile(tanksPath, tanksHtml);
  writeFile(setsPath, setsHtml);

  return { tanks: tanks.length, sets: sets.length };
}

function renderSetStaticGuideLinks(set) {
  const links = Array.isArray(set.guideLinks) ? set.guideLinks : [];
  if (!links.length) return '';

  return `
    <section class="browse-preview-section guide-links-bottom">
      <div class="section-head">
        <div>
          <h2>${escapeHtml(set.guideLinksHeading || 'Related Guides')}</h2>
          <p>${escapeHtml(set.guideLinksIntro || 'Useful pages for comparing this set with nearby vehicle and force-building paths.')}</p>
        </div>
      </div>
      <div class="guide-link-grid guide-link-grid-compact">
        ${links.map(link => `
          <a class="guide-link guide-link-subtle" href="${escapeHtml(pageHref(link.href))}">
            <span>${escapeHtml(link.label)}</span>
            ${link.note ? `<small>${escapeHtml(link.note)}</small>` : ''}
          </a>
        `).join('')}
      </div>
    </section>`;
}

function renderSetStaticVideos(set) {
  const videos = Array.isArray(set.videos) ? set.videos.filter(video => video?.youtubeId) : [];
  if (!videos.length) return '';

  return `
    <section class="set-video-section">
      <div class="section-head">
        <div>
          <h2>See the miniatures in play</h2>
          <p>Mike Lambo demonstrates these unofficial accessories on the game map. MiniTankForge supplied the featured samples; the videos state that Mike receives no benefit from purchases.</p>
        </div>
      </div>
      <div class="set-video-grid">
        ${videos.map(video => {
          const videoId = encodeURIComponent(video.youtubeId);
          return `
        <article class="card info-card set-video-card">
          <div class="kicker">Creator demonstration</div>
          <h3>${escapeHtml(video.title || 'Miniatures in play')}</h3>
          <div class="set-video-embed">
            <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="${escapeHtml(video.title || 'Miniatures in play')}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
          ${video.note ? `<p class="muted">${escapeHtml(video.note)}</p>` : ''}
          <a class="btn" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Watch on YouTube</a>
        </article>`;
        }).join('')}
      </div>
    </section>`;
}

function writeTankPage(tank, data) {
  const publicUrl = `${siteUrl}/tanks/${tank.slug}/`;
  const availableScales = tank.availableScales || data.scales;
  const prices = tankPrices(tank, data.scales, data.finishes);
  const metaDescription = getTankMetaDescription(tank, availableScales);
  const productDescription = tank.description || metaDescription;
  const title = getTankMetaTitle(tank);
  const heading = getTankHeading(tank);
  const alternateName = getAlternateName(tank.name);
  const offer = aggregateOffer(prices, tank.etsyUrl || publicUrl);
  const internalLinksHtml = renderTankStaticInternalLinks(tank, data);
  const tankDimensions = getTankDimensionsByScale(tank, availableScales, data.tankDimensions);
  const defaultScale = availableScales.includes('1:180') ? '1:180' : availableScales[0];
  const dimensionsHtml = renderTankDimensions(tank, tankDimensions, defaultScale);
  const dimensionsAttribute = tankDimensions
    ? escapeHtml(JSON.stringify(Object.fromEntries(tankDimensions.scales.map(item => [item.scale, item]))))
    : '';

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tank.name,
    description: productDescription,
    image: imageObject(tank.image, tankImageAlt(tank)),
    brand: { '@type': 'Brand', name: 'MiniTankForge' },
    sku: tank.slug,
    category: `${tank.nation} ${tank.era} ${tank.type}`,
    material: 'ABS-like resin',
    url: publicUrl,
    ...(offer ? { offers: offer } : {}),
  };

  const body = `
  <main class="container" data-tank-detail data-slug="${escapeHtml(tank.slug)}" data-detail-url="${publicUrl}"${dimensionsAttribute ? ` data-dimensions="${dimensionsAttribute}"` : ''}>
    <section class="hero-small">
      <div class="eyebrow">Single tank page</div>
      <h1 class="page-title">${escapeHtml(heading)}</h1>
      ${alternateName ? `<p class="muted"><strong>Also known as:</strong> ${escapeHtml(alternateName)}</p>` : ''}
      <p class="lead">${escapeHtml(getTankIntro(tank, availableScales))}</p>
      ${renderTankSiteTags(tank, { modifier: 'tank-tag-list-detail' })}
      <a class="detail-back-link" href="/tanks">Back to all tanks</a>
    </section>
    <section class="split">
      <div class="tank-media-stack">
        <div class="product-image product-image-large">
          <img src="${escapeHtml(rootRelativeUrl(tank.image))}" width="1600" height="900" alt="${escapeHtml(tankImageAlt(tank))}" loading="eager" fetchpriority="high" decoding="async">
        </div>
      </div>
      <div class="detail-panel card">
        <div class="kicker">Options</div>
        <h2 style="margin-top:6px">Review configuration</h2>
        <ul class="spec-list">
          <li><strong>Available scales</strong><br>${escapeHtml(availableScales.join(', '))}</li>
          <li><strong>Finish options</strong><br>${escapeHtml(data.finishes.join(', '))}</li>
          <li><strong>Price range</strong><br>${escapeHtml(priceSummary(prices))}</li>
          <li><strong>Nation / era</strong><br>${escapeHtml(tank.nation)} / ${escapeHtml(tank.era)}</li>
          <li><strong>Type</strong><br>${escapeHtml(tank.type)}</li>
          ${tank.compatibility ? `<li><strong>Tabletop use</strong><br>${escapeHtml(tank.compatibility)}</li>` : ''}
          ${tank.historicalStatus ? `<li><strong>Historical status</strong><br>${escapeHtml(tank.historicalStatus)}</li>` : ''}
          <li><strong>Material</strong><br>Custom tougher ABS-like resin</li>
          <li><strong>Assembly</strong><br>Fully assembled; fixed turret where present</li>
          <li><strong>Preparation</strong><br>Supports removed, washed, and fully cured</li>
          <li><strong>Finish</strong><br>Unpainted or a colored primer base coat</li>
        </ul>
${dimensionsHtml}
        <div class="page-actions">
          ${tank.etsyUrl
            ? `<a class="btn btn-etsy" href="${escapeHtml(tank.etsyUrl)}" target="_blank" rel="noopener">Open on Etsy</a>`
            : '<a class="btn btn-primary" href="/tank-requests">Ask about this tank</a>'}
        </div>
      </div>
    </section>
    <section class="grid-2">
      <div>
        <h2>Model notes</h2>
        <p class="muted">${escapeHtml(productDescription)}</p>
      </div>
      <div>
        <h2>Historical note</h2>
        <p class="muted">${escapeHtml(tank.fact)}</p>
      </div>
    </section>
${internalLinksHtml}
  </main>`;

  const html = pageShell({
    title,
    description: metaDescription,
    canonical: publicUrl,
    image: tank.image,
    imageAlt: tankImageAlt(tank),
    body,
    scripts: [
      `<script defer src="/assets/js/tanks-data.js?v=${assetVersions.tanks}"></script>`,
      `<script defer src="/assets/js/app.js?v=${assetVersions.app}"></script>`,
    ],
    jsonLd: [
      jsonLdScript('tank-product-jsonld', product),
      jsonLdScript('tank-breadcrumb-jsonld', buildBreadcrumbJsonLd([
        { name: 'Home', url: `${siteUrl}/` },
        { name: 'Browse Tanks', url: `${siteUrl}/tanks` },
        { name: tank.name, url: publicUrl },
      ])),
    ],
  });

  writeFile(path.join(root, 'tanks', tank.slug, 'index.html'), html);
}

function writeSetPage(set, data) {
  const publicUrl = `${siteUrl}/sets/${set.slug}/`;
  const availableScales = set.availableScales || Object.keys(set.prices || {});
  const prices = setPrices(set, data.setFinishes);
  const contentsHtml = renderSetStaticContents(set);
  const description = setProductDescription(set);
  const title = setMetaTitle(set);
  const metaDescription = setMetaDescription(set);
  const inDevelopment = isSetInDevelopment(set);
  const hasEtsyListing = Boolean(set.etsyUrl);
  const offer = inDevelopment ? null : aggregateOffer(prices, set.etsyUrl || publicUrl);
  const priceLabel = getSetStaticPriceLabel(set, prices);
  const bestForHtml = set.bestFor
    ? `          <li><strong>Best for</strong><br>${escapeHtml(set.bestFor)}</li>\n`
    : '';
  const setNotesHtml = set.description || set.scaleNote ? `    <section class="grid-2">
${set.description ? `      <div class="card info-card">
        <div class="kicker">${escapeHtml(set.overviewKicker || 'Set overview')}</div>
        <h3>${escapeHtml(set.overviewHeading || 'What this set is for')}</h3>
        <p class="muted">${escapeHtml(set.description)}</p>
        ${set.counterCoverage ? `<p class="muted"><strong>Counter coverage:</strong> ${escapeHtml(set.counterCoverage)}</p>` : ''}
        ${set.editionCompatibility ? `<p class="muted"><strong>Edition compatibility:</strong> ${escapeHtml(set.editionCompatibility)}</p>` : ''}
        ${set.gameUrl ? `<a class="btn" href="${escapeHtml(set.gameUrl)}" target="_blank" rel="noopener">Get ${escapeHtml(set.gameTitle || 'the game')} separately</a>` : ''}
      </div>
` : ''}${set.scaleNote ? `      <div class="card info-card">
        <div class="kicker">Scale note</div>
        <h3>${escapeHtml(set.scaleHeading || 'Choosing a size')}</h3>
        <p class="muted">${escapeHtml(set.scaleNote)}</p>
      </div>
` : ''}    </section>
` : '';
  const includedVehicleLinksHtml = renderSetStaticIncludedVehicleLinks(set, data.tanks);
  const videosHtml = renderSetStaticVideos(set);
  const guideLinksHtml = renderSetStaticGuideLinks(set);
  const extraSetSections = [setNotesHtml, videosHtml, includedVehicleLinksHtml, guideLinksHtml]
    .filter(Boolean)
    .map(section => section.trimEnd())
    .join('\n');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: set.name,
    description,
    image: imageObject(set.image, setImageAlt(set)),
    brand: { '@type': 'Brand', name: 'MiniTankForge' },
    sku: set.slug,
    category: `${set.nation} ${set.era} ${set.category}`,
    material: 'ABS-like resin',
    url: publicUrl,
    ...(offer ? { offers: offer } : {}),
  };

  const body = `
  <main class="container" data-set-detail data-slug="${escapeHtml(set.slug)}" data-detail-url="${publicUrl}">
    <section class="hero-small">
      <div class="eyebrow">${escapeHtml(set.category)}</div>
      <h1 class="page-title">${escapeHtml(set.name)}</h1>
      <p class="lead">${escapeHtml(getSetIntro(set, availableScales))}</p>
      <p class="muted">${escapeHtml(set.note)}</p>
      ${inDevelopment ? `<div class="notice is-pending">${escapeHtml(getSetAvailabilityNote(set))}</div>` : ''}
      <a class="detail-back-link" href="/sets">Back to all sets</a>
    </section>
    <section class="split set-detail-top">
      <div class="set-media-stack">
        <div class="product-image product-image-large">
          <img src="${escapeHtml(rootRelativeUrl(set.image))}" width="1200" height="900" alt="${escapeHtml(setImageAlt(set))}" loading="eager" fetchpriority="high" decoding="async">
        </div>
      </div>
      <div class="detail-panel card">
        <div class="kicker">Set options</div>
        <h2 style="margin-top:6px">Review configuration</h2>
        <ul class="spec-list">
          <li><strong>Available scales</strong><br>${escapeHtml(availableScales.join(', '))}</li>
          <li><strong>Finish options</strong><br>${escapeHtml(data.setFinishes.join(', '))}</li>
          <li><strong>${inDevelopment ? 'Status' : 'Price range'}</strong><br>${escapeHtml(priceLabel)}</li>
          <li><strong>Nation / era</strong><br>${escapeHtml(set.nation)} / ${escapeHtml(set.era)}</li>
          ${set.compatibility ? `<li><strong>Compatibility</strong><br>${escapeHtml(set.compatibility)}</li>` : ''}
${bestForHtml}          <li><strong>Material</strong><br>Custom tougher ABS-like resin</li>
          <li><strong>Assembly</strong><br>Fully assembled; vehicle turrets are fixed</li>
          <li><strong>Preparation</strong><br>Supports removed, washed, and fully cured</li>
          <li><strong>Finish</strong><br>Unpainted or a colored primer base coat</li>
        </ul>
        <div class="page-actions">
          ${inDevelopment
            ? '<a class="btn btn-primary" href="/tank-requests">Ask about this set</a>'
            : hasEtsyListing
              ? `<a class="btn btn-etsy" href="${escapeHtml(set.etsyUrl)}" target="_blank" rel="noopener">Open on Etsy</a>`
              : '<a class="btn btn-primary" href="/tank-requests">Request this set</a>'
          }
        </div>
        ${inDevelopment ? '<p class="helper">This preview is here so players can see the planned contents while the pack is still being worked on.</p>' : ''}
      </div>
    </section>
    <section class="grid-2">
      <div>
        <h2>Included in this set</h2>
${contentsHtml}
      </div>
      <div>
        <h2>Buying note</h2>
        <p class="muted">${inDevelopment ? 'This set is still in construction and is not listed for normal checkout yet. You can contact MiniTankForge if you want to ask about progress or suggest adjustments.' : hasEtsyListing ? 'This site is for browsing. You can contact MiniTankForge with your request or continue to Etsy for marketplace checkout.' : 'This set is currently available by direct request. Choose the pack contents and finish above, then send those selections to MiniTankForge.'}</p>
      </div>
    </section>${extraSetSections ? `\n${extraSetSections}` : ''}
  </main>`;

  const html = pageShell({
    title,
    description: metaDescription,
    canonical: publicUrl,
    image: set.image,
    imageAlt: setImageAlt(set),
    body,
    scripts: [
      `<script defer src="/assets/js/tanks-data.js?v=${assetVersions.tanks}"></script>`,
      `<script defer src="/assets/js/sets-data.js?v=${assetVersions.sets}"></script>`,
      `<script defer src="/assets/js/app.js?v=${assetVersions.app}"></script>`,
    ],
    jsonLd: [
      jsonLdScript('set-product-jsonld', product),
      jsonLdScript('set-breadcrumb-jsonld', buildBreadcrumbJsonLd([
        { name: 'Home', url: `${siteUrl}/` },
        { name: 'Browse Sets', url: `${siteUrl}/sets` },
        { name: set.name, url: publicUrl },
      ])),
    ],
  });

  writeFile(path.join(root, 'sets', set.slug, 'index.html'), html);
}

function sitemapUrl(loc) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
}

function replaceSitemapUrl(sitemap, oldLoc, newLoc) {
  const oldPattern = new RegExp(`  <url>\\r?\\n    <loc>${oldLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\r?\\n    <lastmod>[^<]+</lastmod>\\r?\\n  </url>`);

  if (sitemap.includes(`<loc>${oldLoc}</loc>`)) {
    return sitemap.replace(oldPattern, sitemapUrl(newLoc));
  }

  if (!sitemap.includes(`<loc>${newLoc}</loc>`)) {
    return sitemap.replace('</urlset>', `${sitemapUrl(newLoc)}\n</urlset>`);
  }

  return sitemap;
}

function updateSitemap(tanks, sets) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');

  tanks.forEach(tank => {
    sitemap = replaceSitemapUrl(
      sitemap,
      `${siteUrl}/tank.html?slug=${tank.slug}`,
      `${siteUrl}/tanks/${tank.slug}/`
    );
  });

  sets.forEach(set => {
    sitemap = replaceSitemapUrl(
      sitemap,
      `${siteUrl}/set.html?slug=${set.slug}`,
      `${siteUrl}/sets/${set.slug}/`
    );
  });

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

function main() {
  const data = readData();
  const args = process.argv.slice(2);
  const catalogsOnly = args.includes('--catalogs-only');
  const linksOnly = args.includes('--links-only');
  const requestedSlugs = new Set(args.filter(arg => !['--catalogs-only', '--links-only'].includes(arg)));

  if (linksOnly) {
    const normalized = normalizeInternalHtmlLinks();
    const faviconFiles = ensureFaviconLinks();
    const assetVersionFiles = normalizeAssetVersions();
    console.log(`Normalized ${normalized.links} internal links across ${normalized.files} HTML files.`);
    console.log(`Added favicon markup to ${faviconFiles} HTML files.`);
    console.log(`Normalized asset versions across ${assetVersionFiles} HTML files.`);
    return;
  }

  if (catalogsOnly) {
    const generated = writeCatalogPages(data);
    normalizeAssetVersions();
    console.log(`Generated catalog markup for ${generated.tanks} tanks and ${generated.sets} sets.`);
    return;
  }

  const isRequested = item => requestedSlugs.size === 0 || requestedSlugs.has(item.slug);
  const tanks = data.tanks.filter(isVisible).filter(isRequested);
  const sets = data.sets.filter(isVisible).filter(isRequested);

  tanks.forEach(tank => writeTankPage(tank, data));
  sets.forEach(set => writeSetPage(set, data));

  if (requestedSlugs.size === 0) {
    writeCatalogPages(data);
    normalizeInternalHtmlLinks();
    ensureFaviconLinks();
    normalizeAssetVersions();
    updateSitemap(tanks, sets);
  }

  console.log(`Generated ${tanks.length} tank pages and ${sets.length} set pages.`);
}

main();
