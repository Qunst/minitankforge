const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://minitankforge.com';
const today = new Date().toISOString().slice(0, 10);

function readData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);

  for (const file of ['assets/js/tanks-data.js', 'assets/js/sets-data.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(source, sandbox, { filename: file });
  }

  return {
    tanks: sandbox.window.TANKS || [],
    sets: sandbox.window.SETS || [],
    scales: sandbox.window.MTF_SCALES || ['1:160', '1:180', '1:200', '1:250', '1:285'],
    finishes: sandbox.window.MTF_FINISHES || ['Base coat', 'Unpainted'],
    setFinishes: sandbox.window.MTF_SET_FINISHES || ['Base coat', 'Unpainted'],
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
  if (raw === 'index.html') return '/index.html';

  const match = raw.match(/^([^?#]*)(.*)$/);
  const pathPart = (match?.[1] || raw).replace(/^\.?\//, '');
  const suffix = match?.[2] || '';

  return `/${pathPart}${suffix}`;
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
      <a class="brand" href="/index.html">MINITANKFORGE</a>
      <div class="nav-stack">
        <nav class="nav nav-row">
          <a href="/tanks.html">Browse Tanks</a><a href="/sets.html">Browse Sets</a><a href="/gallery.html">Gallery</a><a href="/finish-guide.html">Finish Guide</a><a href="/tank-requests.html">Requests</a>
        </nav>
        <nav class="nav nav-row">
          <a href="/how-this-works.html">How Buying Works</a><a href="/scale-comparison.html">Scale Comparison</a><a href="/reviews.html">Reviews</a><a href="/faq.html">FAQ</a><a href="/about.html">About</a>
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
        <a href="/tanks.html">Browse Tanks</a><a href="/sets.html">Browse Sets</a><a href="/how-this-works.html">How Buying Works</a><a href="/gallery.html">Gallery</a><a href="/finish-guide.html">Finish Guide</a><a href="/scale-comparison.html">Scale Comparison</a><a href="/tank-requests.html">Requests</a><a href="/faq.html">FAQ</a><a href="/about.html">About</a>
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
  <link href="/assets/css/styles.css?v=18" rel="stylesheet" />
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

function isVisible(item) {
  return item?.disabled !== true;
}

function getDisplayName(name) {
  return String(name || '').split(' (')[0].trim();
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
    title: 'Panzer 38(t) Hetzer-Family Light Tank Miniature | MiniTankForge',
    description: 'Browse the Panzer 38(t) 3D printed Czech-built German light tank miniature, useful for early-war forces and Hetzer chassis-family collections.',
  },
};

function getTankMetaTitle(tank) {
  if (tankSeoOverrides[tank.slug]?.title) return tankSeoOverrides[tank.slug].title;
  return `${getDisplayName(tank.name)} 3D Printed ${getTankSnippetType(tank)} | MiniTankForge`;
}

function getTankMetaDescription(tank, availableScales) {
  if (tankSeoOverrides[tank.slug]?.description) return tankSeoOverrides[tank.slug].description;
  return `Browse the ${getDisplayName(tank.name)} 3D printed ${tank.era} ${getTankSnippetType(tank).toLowerCase()} in ${availableScales.join(', ')}. Choose finish, request direct, or use Etsy.`;
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
  'e 100': 'e-100',
  'e 25': 'e-25',
  'e 50': 'e-50',
  'e 75': 'e-75',
  'ferdinand': 'ferdinand',
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
  'stug iv': 'stug-iv',
  'su 76': 'su-76',
  'su 85': 'su-85',
  'su 100': 'su-100',
  'su 122': 'su-122',
  't 28': 't-28',
  't 34': 't-34',
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

  if (tank.nation === 'Germany') add('German WW2 tank miniatures', 'german-ww2-tank-miniatures.html', 'Browse nearby German armor and set paths.');
  if (tank.nation === 'USSR') add('Soviet WW2 tank miniatures', 'soviet-ww2-tank-miniatures.html', 'Browse nearby Soviet armor and set paths.');
  if (tank.nation === 'USA') add('American WW2 tank miniatures', 'american-ww2-tank-miniatures.html', 'Browse US armor, Shermans, Hellcats, and game packs.');
  if (/sherman/i.test(tank.name)) add('Sherman tank miniatures', 'sherman-tank-miniatures.html', 'Compare Sherman-focused tanks and game packs.');
  if (/tank destroyer|assault gun/i.test(tank.type)) add('WW2 tank destroyer miniatures', 'ww2-tank-destroyer-miniatures.html', 'Compare anti-armor and assault-gun vehicles.');
  if (/heavy tank|super heavy tank/i.test(tank.type)) add('WW2 heavy tank miniatures', 'ww2-heavy-tank-miniatures.html', 'Compare heavy and super-heavy vehicle choices.');
  add('Tabletop tank miniatures', 'tabletop-tank-miniatures.html', 'Browse scale, set, and vehicle paths for tabletop play.');

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
    return `${set.name.replace(/\s+Pack$/i, '')} Miniature Accessory Pack | MiniTankForge`;
  }

  return `${set.name} 3D Printed Tank Miniatures | MiniTankForge`;
}

function setMetaDescription(set) {
  if (set.metaDescription) return set.metaDescription;

  if (set.filterGroup === 'Game') {
    const scale = (Array.isArray(set.availableScales) && set.availableScales[0]) || 'fixed scale';
    return `Browse the ${set.name} unofficial ${scale} accessory pack for Mike Lambo game play. Review contents, finishes, Etsy, and direct request options.`;
  }

  return `Browse the ${set.name} 3D printed ${set.era} tank miniature set with listed contents, scale choices, finishes, Etsy, and direct request options.`;
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

function writeTankPage(tank, data) {
  const publicUrl = `${siteUrl}/tanks/${tank.slug}/`;
  const availableScales = tank.availableScales || data.scales;
  const prices = tankPrices(tank, data.scales, data.finishes);
  const metaDescription = getTankMetaDescription(tank, availableScales);
  const productDescription = tank.description || metaDescription;
  const title = getTankMetaTitle(tank);
  const offer = aggregateOffer(prices, tank.etsyUrl || publicUrl);
  const internalLinksHtml = renderTankStaticInternalLinks(tank, data);

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tank.name,
    description: productDescription,
    image: imageObject(tank.image, tankImageAlt(tank)),
    brand: { '@type': 'Brand', name: 'MiniTankForge' },
    sku: tank.slug,
    category: `${tank.nation} ${tank.era} ${tank.type}`,
    url: publicUrl,
    ...(offer ? { offers: offer } : {}),
  };

  const body = `
  <main class="container" data-tank-detail data-slug="${escapeHtml(tank.slug)}" data-detail-url="${publicUrl}">
    <section class="hero-small">
      <div class="eyebrow">Single tank page</div>
      <h1 class="page-title">${escapeHtml(tank.name)}</h1>
      <p class="lead">Review scale, finish, and details before sending a direct request or continuing to Etsy.</p>
      <a class="detail-back-link" href="/tanks.html">Back to all tanks</a>
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
        </ul>
        <div class="page-actions">
          <a class="btn btn-etsy" href="${escapeHtml(tank.etsyUrl)}" target="_blank" rel="noopener">Open on Etsy</a>
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
      '<script defer src="/assets/js/tanks-data.js?v=19"></script>',
      '<script defer src="/assets/js/app.js?v=36"></script>',
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
  const guideLinksHtml = renderSetStaticGuideLinks(set);
  const extraSetSections = [setNotesHtml, includedVehicleLinksHtml, guideLinksHtml]
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
    url: publicUrl,
    ...(offer ? { offers: offer } : {}),
  };

  const body = `
  <main class="container" data-set-detail data-slug="${escapeHtml(set.slug)}" data-detail-url="${publicUrl}">
    <section class="hero-small">
      <div class="eyebrow">${escapeHtml(set.category)}</div>
      <h1 class="page-title">${escapeHtml(set.name)}</h1>
      <p class="lead">${escapeHtml(set.note)}</p>
      ${inDevelopment ? `<div class="notice is-pending">${escapeHtml(getSetAvailabilityNote(set))}</div>` : ''}
      <a class="detail-back-link" href="/sets.html">Back to all sets</a>
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
${bestForHtml}        </ul>
        <div class="page-actions">
          ${inDevelopment
            ? '<a class="btn btn-primary" href="/tank-requests.html">Ask about this set</a>'
            : `<a class="btn btn-etsy" href="${escapeHtml(set.etsyUrl)}" target="_blank" rel="noopener">Open on Etsy</a>`
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
        <p class="muted">${inDevelopment ? 'This set is still in construction and is not listed for normal checkout yet. You can contact MiniTankForge if you want to ask about progress or suggest adjustments.' : 'This site is for browsing. You can contact MiniTankForge with your request or continue to Etsy for marketplace checkout.'}</p>
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
      '<script defer src="/assets/js/tanks-data.js?v=19"></script>',
      '<script defer src="/assets/js/sets-data.js?v=18"></script>',
      '<script defer src="/assets/js/app.js?v=36"></script>',
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
  const tanks = data.tanks.filter(isVisible);
  const sets = data.sets.filter(isVisible);

  tanks.forEach(tank => writeTankPage(tank, data));
  sets.forEach(set => writeSetPage(set, data));

  updateSitemap(tanks, sets);

  console.log(`Generated ${tanks.length} tank pages and ${sets.length} set pages.`);
}

main();
