
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
  if (Array.isArray(set?.options) && set.options.length) return [];
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
      <p class="lead">Review the available options before continuing to Etsy.</p>
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


function initScaleUI() {
  renderFeaturedTanks();
  renderFeaturedSets();
  populateSetFilters();
  renderSetsGrid();
  populateFilters();
  renderBrowseGrid();
  renderTankDetail();
  renderSetDetail();

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

function renderSetsGrid() {
  const container = document.querySelector('[data-sets-grid]');
  if (!container) return;

  const selectedGroup = document.querySelector('[data-filter-set-group]')?.value || 'All';

  const filtered = setData.filter(set => {
    return selectedGroup === 'All' || set.filterGroup === selectedGroup;
  });

  container.innerHTML = filtered.map(buildSetCard).join('');
}

function populateSetFilters() {
  const select = document.querySelector('[data-filter-set-group]');
  if (!select) return;

  const values = ['All', ...new Set(setData.map(set => set.filterGroup).filter(Boolean))];
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
  const availableOptions = getAvailableSetOptions(set);
  const availableFinishes = getAvailableSetFinishes(set);
  const usesSetOptions = availableOptions.length > 0;

  const selectedOption = usesSetOptions ? getSetOptionBySlug(set, url.searchParams.get('setOption')) : null;
  const selectedOptionSlug = selectedOption?.slug || '';
  const selectedOptionLabel = selectedOption?.label || '';
  const currentContents = getSetContents(set, selectedOptionSlug);
  const livePrice = formatPrice(getSetPrice(set, selectedScale, selectedFinish, selectedOptionSlug));

  container.dataset.selectedSetOption = selectedOptionSlug;

  container.innerHTML = `
  <section class="hero-small">
    <div class="eyebrow">${set.category}</div>
    <h1 class="page-title">${set.name}</h1>
    <p class="lead">${set.note}</p>
  </section>

  <section class="split set-detail-top">
    <div>
      ${renderSetVisual(set, true)}
    </div>

    <div class="detail-panel card">
      <div class="kicker">Set options</div>
      <h2 style="margin-top:6px">Review configuration</h2>

      ${usesSetOptions ? `
        <label>${set.optionLabel || 'Set option'}</label>
        <div class="option-group" data-set-option-choices></div>
      ` : `
        <label>Scale</label>
        <div class="option-group" data-set-scale-choices></div>
      `}

      <label style="margin-top:16px">Finish</label>
      <div class="option-group" data-set-finish-choices></div>

      <div class="tank-price-box set-price-box">
        <div class="kicker">Price</div>
        <div class="tank-live-price" data-set-live-price>${livePrice}</div>
        <div class="price-note">Price updates with selected ${usesSetOptions ? 'set option' : 'scale'} and finish.</div>
      </div>

      <div class="page-actions">
        <a class="btn btn-etsy" data-set-etsy-base="${set.etsyUrl}" href="${set.etsyUrl}" target="_blank" rel="noopener">Buy ${set.name} on Etsy</a>
        <a class="btn" href="sets.html">Back to Sets</a>
      </div>

      <p class="helper">
        Selected on this page:
        ${usesSetOptions
          ? `<strong data-current-set-option>${selectedOptionLabel}</strong>,`
          : `<strong data-current-scale>${selectedScale}</strong>,`
        }
        <strong data-current-finish>${selectedFinish}</strong>.
        Choose the same options on Etsy.
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
        <span data-set-contents>${currentContents.map(item => `${item}<br>`).join('')}</span>
      </div>
      <p class="muted">This page shows exact set contents before Etsy checkout.</p>
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
        ? 'Game-ready sets use set configuration options instead of scale selection on this page.'
        : 'Use the scale comparison page to see how these sets change across scale options.'}</p>
      ${usesSetOptions ? '' : `<a class="btn" href="scale-comparison.html">See Scale Comparison</a>`}
    </div>
  </section>
`;

  const optionContainer = container.querySelector('[data-set-option-choices]');
  const scaleContainer = container.querySelector('[data-set-scale-choices]');
  const finishContainer = container.querySelector('[data-set-finish-choices]');
  const contentsContainer = container.querySelector('[data-set-contents]');

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
          contentsContainer.innerHTML = getSetContents(set, optionSlug).map(item => `${item}<br>`).join('');
        }

        updateSetLivePrice(set, getSelectedScale(), getSelectedFinish(), optionSlug);
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
        setSelectedScale(scale);
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
      updateSetLivePrice(set, getSelectedScale(), finish, container.dataset.selectedSetOption || '');
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
  const tankName = (formData.get('tankName') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const reference = (formData.get('reference') || '').toString().trim();
  const details = (formData.get('details') || '').toString().trim();
  const subject = tankName ? `Tank Request - ${tankName}` : 'Tank Request';
  const lines = [`Tank name: ${tankName || 'Not specified'}`, `Reply email: ${email || 'Not specified'}`];

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
    const jsonPayload = {
      tankName: (formData.get('tankName') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      reference: (formData.get('reference') || '').toString().trim(),
      details: (formData.get('details') || '').toString().trim(),
      website: (formData.get('website') || '').toString().trim(),
      _subject: (formData.get('_subject') || '').toString().trim(),
    };

    if (!jsonPayload.tankName || !jsonPayload.email || !jsonPayload.details) {
      setRequestStatus(statusElement, 'error', 'Please fill in tank name, email, and details before sending.');
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
