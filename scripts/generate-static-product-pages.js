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
      <a class="brand" href="index.html">MINITANKFORGE</a>
      <div class="nav-stack">
        <nav class="nav nav-row">
          <a href="tanks.html">Browse Tanks</a><a href="sets.html">Browse Sets</a><a href="gallery.html">Gallery</a><a href="finish-guide.html">Finish Guide</a><a href="tank-requests.html">Requests</a>
        </nav>
        <nav class="nav nav-row">
          <a href="how-this-works.html">How Buying Works</a><a href="scale-comparison.html">Scale Comparison</a><a href="reviews.html">Reviews</a><a href="faq.html">FAQ</a><a href="about.html">About</a>
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
        <a href="tanks.html">Browse Tanks</a><a href="sets.html">Browse Sets</a><a href="how-this-works.html">How Buying Works</a><a href="gallery.html">Gallery</a><a href="finish-guide.html">Finish Guide</a><a href="scale-comparison.html">Scale Comparison</a><a href="tank-requests.html">Requests</a><a href="faq.html">FAQ</a><a href="about.html">About</a>
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
  <base href="../../" />
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
  <link href="assets/css/styles.css?v=18" rel="stylesheet" />
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
  fs.writeFileSync(file, content, 'utf8');
}

function isVisible(item) {
  return item?.disabled !== true;
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

function writeTankPage(tank, data) {
  const publicUrl = `${siteUrl}/tanks/${tank.slug}/`;
  const availableScales = tank.availableScales || data.scales;
  const prices = tankPrices(tank, data.scales, data.finishes);
  const metaDescription = `Browse the ${tank.name} 3D printed miniature tank with ${availableScales.join(', ')} scale options. Request directly and pay by PayPal after confirmation, or continue to Etsy.`;
  const productDescription = tank.description || metaDescription;
  const title = `${tank.name} 3D Printed Miniature Tank | MiniTankForge`;
  const offer = aggregateOffer(prices, tank.etsyUrl || publicUrl);

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
      <a class="detail-back-link" href="tanks.html">Back to all tanks</a>
    </section>
    <section class="split">
      <div class="tank-media-stack">
        <div class="product-image product-image-large">
          <img src="${escapeHtml(tank.image)}" width="1600" height="900" alt="${escapeHtml(tankImageAlt(tank))}" loading="eager" fetchpriority="high" decoding="async">
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
  </main>`;

  const html = pageShell({
    title,
    description: metaDescription,
    canonical: publicUrl,
    image: tank.image,
    imageAlt: tankImageAlt(tank),
    body,
    scripts: [
      '<script defer src="assets/js/tanks-data.js?v=17"></script>',
      '<script defer src="assets/js/app.js?v=34"></script>',
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
  const description = `Browse the ${set.name}, a ${set.category.toLowerCase()} for ${set.nation} ${set.era} miniature games. Review contents, finish choices, and direct request or Etsy options.`;
  const title = `${set.name} 3D Printed Miniature Tank Set | MiniTankForge`;
  const offer = aggregateOffer(prices, set.etsyUrl || publicUrl);

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
      <a class="detail-back-link" href="sets.html">Back to all sets</a>
    </section>
    <section class="split set-detail-top">
      <div class="set-media-stack">
        <div class="product-image product-image-large">
          <img src="${escapeHtml(set.image)}" width="1200" height="900" alt="${escapeHtml(setImageAlt(set))}" loading="eager" fetchpriority="high" decoding="async">
        </div>
      </div>
      <div class="detail-panel card">
        <div class="kicker">Set options</div>
        <h2 style="margin-top:6px">Review configuration</h2>
        <ul class="spec-list">
          <li><strong>Available scales</strong><br>${escapeHtml(availableScales.join(', '))}</li>
          <li><strong>Finish options</strong><br>${escapeHtml(data.setFinishes.join(', '))}</li>
          <li><strong>Price range</strong><br>${escapeHtml(priceSummary(prices))}</li>
          <li><strong>Nation / era</strong><br>${escapeHtml(set.nation)} / ${escapeHtml(set.era)}</li>
        </ul>
        <div class="page-actions">
          <a class="btn btn-etsy" href="${escapeHtml(set.etsyUrl)}" target="_blank" rel="noopener">Open on Etsy</a>
        </div>
      </div>
    </section>
    <section class="grid-2">
      <div>
        <h2>Included in this set</h2>
${contentsHtml}
      </div>
      <div>
        <h2>Buying note</h2>
        <p class="muted">This site is for browsing. You can contact MiniTankForge with your request or continue to Etsy for marketplace checkout.</p>
      </div>
    </section>
  </main>`;

  const html = pageShell({
    title,
    description,
    canonical: publicUrl,
    image: set.image,
    imageAlt: setImageAlt(set),
    body,
    scripts: [
      '<script defer src="assets/js/tanks-data.js?v=17"></script>',
      '<script defer src="assets/js/sets-data.js?v=18"></script>',
      '<script defer src="assets/js/app.js?v=34"></script>',
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
