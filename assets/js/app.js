
const DEFAULT_SCALE = '1:180';
const DEFAULT_FINISH = 'Base coat';
const validScales = Array.isArray(window.MTF_SCALES) ? window.MTF_SCALES : ['1:180', '1:200', '1:250', '1:285'];
const validFinishes = Array.isArray(window.MTF_FINISHES) ? window.MTF_FINISHES : ['Base coat', 'Unpainted'];
const tankData = Array.isArray(window.TANKS) ? window.TANKS : [];

const scalePrices = window.MTF_SCALE_PRICES || {};
const finishSurcharges = window.MTF_FINISH_SURCHARGES || {};

function getScalePrice(scale) {
  return Number(scalePrices[scale] ?? 0);
}

function getFinishSurcharge(finish) {
  return Number(finishSurcharges[finish] ?? 0);
}

function getTankPrice(scale, finish) {
  return getScalePrice(scale) + getFinishSurcharge(finish);
}

function formatPrice(value) {
  return `€${value.toFixed(2)}`;
}

function getTankPriceRange(tank) {
  const scales = getAvailableScales(tank);
  const prices = [];

  for (const scale of scales) {
    for (const finish of validFinishes) {
      prices.push(getTankPrice(scale, finish));
    }
  }

  if (!prices.length) return '';

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
}


function normalizeScale(value) {
  return typeof value === 'string' ? value.replace('-', ':') : value;
}

function scaleForUrl(scale) {
  return scale.replace(':', '-');
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

function getTankBySlug(slug) {
  return tankData.find(t => t.slug === slug);
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
  if (tank.image) {
    return `<div class="product-image ${large ? 'product-image-large' : ''}"><img src="${tank.image}" alt="${tank.name}"></div>`;
  }
  const size = large ? 'tank-lg' : tankSizeClass(tank.placeholderStyle);
  const extraClass = placeholderClass(tank.placeholderStyle);
  return `<div class="${extraClass} ${large ? 'product-image-large' : ''}"><div class="tank ${size}"></div></div>`;
}

function buildTankCard(tank) {
  return `
    <article class="card product-card">
      <a href="tank.html?slug=${tank.slug}" data-scale-link="tank.html?slug=${tank.slug}" class="product-image-link">
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
      <a class="btn btn-primary" data-scale-link="tank.html?slug=${tank.slug}" href="tank.html?slug=${tank.slug}">View Tank</a>
    </article>
  `;
}

const setData = Array.isArray(window.SETS) ? window.SETS : [];
const validSetFinishes = Array.isArray(window.MTF_SET_FINISHES) ? window.MTF_SET_FINISHES : validFinishes;

function getSetBySlug(slug) {
  return setData.find(s => s.slug === slug);
}

function getAvailableSetScales(set) {
  return Array.isArray(set?.availableScales) && set.availableScales.length ? set.availableScales : validScales;
}

function getAvailableSetFinishes(set) {
  const prices = set?.prices || {};
  const firstScale = Object.keys(prices)[0];
  if (!firstScale) return validSetFinishes;
  return Object.keys(prices[firstScale]);
}

function getSetPrice(set, scale, finish) {
  return Number(set?.prices?.[scale]?.[finish] ?? 0);
}

function getSetPriceRange(set) {
  const scales = getAvailableSetScales(set);
  const finishes = getAvailableSetFinishes(set);
  const prices = [];

  for (const scale of scales) {
    for (const finish of finishes) {
      const value = getSetPrice(set, scale, finish);
      if (value > 0) prices.push(value);
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
  const featured = [...tankData]
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

  const filtered = tankData.filter(t => {
    return (nation === 'All' || t.nation === nation)
      && (type === 'All' || t.type === type)
      && (era === 'All' || t.era === era);
  });

  target.innerHTML = filtered.map(buildTankCard).join('');
}

function populateFilters() {
  const nations = ['All', ...new Set(tankData.map(t => t.nation))];
  const types = ['All', ...new Set(tankData.map(t => t.type))];
  const eras = ['All', ...new Set(tankData.map(t => t.era))];

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

function renderTankDetail() {
  const target = document.querySelector('[data-tank-detail]');
  if (!target) return;
  const url = new URL(window.location.href);
  const slug = url.searchParams.get('slug');
  const tank = getTankBySlug(slug) || tankData[0];
  const selectedScale = getSelectedScale();
  const selectedFinish = getSelectedFinish();
  const availableScales = getAvailableScales(tank);
  const safeScale = availableScales.includes(selectedScale) ? selectedScale : availableScales[0];

  target.innerHTML = `
    <section class="hero-small">
      <div class="eyebrow">Single tank page</div>
      <h1 class="page-title">${tank.name}</h1>
      <p class="lead">This page keeps quantity, options, and selection explicit before sending the buyer to Etsy.</p>
    </section>
    <section class="split">
      <div>
        ${renderTankVisual(tank, true)}
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
        <div class="tank-price-box">
  <div class="kicker">Price</div>
  <div class="tank-live-price" data-live-price>€0.00</div>
  <div class="price-note">Price updates with selected scale and finish.</div>
</div>
        <div class="page-actions">
          <a class="btn btn-etsy" data-etsy-base="${tank.etsyUrl}" href="${tank.etsyUrl}" target="_blank" rel="noopener">Buy ${tank.name} on Etsy</a>
          <a class="btn" href="tanks.html">Back to Tanks</a>
        </div>
        <p class="helper"><strong data-selection-summary></strong></p>
      </div>
    </section>
    <section class="grid-2">
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
      <div>
        <h2>What you get</h2>
        <div class="callout"><strong>1× ${tank.name} tank model</strong><br>No set contents are implied on this page. This is a single tank page.</div>
        <p class="muted">Scale and finish are selected here for clarity. Final variation selection still happens on Etsy.</p>
        <div class="notice">Single tank listings are single tanks unless the page clearly states otherwise.</div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card info-card">
        <div class="kicker">Fun fact</div>
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
}

function bindChoiceButtons() {
  document.querySelectorAll('[data-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedScale(btn.dataset.scaleChip));
  });
  document.querySelectorAll('[data-finish-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedFinish(btn.dataset.finishChip));
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
    el.setAttribute('aria-pressed', el.dataset.scaleChip === scale ? 'true' : 'false');
  });
  document.querySelectorAll('[data-scale-link]').forEach(el => {
    const base = el.dataset.scaleLink;
    const url = new URL(base, window.location.origin);
    url.searchParams.set('scale', scaleForUrl(scale));
    if (!url.searchParams.get('finish')) {
      url.searchParams.set('finish', getSelectedFinish());
    }
    el.href = `${url.pathname}${url.search}`;
  });
  updateSelectionSummary();
  if (updateUrl) {
    const current = new URL(window.location.href);
    current.searchParams.set('scale', scaleForUrl(scale));
    window.history.replaceState({}, '', `${current.pathname}${current.search}`);
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
    el.setAttribute('aria-pressed', el.dataset.finishChip === finish ? 'true' : 'false');
  });
  updateSelectionSummary();
  if (updateUrl) {
    const current = new URL(window.location.href);
    current.searchParams.set('finish', finish);
    window.history.replaceState({}, '', `${current.pathname}${current.search}`);
  }
}

function updateSelectionSummary() {
  const scale = getSelectedScale();
  const finish = getSelectedFinish();
  document.querySelectorAll('[data-selection-summary]').forEach(el => {
    el.textContent = `Selected on this page: ${scale}, ${finish}. Choose the same options on Etsy.`;
  });
}

function initScaleUI() {
  renderFeaturedTanks();
  populateFilters();
  renderBrowseGrid();
  renderTankDetail();

  document.querySelectorAll('[data-render-scale-choices]').forEach(container => {
    if (!container.children.length) {
      renderScaleChoices(container, getSelectedScale(), validScales);
    }
  });

  bindChoiceButtons();
  setSelectedScale(getSelectedScale(), false);
  setSelectedFinish(getSelectedFinish(), false);
}

document.addEventListener('DOMContentLoaded', initScaleUI);

function updateLivePrice(scale, finish) {
  const value = formatPrice(getTankPrice(scale, finish));
  document.querySelectorAll('[data-live-price]').forEach(el => {
    el.textContent = value;
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
  updateLivePrice(scale, finish);

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
  updateLivePrice(scale, finish);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('finish', finish);
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
    img.src = `assets/img/scales/${scale.replace(':','-')}.jpg`;
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
  if (set.image) {
    return `<div class="product-image ${large ? 'product-image-large' : ''}"><img src="${set.image}" alt="${set.name}"></div>`;
  }
  const size = large ? 'tank-lg' : tankSizeClass(set.placeholderStyle);
  const extraClass = placeholderClass(set.placeholderStyle);
  return `<div class="${extraClass} ${large ? 'product-image-large' : ''}"><div class="tank ${size}"></div></div>`;
}

function buildSetCard(set) {
  return `
    <article class="card product-card">
      <a href="set.html?slug=${set.slug}" class="product-image-link">
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
      <a class="btn btn-primary" href="set.html?slug=${set.slug}">View Set</a>
    </article>
  `;
}

function renderFeaturedSets() {
  const container = document.querySelector('[data-featured-sets]');
  if (!container) return;

  const featured = [...setData]
    .filter(set => set.featured)
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .slice(0, 2);

  container.innerHTML = featured.map(buildSetCard).join('');
}

function renderSetDetail() {
  const container = document.querySelector('[data-set-detail]');
  if (!container) return;

  const url = new URL(window.location.href);
  const slug = url.searchParams.get('slug');
  const set = getSetBySlug(slug);

  if (!set) {
    container.innerHTML = `
      <section class="hero-small">
        <h1 class="page-title">Set not found</h1>
        <p class="lead">This set could not be found.</p>
      </section>
    `;
    return;
  }

  const selectedScale = getSelectedScale();
  const selectedFinish = getSelectedFinish();
  const availableScales = getAvailableSetScales(set);
  const availableFinishes = getAvailableSetFinishes(set);
  const livePrice = formatPrice(getSetPrice(set, selectedScale, selectedFinish));

  container.innerHTML = `
    <section class="hero-small">
      <div class="eyebrow">${set.category}</div>
      <h1 class="page-title">${set.name}</h1>
      <p class="lead">${set.note}</p>
    </section>

    <section class="split">
      <div>
        ${renderSetVisual(set, true)}
      </div>

      <div class="detail-panel card">
        <div class="kicker">Options</div>
        <h2 style="margin-top:6px">Review configuration</h2>

        <label>Scale</label>
        <div class="option-group" data-set-scale-choices></div>

        <label style="margin-top:16px">Finish</label>
        <div class="option-group" data-set-finish-choices></div>

        <div class="tank-price-box">
          <div class="kicker">Price</div>
          <div class="tank-live-price" data-set-live-price>${livePrice}</div>
          <div class="price-note">Price updates with selected scale and finish.</div>
        </div>

        <div class="page-actions">
          <a class="btn btn-etsy" data-set-etsy-base="${set.etsyUrl}" href="${set.etsyUrl}" target="_blank" rel="noopener">Buy on Etsy</a>
          <a class="btn" href="sets.html">Back to Sets</a>
        </div>

        <p class="helper">
          Selected:
          <strong data-current-scale>${selectedScale}</strong>,
          <strong data-current-finish>${selectedFinish}</strong>
        </p>
      </div>
    </section>

    <section class="grid-2">
      <div>
        <h2>Key facts</h2>
        <ul class="spec-list">
          <li><strong>Category</strong><br>${set.category}</li>
          <li><strong>Nation / era</strong><br>${set.nation} / ${set.era}</li>
          <li><strong>Scale</strong><br><span data-current-scale>${selectedScale}</span></li>
          <li><strong>Compatibility</strong><br>${set.compatibility}</li>
        </ul>
      </div>

      <div>
        <h2>Included in this set</h2>
        <div class="callout">
          ${set.contents.map(item => `${item}<br>`).join('')}
        </div>
        <p class="muted">This page shows exact set contents before Etsy checkout.</p>
      </div>
    </section>
  `;

  const scaleContainer = container.querySelector('[data-set-scale-choices]');
  const finishContainer = container.querySelector('[data-set-finish-choices]');

  scaleContainer.innerHTML = availableScales.map(scale => `
    <button class="chip ${scale === selectedScale ? 'active' : ''}" data-set-scale-chip="${scale}">${scale}</button>
  `).join('');

  finishContainer.innerHTML = availableFinishes.map(finish => `
    <button class="chip ${finish === selectedFinish ? 'active' : ''}" data-set-finish-chip="${finish}">${finish}</button>
  `).join('');

  scaleContainer.querySelectorAll('[data-set-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = btn.dataset.setScaleChip;
      setSelectedScale(scale);
      updateSetLivePrice(set, scale, getSelectedFinish());
      scaleContainer.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.setScaleChip === scale));
    });
  });

  finishContainer.querySelectorAll('[data-set-finish-chip]').forEach(btn => {
    btn.addEventListener('click', () => {
      const finish = btn.dataset.setFinishChip;
      setSelectedFinish(finish);
      updateSetLivePrice(set, getSelectedScale(), finish);
      finishContainer.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.setFinishChip === finish));
    });
  });
}

function updateSetLivePrice(set, scale, finish) {
  const value = formatPrice(getSetPrice(set, scale, finish));
  document.querySelectorAll('[data-set-live-price]').forEach(el => {
    el.textContent = value;
  });
}