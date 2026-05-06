
const DEFAULT_SCALE = '1:180';
const DEFAULT_FINISH = 'Base coat';
const DEFAULT_SET_IMAGE = 'assets/img/sets/genset.jpg';
// Homepage hero image: 'spring', 'summer', 'winter', or 'random'.
const HOME_HERO_VARIANT = 'summer';
const validScales = Array.isArray(window.MTF_SCALES) ? window.MTF_SCALES : ['1:180', '1:200', '1:250', '1:285'];
const validFinishes = Array.isArray(window.MTF_FINISHES) ? window.MTF_FINISHES : ['Base coat', 'Unpainted'];
const validTankPacks = [
  { quantity: 1, label: '1 tank', multiplier: 1 },
  { quantity: 5, label: '5 tanks', multiplier: 0.8 },
  { quantity: 10, label: '10 tanks', multiplier: 0.67 },
];
const tankData = Array.isArray(window.TANKS) ? window.TANKS : [];

const scalePrices = window.MTF_SCALE_PRICES || {};
const finishSurcharges = window.MTF_FINISH_SURCHARGES || {};
const SITE_URL = 'https://minitankforge.com';

function getScalePrice(scale, tank = null) {
  return Number((tank?.scalePrices || scalePrices)[scale] ?? 0);
}

function getFinishSurcharge(finish, tank = null) {
  return Number((tank?.finishSurcharges || finishSurcharges)[finish] ?? 0);
}

function getTankPrice(scale, finish, tank = null) {
  return getScalePrice(scale, tank) + getFinishSurcharge(finish, tank);
}

function getTankPackByQuantity(quantity) {
  return validTankPacks.find(pack => pack.quantity === Number(quantity)) || validTankPacks[0];
}

function roundNicePackPrice(value) {
  return Math.round(value * 2) / 2;
}

function getTankPackPrice(scale, finish, quantity = 1, tank = null) {
  const pack = getTankPackByQuantity(quantity);
  const total = getTankPrice(scale, finish, tank) * pack.quantity * pack.multiplier;
  return pack.quantity === 1 ? total : roundNicePackPrice(total);
}

function absoluteUrl(path) {
  return new URL(path, `${SITE_URL}/`).href;
}

function buildImageObject(src, caption) {
  if (!src) return null;

  return {
    '@type': 'ImageObject',
    url: absoluteUrl(src),
    caption,
  };
}

function setMetaContent(selector, content) {
  const element = document.querySelector(selector);
  if (element && content) {
    element.setAttribute('content', content);
  }
}

function setCanonicalUrl(url) {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && url) {
    canonical.setAttribute('href', url);
  }
}

function setJsonLd(id, data) {
  if (!data) return;

  let script = document.getElementById(id);

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.append(script);
  }

  script.textContent = JSON.stringify(data);
}

function updatePageMeta({ title, description, url, image }) {
  const imageUrl = absoluteUrl(image || 'assets/img/hero.jpg');

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[property="og:image"]', imageUrl);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', imageUrl);
  setCanonicalUrl(url);
}

function initHomeHeroImage() {
  const image = document.querySelector('[data-home-hero-image]');
  if (!image) return;

  const variants = {
    spring: 'assets/img/hero-spring.jpg',
    summer: 'assets/img/hero-summer.jpg',
    winter: 'assets/img/hero-winter.jpg',
  };
  const configured = String(HOME_HERO_VARIANT || 'summer').toLowerCase();
  const keys = Object.keys(variants);
  const selected = configured === 'random'
    ? keys[Math.floor(Math.random() * keys.length)]
    : configured;
  const src = variants[selected] || variants.summer;
  const versionedSrc = `${src}?v=1`;
  const absoluteSrc = absoluteUrl(versionedSrc);

  image.src = versionedSrc;
  setMetaContent('meta[property="og:image"]', absoluteSrc);
  setMetaContent('meta[name="twitter:image"]', absoluteSrc);

  const preload = document.querySelector('link[rel="preload"][as="image"][data-home-hero-preload]');
  if (preload) {
    preload.setAttribute('href', versionedSrc);
  }
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

function formatPrice(value) {
  return `€${value.toFixed(2)}`;
}

function getTankPriceRange(tank) {
  const scales = getAvailableScales(tank);
  const prices = [];

  for (const scale of scales) {
    for (const finish of validFinishes) {
      prices.push(getTankPrice(scale, finish, tank));
    }
  }

  if (!prices.length) return '';

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
}


function buildAggregateOfferJsonLd(prices, url) {
  const validPrices = prices
    .map(Number)
    .filter(value => Number.isFinite(value) && value > 0);

  if (!validPrices.length) return null;

  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: Math.min(...validPrices).toFixed(2),
    highPrice: Math.max(...validPrices).toFixed(2),
    offerCount: validPrices.length,
    url,
    seller: {
      '@type': 'Organization',
      name: 'MiniTankForge',
      url: SITE_URL,
    },
  };
}

function normalizeScale(value) {
  return typeof value === 'string' ? value.replace('-', ':') : value;
}

function scaleForUrl(scale) {
  return scale.replace(':', '-');
}

function withQueryParams(url, params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) return url;

  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

function getTankDetailUrl(tankOrSlug, params = {}) {
  const slug = typeof tankOrSlug === 'string' ? tankOrSlug : tankOrSlug?.slug;
  if (!slug) return 'tanks.html';

  const baseUrl = `tanks/${encodeURIComponent(slug)}/`;

  return withQueryParams(baseUrl, params);
}

function getSetDetailUrl(setOrSlug, params = {}) {
  const slug = typeof setOrSlug === 'string' ? setOrSlug : setOrSlug?.slug;
  if (!slug) return 'sets.html';

  const baseUrl = `sets/${encodeURIComponent(slug)}/`;

  return withQueryParams(baseUrl, params);
}

function getSelectedScale() {
  const url = new URL(window.location.href);
  const q = normalizeScale(url.searchParams.get('scale'));
  if (q && validScales.includes(q)) return q;
  const stored = localStorage.getItem('mtf-scale');
  return validScales.includes(stored) ? stored : DEFAULT_SCALE;
}

function getSelectedFinish() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get('finish');
  if (q && validFinishes.includes(q)) return q;
  const stored = localStorage.getItem('mtf-finish');
  return validFinishes.includes(stored) ? stored : DEFAULT_FINISH;
}

function getSelectedTankPack() {
  const url = new URL(window.location.href);
  const q = Number(url.searchParams.get('pack'));
  if (getTankPackByQuantity(q).quantity === q) return q;
  const stored = Number(localStorage.getItem('mtf-tank-pack'));
  return getTankPackByQuantity(stored).quantity;
}

function getTankBySlug(slug) {
  return tankData.find(t => t.slug === slug && !isDisabled(t));
}

function getDisplayName(name) {
  return String(name || '').split(' (')[0].trim();
}

function getTankMetaDescription(tank, availableScales = getAvailableScales(tank)) {
  return `Browse the ${tank.name} 3D printed miniature tank with ${availableScales.join(', ')} scale options. Request directly and pay by PayPal after confirmation, or continue to Etsy.`;
}

function getTankProductDescription(tank, availableScales = getAvailableScales(tank)) {
  return tank.description || getTankMetaDescription(tank, availableScales);
}

function getTankImageAlt(tank, detail = 'base coat side detail') {
  const parts = [
    tank.name,
    tank.nation,
    tank.era,
    tank.type,
    detail,
    '3D printed miniature model',
  ].filter(Boolean);

  return parts.join(' ');
}

function getSetImageAlt(set, detail = 'base coat set overview') {
  const parts = [
    set.name,
    set.nation,
    set.era,
    set.category,
    detail,
    '3D printed miniature set',
  ].filter(Boolean);

  return parts.join(' ');
}

function isDisabled(item) {
  return item?.disabled === true;
}

function getVisibleTanks() {
  return tankData.filter(tank => !isDisabled(tank));
}

function getVisibleSets() {
  return setData.filter(set => !isDisabled(set));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeTankLookup(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildTankLookupMap() {
  const lookup = new Map();
  const extraAliasesBySlug = {
    'sherman-m4a3': ['Sherman', 'M4A3 Sherman', 'Medium Tank M4A3 Sherman'],
  };

  getVisibleTanks().forEach(tank => {
    const shortName = tank.name.split(' (')[0].trim();
    const aliases = new Set([tank.name, shortName]);
    (extraAliasesBySlug[tank.slug] || []).forEach(alias => aliases.add(alias));

    if (/^[a-z0-9-]+\s+.+/i.test(shortName) && /\d/.test(shortName.split(' ')[0])) {
      aliases.add(shortName.replace(/^[a-z0-9-]+\s+/i, '').trim());
    }

    aliases.forEach(alias => {
      const key = normalizeTankLookup(alias);
      if (key && !lookup.has(key)) {
        lookup.set(key, tank);
      }
    });
  });

  return lookup;
}

const tankLookupMap = buildTankLookupMap();

function getLinkedTankFromSetItem(item) {
  const raw = String(item || '').trim();
  if (!raw) return null;

  const withoutQuantity = raw.replace(/^\s*\d+\s*[x×]\s*/i, '').trim();
  const normalized = normalizeTankLookup(withoutQuantity);
  return tankLookupMap.get(normalized) || null;
}

function renderSetContents(contents, selectedScale = getSelectedScale()) {
  return `
    <ul class="set-contents-list compact">
      ${contents.map(item => {
        const safeItem = escapeHtml(item);
        const tank = getLinkedTankFromSetItem(item);

        if (!tank) {
          return `<li>${safeItem}</li>`;
        }

        const link = getTankDetailUrl(tank, { scale: scaleForUrl(selectedScale) });
        return `<li><a class="set-content-link" href="${link}">${safeItem}</a></li>`;
      }).join('')}
    </ul>
  `;
}

function getAvailableScales(tank) {
  return Array.isArray(tank?.availableScales) && tank.availableScales.length ? tank.availableScales : validScales;
}

function renderScaleChoices(container, selectedScale, availableScales) {
  if (!container) return;
  container.innerHTML = availableScales.map(scale => `
    <button class="chip ${scale === selectedScale ? 'active' : ''}" data-scale-chip="${scale}" aria-pressed="${scale === selectedScale}">${scale}</button>
  `).join('');
}

function placeholderClass(style) {
  switch (style) {
    case 'dark-large': return 'product-image dark tank-placeholder';
    case 'light-medium': return 'product-image tank-placeholder';
    case 'dark-medium': return 'product-image dark tank-placeholder';
    case 'light-small': return 'product-image tank-placeholder';
    case 'dark-small': return 'product-image dark tank-placeholder';
    default: return 'product-image tank-placeholder';
  }
}

function tankSizeClass(style) {
  switch (style) {
    case 'light-medium':
    case 'dark-medium': return 'tank-md';
    case 'light-small':
    case 'dark-small': return 'tank-sm';
    default: return 'tank-lg';
  }
}

function renderTankVisual(tank, large = false) {
  const image = large ? tank.image : getTankCardImage(tank);

  if (image) {
    const priorityAttrs = large ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<div class="product-image ${large ? 'product-image-large' : ''}"><img src="${image}" width="1600" height="900" alt="${getTankImageAlt(tank, large ? 'base coat side detail' : 'product card photo')}" ${priorityAttrs} decoding="async"></div>`;
  }
  const size = large ? 'tank-lg' : tankSizeClass(tank.placeholderStyle);
  const extraClass = placeholderClass(tank.placeholderStyle);
  return `<div class="${extraClass} ${large ? 'product-image-large' : ''}"><div class="tank ${size}"></div></div>`;
}

const tankMiniGalleryPlaceholderImage = 'assets/img/tanks/gentank.jpg';
const tankMiniGalleryPlaceholders = Array.from({ length: 6 }, (_, index) => ({
  src: tankMiniGalleryPlaceholderImage,
  label: `Placeholder photo ${index + 1}`,
}));

const tankDetailPhotoKeys = {
  'a-32': 'a32',
  'e-100': 'e100',
  'e-25': 'e25',
  'e-50': 'e50',
  'e-75': 'e75',
  'ferdinand': 'ferdinand',
  'hetzer': 'hetzer',
  'hummel': 'hummel',
  'is-1': 'is1',
  'is-2': 'is-2',
  'is-3': 'is3',
  'isu-122': 'isu122',
  'isu-152': 'isu152',
  'jagdpanther': 'jagdpanther',
  'jagdpanzer-e100': 'jagdpanzer-e100',
  'jagdpz-iv': 'jgdpz-iv',
  'jagdtiger': 'jagdtiger',
  'kv-2': 'kv2',
  'luchs': 'luchs',
  'm10-wolverine': 'm10-wolverine',
  'm18-hellcat': 'm18-hellcat',
  'm3-half-track': 'm3-half-truck',
  'm3-lee': 'm3-lee',
  'm5a1-stuart': 'm5a1-stuart',
  'm60a1': 'm60a1',
  'm7-priest': 'm7-priest',
  'm8-greyhound': 'm8-greyhound',
  'maus': 'maus',
  'nashorn': 'nashorn',
  'opel-blitz': 'opel-blitz',
  'panther': 'panther',
  'panzer-iii': 'pz-iii',
  'panzer-iv': 'pz-iv',
  'panzer-vii-loewe': 'loewe',
  'panzer-35t': 'pz35t',
  'panzer-38t': 'pz38t',
  'pershing': 'pershing',
  'sd-kfz-234': 'sdkfz-234',
  'sherman-firefly': 'sherman-firefly',
  'sherman-m4a3': 'sherman',
  'stug-iv': 'stug',
  'su-76': 'su76',
  'su-85': 'su85',
  'su-100': 'su100',
  'su-122': 'su122',
  't-28': 't28',
  't-34': 't34',
  't-34-85': 't34-85',
  't-34-minesweeper': 't34-minesweeper',
  't-70': 't70',
  'tiger-i': 'tiger',
  'tiger-ii': 'tiger-ii',
  'type-95-ha-go': 'type95',
  'type-97-chi-ha': 'type97',
  'wespe': 'wespe',
};

function getTankCardImage(tank) {
  const photoKey = tankDetailPhotoKeys[tank.slug];
  return photoKey ? `assets/img/tanks/${photoKey}-base-coat-side-detail.jpg` : tank.image;
}

function getTankDetailGalleryImages(tank) {
  const photoKey = tankDetailPhotoKeys[tank.slug];
  if (!photoKey) return tankMiniGalleryPlaceholders;

  return [
    ['base-coat', 'side', 'Painted side view'],
    ['base-coat', 'quarter', 'Painted quarter view'],
    ['base-coat', 'front', 'Painted front view'],
    ['unpainted', 'side', 'Unpainted side view'],
    ['unpainted', 'quarter', 'Unpainted quarter view'],
    ['unpainted', 'front', 'Unpainted front view'],
  ].map(([finish, view, label]) => ({
    src: `assets/img/tanks/${photoKey}-${finish}-${view}-detail.jpg`,
    label,
  }));
}

function renderTankDetailGallery(tank) {
  const galleryImages = getTankDetailGalleryImages(tank);
  const mainImage = galleryImages[0]?.src || tank.image || tankMiniGalleryPlaceholderImage;
  const mainLabel = galleryImages[0]?.label || tank.name;

  return `
    <div class="tank-detail-gallery" data-tank-gallery>
      <div class="product-image product-image-large">
        <img src="${mainImage}" width="1600" height="900" alt="${getTankImageAlt(tank, mainLabel)}" loading="eager" fetchpriority="high" decoding="async" data-tank-gallery-main>
      </div>
      <div class="tank-mini-gallery" aria-label="${tank.name} photo thumbnails">
        ${galleryImages.map((image, index) => `
          <button class="tank-mini-gallery-thumb ${index === 0 ? 'is-active' : ''}" type="button" data-tank-gallery-thumb="${image.src}" data-tank-gallery-label="${image.label}" aria-label="Show ${image.label.toLowerCase()}">
            <img src="${image.src}" width="320" height="180" alt="" loading="eager" fetchpriority="high" decoding="sync">
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function preloadTankGalleryImages(gallery) {
  const seen = new Set();
  gallery.querySelectorAll('[data-tank-gallery-thumb]').forEach(button => {
    const src = button.dataset.tankGalleryThumb;
    if (!src || seen.has(src)) return;
    seen.add(src);

    const image = new Image();
    image.fetchPriority = 'high';
    image.decoding = 'sync';
    image.src = src;
    if (typeof image.decode === 'function') {
      image.decode().catch(() => {});
    }
  });
}

const tankFinishGalleryThumbIndexes = {
  'Base coat': 1,
  Unpainted: 4,
};

function selectTankGalleryThumb(gallery, button) {
  const mainImage = gallery.querySelector('[data-tank-gallery-main]');
  const nextImage = button?.dataset.tankGalleryThumb;
  if (!mainImage || !nextImage) return;

  mainImage.src = nextImage;
  mainImage.alt = button.dataset.tankGalleryLabel || mainImage.alt;
  gallery.querySelectorAll('[data-tank-gallery-thumb]').forEach(thumb => thumb.classList.remove('is-active'));
  button.classList.add('is-active');
}

function showTankGalleryFinish(finish) {
  const thumbIndex = tankFinishGalleryThumbIndexes[finish];
  if (typeof thumbIndex !== 'number') return;

  document.querySelectorAll('[data-tank-gallery]').forEach(gallery => {
    const thumbs = gallery.querySelectorAll('[data-tank-gallery-thumb]');
    selectTankGalleryThumb(gallery, thumbs[thumbIndex]);
  });
}

function bindTankDetailGallery(root = document) {
  root.querySelectorAll('[data-tank-gallery]').forEach(gallery => {
    const mainImage = gallery.querySelector('[data-tank-gallery-main]');
    if (!mainImage) return;

    preloadTankGalleryImages(gallery);

    gallery.querySelectorAll('[data-tank-gallery-thumb]').forEach(button => {
      button.addEventListener('click', () => {
        selectTankGalleryThumb(gallery, button);
      });
    });
  });
}

function buildTankCard(tank) {
  const detailUrl = getTankDetailUrl(tank);

  return `
    <article class="card product-card">
      <a href="${detailUrl}" data-scale-link="${detailUrl}" class="product-image-link">
        ${renderTankVisual(tank)}
      </a>
      <div>
        <h3>${tank.name}</h3>
        <div class="product-meta">
          <span class="badge">${tank.nation}</span>
          <span class="badge">${tank.type}</span>
          <span class="badge">${tank.era}</span>
        </div>
        <div class="tank-card-price">${getTankPriceRange(tank)}</div>
        <p class="muted fun-fact">${tank.fact}</p>
      </div>
      <a class="btn btn-primary" data-scale-link="${detailUrl}" href="${detailUrl}">View Tank</a>
    </article>
  `;
}

const setData = Array.isArray(window.SETS) ? window.SETS : [];
const validSetFinishes = Array.isArray(window.MTF_SET_FINISHES) ? window.MTF_SET_FINISHES : validFinishes;
const setBrowseSlugOrder = new Map([
  ['german-basic', 10],
  ['ussr-basic', 11],
  ['us-basic', 12],
  ['german-tanks', 20],
  ['ussr-tanks', 21],
  ['german-tank-destroyers', 30],
  ['ussr-tank-destroyers', 31],
]);

function getSetBySlug(slug) {
  return setData.find(s => s.slug === slug && !isDisabled(s));
}

function getSetBrowseRank(set) {
  if (setBrowseSlugOrder.has(set.slug)) return setBrowseSlugOrder.get(set.slug);
  if (set.filterGroup === 'Game') return 90;
  return 60;
}

function getBrowseOrderedSets() {
  return getVisibleSets()
    .map((set, index) => ({ set, index }))
    .sort((a, b) => getSetBrowseRank(a.set) - getSetBrowseRank(b.set) || a.index - b.index)
    .map(item => item.set);
}

function getAvailableSetScales(set) {
  return Array.isArray(set?.availableScales) && set.availableScales.length ? set.availableScales : validScales;
}

function getAvailableSetOptions(set) {
  return Array.isArray(set?.options) && set.options.length ? set.options : [];
}

function getSetOptionBySlug(set, slug) {
  const options = getAvailableSetOptions(set);
  return options.find(option => option.slug === slug) || options[0] || null;
}

function getSetContents(set, optionSlug = '') {
  const options = getAvailableSetOptions(set);
  if (options.length) {
    const option = getSetOptionBySlug(set, optionSlug);
    return Array.isArray(option?.contents) ? option.contents : [];
  }
  return Array.isArray(set?.contents) ? set.contents : [];
}

function getAvailableSetFinishes(set) {
  const options = getAvailableSetOptions(set);

  if (options.length) {
    const firstOption = options[0];
    const finishes = Object.keys(firstOption?.prices || {});
    return finishes.length ? finishes : validSetFinishes;
  }

  const prices = set?.prices || {};
  const firstScale = Object.keys(prices)[0];
  if (!firstScale) return validSetFinishes;
  return Object.keys(prices[firstScale]);
}

function getSetPrice(set, scale, finish, optionSlug = '') {
  const options = getAvailableSetOptions(set);

  if (options.length) {
    const option = getSetOptionBySlug(set, optionSlug);
    return Number(option?.prices?.[finish] ?? 0);
  }

  return Number(set?.prices?.[scale]?.[finish] ?? 0);
}

function getSetPriceRange(set) {
  const finishes = getAvailableSetFinishes(set);
  const prices = [];
  const options = getAvailableSetOptions(set);

  if (options.length) {
    for (const option of options) {
      for (const finish of finishes) {
        const value = Number(option?.prices?.[finish] ?? 0);
        if (value > 0) prices.push(value);
      }
    }
  } else {
    const scales = getAvailableSetScales(set);

    for (const scale of scales) {
      for (const finish of finishes) {
        const value = getSetPrice(set, scale, finish);
        if (value > 0) prices.push(value);
      }
    }
  }

  if (!prices.length) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

function renderFeaturedTanks() {
  const target = document.querySelector('[data-featured-tanks]');
  if (!target) return;
  const featured = getVisibleTanks()
    .filter(t => t.featured)
    .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
    .slice(0, 3);
  target.innerHTML = featured.map(buildTankCard).join('');
}

function renderBrowseGrid() {
  const target = document.querySelector('[data-tank-grid]');
  if (!target) return;

  const nation = document.querySelector('[data-filter-nation]')?.value || 'All';
  const type = document.querySelector('[data-filter-type]')?.value || 'All';
  const era = document.querySelector('[data-filter-era]')?.value || 'All';

  const filtered = getVisibleTanks().filter(t => {
    return (nation === 'All' || t.nation === nation)
      && (type === 'All' || t.type === type)
      && (era === 'All' || t.era === era);
  });

  target.innerHTML = filtered.map(buildTankCard).join('');
}

function parseSlugList(value) {
  return String(value || '')
    .split(',')
    .map(slug => slug.trim())
    .filter(Boolean);
}

function renderGuideProductCards() {
  document.querySelectorAll('[data-guide-tanks]').forEach(container => {
    const tanks = parseSlugList(container.dataset.guideTanks)
      .map(getTankBySlug)
      .filter(Boolean);

    container.innerHTML = tanks.map(buildTankCard).join('');
  });

  document.querySelectorAll('[data-guide-sets]').forEach(container => {
    const sets = parseSlugList(container.dataset.guideSets)
      .map(getSetBySlug)
      .filter(Boolean);

    container.innerHTML = sets.map(buildSetCard).join('');
  });
}

function populateFilters() {
  const visibleTanks = getVisibleTanks();
  const nations = ['All', ...new Set(visibleTanks.map(t => t.nation))];
  const types = ['All', ...new Set(visibleTanks.map(t => t.type))];
  const eras = ['All', ...new Set(visibleTanks.map(t => t.era))];

  const sets = [
    ['[data-filter-nation]', nations],
    ['[data-filter-type]', types],
    ['[data-filter-era]', eras],
  ];

  sets.forEach(([selector, values]) => {
    const select = document.querySelector(selector);
    if (!select) return;
    const current = select.value || 'All';
    select.innerHTML = values.map(v => `<option value="${v}">${selector.includes('nation') ? 'Nation' : selector.includes('type') ? 'Type' : 'Era'}: ${v}</option>`).join('');
    select.value = values.includes(current) ? current : 'All';
    select.addEventListener('change', renderBrowseGrid);
  });
}

function closeFilterDropdowns(exceptDropdown = null) {
  document.querySelectorAll('.filter-dropdown.is-open').forEach(dropdown => {
    if (dropdown !== exceptDropdown) {
      dropdown.classList.remove('is-open');
      const trigger = dropdown.querySelector('.filter-trigger');
      const menu = dropdown.querySelector('.filter-menu');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (menu) menu.hidden = true;
    }
  });
}

function getFilterDisplayValue(option) {
  if (!option) return '';
  return option.value === 'All' ? 'All' : option.value;
}

function syncEnhancedFilter(select) {
  const field = select.closest('.filter-field');
  if (!field || !select.id) return;

  const dropdown = field.querySelector(`.filter-dropdown[data-filter-dropdown-for="${select.id}"]`);
  if (!dropdown) return;

  const triggerLabel = dropdown.querySelector('.filter-trigger-label');
  const menuList = dropdown.querySelector('.filter-menu-list');
  const selectedOption = select.options[select.selectedIndex];

  if (triggerLabel) {
    triggerLabel.textContent = getFilterDisplayValue(selectedOption);
  }

  if (!menuList) return;
  menuList.innerHTML = '';

  Array.from(select.options).forEach(option => {
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'filter-menu-option';
    optionButton.dataset.value = option.value;
    optionButton.textContent = getFilterDisplayValue(option);
    optionButton.setAttribute('role', 'option');

    if (option.selected) {
      optionButton.classList.add('is-selected');
      optionButton.setAttribute('aria-selected', 'true');
    } else {
      optionButton.setAttribute('aria-selected', 'false');
    }

    optionButton.addEventListener('click', () => {
      if (select.value !== option.value) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      syncEnhancedFilter(select);
      closeFilterDropdowns();
      dropdown.querySelector('.filter-trigger')?.focus();
    });

    menuList.appendChild(optionButton);
  });
}

function enhanceBrowseFilter(select) {
  if (!select || !select.id) return;

  const field = select.closest('.filter-field');
  if (!field) return;

  select.classList.add('filter-select-native');

  let dropdown = field.querySelector(`.filter-dropdown[data-filter-dropdown-for="${select.id}"]`);

  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'filter-dropdown';
    dropdown.dataset.filterDropdownFor = select.id;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'filter-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `
      <span class="filter-trigger-label"></span>
      <span class="filter-trigger-icon" aria-hidden="true"></span>
    `;

    const menu = document.createElement('div');
    menu.className = 'filter-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'listbox');

    const menuList = document.createElement('div');
    menuList.className = 'filter-menu-list';
    menu.appendChild(menuList);

    trigger.addEventListener('click', () => {
      const isOpen = dropdown.classList.contains('is-open');
      closeFilterDropdowns(isOpen ? null : dropdown);
      dropdown.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });

    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    select.insertAdjacentElement('afterend', dropdown);

    if (!select.dataset.enhancedFilterBound) {
      select.addEventListener('change', () => syncEnhancedFilter(select));
      select.dataset.enhancedFilterBound = 'true';
    }
  }

  syncEnhancedFilter(select);
}

function enhanceBrowseFilters() {
  document.querySelectorAll('.browse-filters select').forEach(enhanceBrowseFilter);

  if (document.body.dataset.filterDropdownReady === 'true') return;

  document.addEventListener('click', event => {
    if (!event.target.closest('.filter-dropdown')) {
      closeFilterDropdowns();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeFilterDropdowns();
    }
  });

  document.body.dataset.filterDropdownReady = 'true';
}

function renderTankDetail() {
  const target = document.querySelector('[data-tank-detail]');
  if (!target) return;
  const url = new URL(window.location.href);
  const slug = target.dataset.slug || url.searchParams.get('slug');
  const tank = getTankBySlug(slug);

  if (!tank) {
    target.innerHTML = `
      <section class="hero-small">
        <h1 class="page-title">Tank not found</h1>
        <p class="lead">This tank is not currently available to browse.</p>
      </section>
    `;
    return;
  }
  const selectedScale = getSelectedScale();
  const selectedFinish = getSelectedFinish();
  const selectedPack = getTankPackByQuantity(getSelectedTankPack());
  const availableScales = getAvailableScales(tank);
  const safeScale = availableScales.includes(selectedScale) ? selectedScale : availableScales[0];
  const tankUrl = target.dataset.detailUrl || absoluteUrl(getTankDetailUrl(tank));
  const tankMetaDescription = getTankMetaDescription(tank, availableScales);
  const tankProductDescription = getTankProductDescription(tank, availableScales);
  const tankOfferPrices = availableScales.flatMap(scale =>
    validFinishes.map(finish => getTankPrice(scale, finish, tank))
  );
  const tankOffers = buildAggregateOfferJsonLd(tankOfferPrices, tank.etsyUrl || tankUrl);

  updatePageMeta({
    title: `${tank.name} 3D Printed Miniature Tank | MiniTankForge`,
    description: tankMetaDescription,
    url: tankUrl,
    image: tank.image,
  });

  setJsonLd('tank-product-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tank.name,
    description: tankProductDescription,
    image: buildImageObject(tank.image || 'assets/img/hero.jpg', getTankImageAlt(tank)),
    brand: {
      '@type': 'Brand',
      name: 'MiniTankForge',
    },
    sku: tank.slug,
    category: `${tank.nation} ${tank.era} ${tank.type}`,
    url: tankUrl,
    ...(tankOffers ? { offers: tankOffers } : {}),
  });

  setJsonLd('tank-breadcrumb-jsonld', buildBreadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Browse Tanks', url: `${SITE_URL}/tanks` },
    { name: tank.name, url: tankUrl },
  ]));

  target.innerHTML = `
    <section class="hero-small">
      <div class="eyebrow">Single tank page</div>
      <h1 class="page-title">${tank.name}</h1>
      <p class="lead">Review scale, finish, and details before sending a direct request or continuing to Etsy.</p>
      <a class="detail-back-link" href="tanks.html">Back to all tanks</a>
    </section>
    <section class="split">
      <div class="tank-media-stack">
        ${renderTankDetailGallery(tank)}
      </div>
      <div class="detail-panel card">
        <div class="kicker">Options</div>
        <h2 style="margin-top:6px">Review configuration</h2>
        <label>Scale</label>
        <div class="option-group" data-render-scale-choices></div>
        <label style="margin-top:16px">Finish</label>
        <div class="option-group">
          ${validFinishes.map(f => `<button class="chip ${f === selectedFinish ? 'active' : ''}" data-finish-chip="${f}" aria-pressed="${f === selectedFinish}">${f}</button>`).join('')}
        </div>
        <label style="margin-top:16px">Pack size</label>
        <div class="option-group">
          ${validTankPacks.map(pack => `<button class="chip ${pack.quantity === selectedPack.quantity ? 'active' : ''}" data-pack-chip="${pack.quantity}" aria-pressed="${pack.quantity === selectedPack.quantity}">${pack.label}</button>`).join('')}
        </div>
        <div class="tank-price-box">
  <div class="kicker">Price</div>
  <div class="tank-live-price" data-live-price data-tank-slug="${tank.slug}">€0.00</div>
  <div class="price-note">Price updates with selected scale, finish, and pack size.</div>
        </div>
        <div class="page-actions">
          <a class="btn btn-etsy" href="${tank.etsyUrl}" target="_blank" rel="noopener">Open ${getDisplayName(tank.name)} on Etsy</a>
        </div>
        <p class="helper"><strong data-selection-summary></strong></p>
      </div>
    </section>
    <section class="grid-2">
      <div>
        <h2>Model notes</h2>
        <p class="muted">${tankProductDescription}</p>
      </div>
      <div>
        <h2>Key facts</h2>
        <ul class="spec-list">
          <li><strong>Scale</strong><br><span data-current-scale></span></li>
          <li><strong>Available scales</strong><br>${availableScales.join(', ')}</li>
          <li><strong>Material</strong><br>3D printed miniature model</li>
          <li><strong>Nation / era</strong><br>${tank.nation} / ${tank.era}</li>
          <li><strong>Type</strong><br>${tank.type}</li>
          <li><strong>Compatibility</strong><br>${tank.compatibility || 'Compact hex-based tabletop play'}</li>
        </ul>
      </div>
    </section>
    <section class="grid-2">
      <div class="card info-card">
        <div class="kicker">Historical note</div>
        <h3>${tank.name}</h3>
        <p class="muted fun-fact">${tank.fact}</p>
      </div>
      <div class="card info-card">
        <div class="kicker">Scale guidance</div>
        <h3>Need more size context?</h3>
        <p class="muted">Use the dedicated scale comparison page for hand, board, and side-by-side views.</p>
        <a class="btn" href="scale-comparison.html">See Scale Comparison</a>
      </div>
    </section>
  `;

  renderScaleChoices(target.querySelector('[data-render-scale-choices]'), safeScale, availableScales);
  bindTankDetailGallery(target);
}

function bindChoiceButtons() {
  document.querySelectorAll('[data-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedScale(btn.dataset.scaleChip));
  });
  document.querySelectorAll('[data-finish-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedFinish(btn.dataset.finishChip));
  });
  document.querySelectorAll('[data-pack-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedTankPack(btn.dataset.packChip));
  });
}


function initScaleUI() {
  renderFeaturedTanks();
  renderFeaturedSets();
  populateSetFilters();
  enhanceBrowseFilters();
  renderSetsGrid();
  populateFilters();
  enhanceBrowseFilters();
  renderBrowseGrid();
  renderTankDetail();
  renderSetDetail();
  renderGuideProductCards();

  document.querySelectorAll('[data-render-scale-choices]').forEach(container => {
    if (!container.children.length) {
      renderScaleChoices(container, getSelectedScale(), validScales);
    }
  });

  bindChoiceButtons();
  setSelectedScale(getSelectedScale(), false);
  setSelectedFinish(getSelectedFinish(), false);
  setSelectedTankPack(getSelectedTankPack(), false);
}

document.addEventListener('DOMContentLoaded', initScaleUI);
document.addEventListener('DOMContentLoaded', initHomeHeroImage);

function updateLivePrice(scale, finish, quantity = getSelectedTankPack()) {
  document.querySelectorAll('[data-live-price]').forEach(el => {
    const tank = getTankBySlug(el.dataset.tankSlug);
    el.textContent = formatPrice(getTankPackPrice(scale, finish, quantity, tank));
  });
}

function updateTankSelectionSummary(scale, finish, quantity) {
  const pack = getTankPackByQuantity(quantity);

  document.querySelectorAll('[data-current-pack-label]').forEach(el => {
    el.textContent = pack.label;
  });

  document.querySelectorAll('[data-selection-summary]').forEach(el => {
    el.textContent = `Selected: ${scale}, ${finish}, ${pack.label}. Choose the same options on Etsy.`;
  });
}

function setSelectedScale(scale, updateUrl = true) {
  if (!validScales.includes(scale)) return;
  localStorage.setItem('mtf-scale', scale);

  document.querySelectorAll('[data-current-scale]').forEach(el => {
    el.textContent = scale;
  });

  document.querySelectorAll('[data-scale-chip]').forEach(el => {
    el.classList.toggle('active', el.dataset.scaleChip === scale);
  });

  const finish = getSelectedFinish();
  const pack = getSelectedTankPack();
  updateLivePrice(scale, finish, pack);
  updateTankSelectionSummary(scale, finish, pack);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('scale', scaleForUrl(scale));
    window.history.replaceState({}, '', url);
  }
}

function setSelectedFinish(finish, updateUrl = true) {
  if (!validFinishes.includes(finish)) return;
  localStorage.setItem('mtf-finish', finish);

  document.querySelectorAll('[data-current-finish]').forEach(el => {
    el.textContent = finish;
  });

  document.querySelectorAll('[data-finish-chip]').forEach(el => {
    el.classList.toggle('active', el.dataset.finishChip === finish);
  });

  const scale = getSelectedScale();
  const pack = getSelectedTankPack();
  updateLivePrice(scale, finish, pack);
  updateTankSelectionSummary(scale, finish, pack);
  if (updateUrl) {
    showTankGalleryFinish(finish);
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('finish', finish);
    window.history.replaceState({}, '', url);
  }
}

function setSelectedTankPack(quantity, updateUrl = true) {
  const pack = getTankPackByQuantity(quantity);
  localStorage.setItem('mtf-tank-pack', String(pack.quantity));

  document.querySelectorAll('[data-pack-chip]').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.packChip) === pack.quantity);
    el.setAttribute('aria-pressed', Number(el.dataset.packChip) === pack.quantity ? 'true' : 'false');
  });

  const scale = getSelectedScale();
  const finish = getSelectedFinish();
  updateLivePrice(scale, finish, pack.quantity);
  updateTankSelectionSummary(scale, finish, pack.quantity);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('pack', String(pack.quantity));
    window.history.replaceState({}, '', url);
  }
}

function initScaleComparison() {
  const container = document.getElementById('scale-selector');
  const img = document.getElementById('scale-image');

  if (!container || !img || !window.MTF_SCALES) return;

  const selectedScale = getSelectedScale();

  container.innerHTML = window.MTF_SCALES.map(scale => `
    <button class="chip ${scale === selectedScale ? 'active' : ''}" data-scale-chip="${scale}">
      ${scale}
    </button>
  `).join('');

  function updateImage(scale) {
    img.src = `assets/img/scales/${scale.replace(':', '-')}.jpg`;
  }

  updateImage(selectedScale);

  container.querySelectorAll('[data-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = btn.dataset.scaleChip;
      setSelectedScale(scale);
      updateImage(scale);
    });
  });
}

initScaleComparison();

function renderSetVisual(set, large = false) {
  const image = set.image || DEFAULT_SET_IMAGE;
  const priorityAttrs = large ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<div class="product-image ${large ? 'product-image-large' : ''}"><img src="${image}" width="1200" height="900" alt="${getSetImageAlt(set, large ? 'base coat set overview' : 'product card photo')}" ${priorityAttrs} decoding="async"></div>`;
}

function getSetDetailGalleryImages(set) {
  const configuredImages = Array.isArray(set.galleryImages) && set.galleryImages.length
    ? set.galleryImages
    : [{ src: set.image || DEFAULT_SET_IMAGE, label: 'Set overview' }];

  return configuredImages
    .map((image, index) => {
      if (typeof image === 'string') {
        return {
          src: image,
          label: `Set photo ${index + 1}`,
        };
      }

      return {
        src: image?.src,
        label: image?.label || `Set photo ${index + 1}`,
      };
    })
    .filter(image => image.src);
}

function slugForSetImagePart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSetOptionImageSlug(set, optionSlug) {
  if (set?.slug === 'hellcat-tankers' && optionSlug === 'full-set') {
    return 'full-pack';
  }

  return optionSlug;
}

function getSetSelectionImageSrc(set, optionSlug, finish) {
  if (!set || !optionSlug || !finish || !getAvailableSetOptions(set).length) return '';

  const optionImageSlug = getSetOptionImageSlug(set, optionSlug);
  const finishSlug = slugForSetImagePart(finish);

  if (!optionImageSlug || !finishSlug) return '';
  return `assets/img/sets/${set.slug}-${optionImageSlug}-${finishSlug}.jpg`;
}

function renderSetDetailGallery(set) {
  const galleryImages = getSetDetailGalleryImages(set);
  const mainImage = galleryImages[0]?.src || set.image || DEFAULT_SET_IMAGE;
  const mainLabel = galleryImages[0]?.label || 'Set overview';
  const safeName = escapeHtml(set.name);
  const safeMainLabel = escapeHtml(mainLabel);
  const safeMainAlt = escapeHtml(getSetImageAlt(set, mainLabel));

  return `
    <div class="set-detail-gallery" data-set-gallery>
      <div class="product-image product-image-large">
        <img src="${mainImage}" width="1600" height="900" alt="${safeMainAlt}" loading="eager" fetchpriority="high" decoding="async" data-set-gallery-main>
      </div>
      <div class="set-mini-gallery" aria-label="${safeName} photo thumbnails">
        ${galleryImages.map((image, index) => {
          const safeSrc = escapeHtml(image.src);
          const safeLabel = escapeHtml(image.label);
          const safeButtonLabel = escapeHtml(image.label.toLowerCase());

          return `
            <button class="set-mini-gallery-thumb ${index === 0 ? 'is-active' : ''}" type="button" data-set-gallery-thumb="${safeSrc}" data-set-gallery-label="${safeName} ${safeLabel}" aria-label="Show ${safeButtonLabel}">
              <img src="${safeSrc}" width="320" height="180" alt="" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function preloadSetGalleryImages(gallery) {
  const seen = new Set();
  gallery.querySelectorAll('[data-set-gallery-thumb]').forEach(button => {
    const src = button.dataset.setGalleryThumb;
    if (!src || seen.has(src)) return;
    seen.add(src);

    const image = new Image();
    image.src = src;
    if (typeof image.decode === 'function') {
      image.decode().catch(() => {});
    }
  });
}

function selectSetGalleryThumb(gallery, button) {
  const mainImage = gallery.querySelector('[data-set-gallery-main]');
  const nextImage = button?.dataset.setGalleryThumb;
  if (!mainImage || !nextImage) return;

  mainImage.src = nextImage;
  mainImage.alt = button.dataset.setGalleryLabel || mainImage.alt;
  gallery.querySelectorAll('[data-set-gallery-thumb]').forEach(thumb => thumb.classList.remove('is-active'));
  button.classList.add('is-active');
}

function showSetGallerySelection(root, set, optionSlug, finish) {
  const targetSrc = getSetSelectionImageSrc(set, optionSlug, finish);
  if (!targetSrc) return;

  root.querySelectorAll('[data-set-gallery]').forEach(gallery => {
    const matchingThumb = Array.from(gallery.querySelectorAll('[data-set-gallery-thumb]'))
      .find(button => button.dataset.setGalleryThumb === targetSrc);

    if (matchingThumb) {
      selectSetGalleryThumb(gallery, matchingThumb);
    }
  });
}

function bindSetDetailGallery(root = document) {
  root.querySelectorAll('[data-set-gallery]').forEach(gallery => {
    const mainImage = gallery.querySelector('[data-set-gallery-main]');
    if (!mainImage) return;

    preloadSetGalleryImages(gallery);

    gallery.querySelectorAll('[data-set-gallery-thumb]').forEach(button => {
      button.addEventListener('click', () => {
        selectSetGalleryThumb(gallery, button);
      });
    });
  });
}

function buildSetCard(set) {
  const detailUrl = getSetDetailUrl(set);

  return `
    <article class="card product-card">
      <a href="${detailUrl}" class="product-image-link">
        ${renderSetVisual(set)}
      </a>
      <div>
        <h3>${set.name}</h3>
        <div class="product-meta">
          <span class="badge">${set.category}</span>
          <span class="badge">${set.nation}</span>
          <span class="badge">${set.era}</span>
        </div>
        <div class="tank-card-price">${getSetPriceRange(set)}</div>
        <p class="muted fun-fact">${set.note}</p>
      </div>
      <a class="btn btn-primary" href="${detailUrl}">View Set</a>
    </article>
  `;
}

function renderFeaturedSets() {
  const container = document.querySelector('[data-featured-sets]');
  if (!container) return;

  const featured = getVisibleSets()
    .filter(set => set.featured)
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .slice(0, 2);

  container.innerHTML = featured.map(buildSetCard).join('');
}

function renderSetsGrid() {
  const container = document.querySelector('[data-sets-grid]');
  if (!container) return;

  const selectedGroup = document.querySelector('[data-filter-set-group]')?.value || 'All';

  const filtered = getBrowseOrderedSets().filter(set => {
    return selectedGroup === 'All' || set.filterGroup === selectedGroup;
  });

  container.innerHTML = filtered.map(buildSetCard).join('');
}

function populateSetFilters() {
  const select = document.querySelector('[data-filter-set-group]');
  if (!select) return;

  const values = ['All', ...new Set(getBrowseOrderedSets().map(set => set.filterGroup).filter(Boolean))];
  const current = select.value || 'All';

  select.innerHTML = values.map(value => `
    <option value="${value}">Set type: ${value}</option>
  `).join('');

  select.value = values.includes(current) ? current : 'All';
  select.addEventListener('change', renderSetsGrid);
}

function renderSetDetail() {
  const container = document.querySelector('[data-set-detail]');
  if (!container) return;

  const url = new URL(window.location.href);
  const slug = container.dataset.slug || url.searchParams.get('slug');
  const set = getSetBySlug(slug);

  if (!set) {
    container.innerHTML = `
    <section class="hero-small">
      <h1 class="page-title">Set not found</h1>
      <p class="lead">This set is not currently available to browse.</p>
    </section>
  `;
    return;
  }

  let selectedScale = getSelectedScale();
  const selectedFinish = getSelectedFinish();
  const availableScales = getAvailableSetScales(set);
  const availableOptions = getAvailableSetOptions(set);
  const availableFinishes = getAvailableSetFinishes(set);
  const usesSetOptions = availableOptions.length > 0;

  if (!availableScales.includes(selectedScale)) {
    selectedScale = availableScales[0] || DEFAULT_SCALE;
  }

  const selectedOption = usesSetOptions ? getSetOptionBySlug(set, url.searchParams.get('setOption')) : null;
  const selectedOptionSlug = selectedOption?.slug || '';
  const selectedOptionLabel = selectedOption?.label || '';
  const currentContents = getSetContents(set, selectedOptionSlug);
  const livePrice = formatPrice(getSetPrice(set, selectedScale, selectedFinish, selectedOptionSlug));

  container.dataset.selectedSetOption = selectedOptionSlug;

  const setUrl = container.dataset.detailUrl || absoluteUrl(getSetDetailUrl(set));
  const setDescription = `Browse the ${set.name}, a ${set.category.toLowerCase()} for ${set.nation} ${set.era} miniature games. Review contents, finish choices, and direct request or Etsy options.`;
  const setOfferPrices = [];

  for (const scale of availableScales) {
    for (const finish of availableFinishes) {
      if (usesSetOptions) {
        availableOptions.forEach(option => {
          setOfferPrices.push(getSetPrice(set, scale, finish, option.slug));
        });
      } else {
        setOfferPrices.push(getSetPrice(set, scale, finish));
      }
    }
  }

  const setOffers = buildAggregateOfferJsonLd(setOfferPrices, set.etsyUrl || setUrl);

  updatePageMeta({
    title: `${set.name} 3D Printed Miniature Tank Set | MiniTankForge`,
    description: setDescription,
    url: setUrl,
    image: set.image || DEFAULT_SET_IMAGE,
  });

  setJsonLd('set-product-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: set.name,
    description: setDescription,
    image: buildImageObject(set.image || DEFAULT_SET_IMAGE, getSetImageAlt(set)),
    brand: {
      '@type': 'Brand',
      name: 'MiniTankForge',
    },
    sku: set.slug,
    category: `${set.nation} ${set.era} ${set.category}`,
    url: setUrl,
    ...(setOffers ? { offers: setOffers } : {}),
  });

  setJsonLd('set-breadcrumb-jsonld', buildBreadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Browse Sets', url: `${SITE_URL}/sets` },
    { name: set.name, url: setUrl },
  ]));

  container.innerHTML = `
  <section class="hero-small">
    <div class="eyebrow">${set.category}</div>
    <h1 class="page-title">${set.name}</h1>
    <p class="lead">${set.note}</p>
    <a class="detail-back-link" href="sets.html">Back to all sets</a>
  </section>

  <section class="split set-detail-top">
    <div class="set-media-stack">
      ${renderSetDetailGallery(set)}
    </div>

    <div class="detail-panel card">
      <div class="kicker">Set options</div>
      <h2 style="margin-top:6px">Review configuration</h2>

      <label>Scale</label>
      <div class="option-group" data-set-scale-choices></div>

      ${usesSetOptions ? `
        <label style="margin-top:16px">${set.optionLabel || 'Set option'}</label>
        <div class="option-group" data-set-option-choices></div>
      ` : `
      `}

      <label style="margin-top:16px">Finish</label>
      <div class="option-group" data-set-finish-choices></div>

      <div class="tank-price-box set-price-box">
        <div class="kicker">Price</div>
        <div class="tank-live-price" data-set-live-price>${livePrice}</div>
        <div class="price-note">Price updates with selected ${usesSetOptions ? 'set option' : 'scale'} and finish.</div>
      </div>

      <div class="page-actions">
        <a class="btn btn-etsy" data-set-etsy-base="${set.etsyUrl}" href="${set.etsyUrl}" target="_blank" rel="noopener">Buy ${getDisplayName(set.name)} on Etsy</a>
      </div>

      <p class="helper">
        Selected on this page:
        ${usesSetOptions
          ? `<strong data-current-set-option>${selectedOptionLabel}</strong>,`
          : `<strong data-current-scale>${selectedScale}</strong>,`
        }
        <strong data-current-finish>${selectedFinish}</strong>.
        Use these options in your direct request, or choose the same options on Etsy.
      </p>
    </div>
  </section>

  <section class="grid-2">
    <div>
      <h2>Key facts</h2>
      <ul class="spec-list">
        <li><strong>Category</strong><br>${set.category}</li>
        <li><strong>Nation / era</strong><br>${set.nation} / ${set.era}</li>
        ${usesSetOptions
          ? `<li><strong>${set.optionLabel || 'Set options'}</strong><br>${availableOptions.map(option => option.label).join(', ')}</li>`
          : `<li><strong>Scale</strong><br><span data-current-scale>${selectedScale}</span></li>`
        }
        <li><strong>Compatibility</strong><br>${set.compatibility}</li>
      </ul>
    </div>

    <div>
      <h2>What you get</h2>
      <div class="callout">
        <strong>Included in this set:</strong><br><br>
        <div data-set-contents>${renderSetContents(currentContents, selectedScale)}</div>
      </div>
      <p class="muted">This page shows exact set contents before you send a request or continue to Etsy.</p>
      <div class="notice">Set pages always list exact included quantity and composition.</div>
    </div>
  </section>

  <section class="grid-2">
    <div class="card info-card">
      <div class="kicker">Contents clarity</div>
      <h3>Everything included is listed above</h3>
      <p class="muted">Unlike single tank pages, set pages always show exact included quantity and composition.</p>
    </div>
    <div class="card info-card">
      <div class="kicker">${usesSetOptions ? 'Set versions' : 'Need more size context?'}</div>
      <h3>${usesSetOptions ? 'Choose the right set version' : 'Compare scales before you buy'}</h3>
      <p class="muted">${usesSetOptions
        ? 'Game-ready packs are fixed to the scale shown on this page and use set configuration options for pack size.'
        : 'Use the scale comparison page to see how these sets change across scale options.'}</p>
      ${usesSetOptions ? '' : `<a class="btn" href="scale-comparison.html">See Scale Comparison</a>`}
    </div>
  </section>
`;

  const optionContainer = container.querySelector('[data-set-option-choices]');
  const scaleContainer = container.querySelector('[data-set-scale-choices]');
  const finishContainer = container.querySelector('[data-set-finish-choices]');
  const contentsContainer = container.querySelector('[data-set-contents]');

  bindSetDetailGallery(container);
  showSetGallerySelection(container, set, selectedOptionSlug, selectedFinish);

  if (optionContainer) {
    optionContainer.innerHTML = availableOptions.map(option => `
      <button class="chip ${option.slug === selectedOptionSlug ? 'active' : ''}" data-set-option-chip="${option.slug}">${option.label}</button>
    `).join('');

    optionContainer.querySelectorAll('[data-set-option-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const optionSlug = btn.dataset.setOptionChip;
        const option = getSetOptionBySlug(set, optionSlug);

        container.dataset.selectedSetOption = optionSlug;

        optionContainer.querySelectorAll('.chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.setOptionChip === optionSlug);
        });

        document.querySelectorAll('[data-current-set-option]').forEach(el => {
          el.textContent = option?.label || '';
        });

        if (contentsContainer) {
          contentsContainer.innerHTML = renderSetContents(getSetContents(set, optionSlug), selectedScale);
        }

        updateSetLivePrice(set, selectedScale, getSelectedFinish(), optionSlug);
        showSetGallerySelection(container, set, optionSlug, getSelectedFinish());
      });
    });
  }

  if (scaleContainer) {
    scaleContainer.innerHTML = availableScales.map(scale => `
      <button class="chip ${scale === selectedScale ? 'active' : ''}" data-set-scale-chip="${scale}">${scale}</button>
    `).join('');

    scaleContainer.querySelectorAll('[data-set-scale-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scale = btn.dataset.setScaleChip;
        selectedScale = scale;
        setSelectedScale(scale);
        if (contentsContainer) {
          contentsContainer.innerHTML = renderSetContents(getSetContents(set, container.dataset.selectedSetOption || ''), scale);
        }
        updateSetLivePrice(set, scale, getSelectedFinish(), container.dataset.selectedSetOption || '');
        scaleContainer.querySelectorAll('.chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.setScaleChip === scale);
        });
      });
    });
  }

  finishContainer.innerHTML = availableFinishes.map(finish => `
    <button class="chip ${finish === selectedFinish ? 'active' : ''}" data-set-finish-chip="${finish}">${finish}</button>
  `).join('');

  finishContainer.querySelectorAll('[data-set-finish-chip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const finish = btn.dataset.setFinishChip;
      setSelectedFinish(finish);
      updateSetLivePrice(set, selectedScale, finish, container.dataset.selectedSetOption || '');
      showSetGallerySelection(container, set, container.dataset.selectedSetOption || '', finish);
      finishContainer.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.setFinishChip === finish);
      });
    });
  });
}

function updateSetLivePrice(set, scale, finish, optionSlug = '') {
  const value = formatPrice(getSetPrice(set, scale, finish, optionSlug));
  document.querySelectorAll('[data-set-live-price]').forEach(el => {
    el.textContent = value;
  });
}

function buildTankRequestMailto(formData) {
  const requestTopic = (formData.get('requestTopic') || formData.get('tankName') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const reference = (formData.get('reference') || '').toString().trim();
  const details = (formData.get('details') || '').toString().trim();
  const subject = requestTopic ? `MiniTankForge Request - ${requestTopic}` : 'MiniTankForge Request';
  const lines = [`Request topic: ${requestTopic || 'Not specified'}`, `Reply email: ${email || 'Not specified'}`];

  if (reference) {
    lines.push(`Reference: ${reference}`);
  }

  if (details) {
    lines.push('', 'Details:', details);
  }

  return `mailto:quali3dprint@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

function setRequestStatus(statusElement, kind, message) {
  if (!statusElement) return;

  statusElement.hidden = false;
  statusElement.textContent = message;
  statusElement.classList.remove('is-pending', 'is-error');

  if (kind === 'pending') {
    statusElement.classList.add('is-pending');
  }

  if (kind === 'error') {
    statusElement.classList.add('is-error');
  }
}

function initTankRequestForm() {
  const form = document.querySelector('[data-request-form]');
  if (!form) return;

  const endpoint = form.getAttribute('action') || '';
  const mailtoLink = form.querySelector('[data-request-mailto]');
  const statusElement = form.querySelector('[data-request-status]');
  const submitButton = form.querySelector('[data-request-submit]');

  function syncMailtoLink() {
    if (!mailtoLink) return;
    mailtoLink.href = buildTankRequestMailto(new FormData(form));
  }

  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', syncMailtoLink);
  });

  syncMailtoLink();

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData(form);
    const requestTopic = (formData.get('requestTopic') || formData.get('tankName') || '').toString().trim();
    const website = (formData.get('website') || '').toString().trim();

    if (website) {
      form.reset();
      syncMailtoLink();
      setRequestStatus(statusElement, 'success', 'Your request was sent. I will get back to you by email.');
      return;
    }

    const jsonPayload = {
      requestTopic,
      email: (formData.get('email') || '').toString().trim(),
      reference: (formData.get('reference') || '').toString().trim(),
      details: (formData.get('details') || '').toString().trim(),
      _subject: (formData.get('_subject') || '').toString().trim(),
    };

    if (!jsonPayload.requestTopic || !jsonPayload.email || !jsonPayload.details) {
      setRequestStatus(statusElement, 'error', 'Please fill in request topic, email, and details before sending.');
      return;
    }

    if (!endpoint) {
      setRequestStatus(statusElement, 'error', 'The request form is not configured yet. Please use the email option instead.');
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setRequestStatus(statusElement, 'pending', 'Sending your request...');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonPayload),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.errors?.[0]?.message || payload.error || 'Request could not be sent right now. Please use the email option instead.');
      }

      form.reset();
      syncMailtoLink();
      setRequestStatus(statusElement, 'success', 'Your request was sent. I will get back to you by email.');
    } catch (error) {
      setRequestStatus(statusElement, 'error', error.message || 'Request could not be sent right now. Please use the email option instead.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function initFinishGuideRotation() {
  const overviewImage = document.querySelector('[data-finish-rotation="overview"]');
  const unpaintedImage = document.querySelector('[data-finish-rotation="unpainted"]');
  const basecoatImage = document.querySelector('[data-finish-rotation="basecoat"]');

  if (!overviewImage || !unpaintedImage || !basecoatImage) return;

  const variants = [
    {
      overviewSrc: 'assets/img/finishes/paint-overview.jpg',
      overviewAlt: 'Overview showing miniature US tanks in unpainted and base coated finishes',
      unpaintedSrc: 'assets/img/finishes/us-unpainted.jpg',
      unpaintedAlt: 'Unpainted miniature US tank model',
      basecoatSrc: 'assets/img/finishes/us-painted.jpg',
      basecoatAlt: 'Base coated miniature US tank model',
    },
    {
      overviewSrc: 'assets/img/finishes/paint-overview.jpg',
      overviewAlt: 'Overview showing miniature USSR tanks in unpainted and base coated finishes',
      unpaintedSrc: 'assets/img/finishes/ussr-unpainted.jpg',
      unpaintedAlt: 'Unpainted miniature USSR tank model',
      basecoatSrc: 'assets/img/finishes/ussr-painted.jpg',
      basecoatAlt: 'Base coated miniature USSR tank model',
    },
    {
      overviewSrc: 'assets/img/finishes/paint-overview.jpg',
      overviewAlt: 'Overview showing miniature German tanks in unpainted and base coated finishes',
      unpaintedSrc: 'assets/img/finishes/german-unpainted.jpg',
      unpaintedAlt: 'Unpainted miniature German tank model',
      basecoatSrc: 'assets/img/finishes/german-painted.jpg',
      basecoatAlt: 'Base coated miniature German tank model',
    }
  ];

  let activeIndex = 0;
  const fadeDurationMs = 550;
  let isTransitioning = false;

  function applyVariant(index) {
    const variant = variants[index];
    overviewImage.src = variant.overviewSrc;
    overviewImage.alt = variant.overviewAlt;
    unpaintedImage.src = variant.unpaintedSrc;
    unpaintedImage.alt = variant.unpaintedAlt;
    basecoatImage.src = variant.basecoatSrc;
    basecoatImage.alt = variant.basecoatAlt;
  }

  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = reject;
      image.src = src;
    });
  }

  function transitionToVariant(index) {
    if (isTransitioning) return;

    const variant = variants[index];
    const images = [unpaintedImage, basecoatImage];

    isTransitioning = true;

    Promise.all([
      preloadImage(variant.unpaintedSrc),
      preloadImage(variant.basecoatSrc),
    ]).then(() => {
      images.forEach(image => image.classList.add('is-fading'));

      window.setTimeout(() => {
        applyVariant(index);
        images.forEach(image => image.classList.remove('is-fading'));
        isTransitioning = false;
      }, fadeDurationMs);
    }).catch(() => {
      applyVariant(index);
      isTransitioning = false;
    });
  }

  applyVariant(activeIndex);

  window.setInterval(() => {
    activeIndex = (activeIndex + 1) % variants.length;
    transitionToVariant(activeIndex);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', initTankRequestForm);
document.addEventListener('DOMContentLoaded', initFinishGuideRotation);
