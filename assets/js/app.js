const DEFAULT_SCALE = '1:180';
const DEFAULT_FINISH = 'Base coat';
const validScales = ['1:180', '1:200', '1:285'];
const validFinishes = ['Base coat', 'Unpainted'];

function normalizeScale(value) {
  return typeof value === 'string' ? value.replace('-', ':') : value;
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
    url.searchParams.set('scale', scale.replace(':', '-'));
    el.href = `${url.pathname}${url.search}`;
  });
  document.querySelectorAll('[data-dimensions]').forEach(el => {
    const map = JSON.parse(el.dataset.dimensions);
    if (map[scale]) el.textContent = map[scale];
  });
  updateSelectionSummary();
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('scale', scale.replace(':', '-'));
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
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
    const url = new URL(window.location.href);
    url.searchParams.set('finish', finish);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
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
  const initialScale = getSelectedScale();
  const initialFinish = getSelectedFinish();

  document.querySelectorAll('[data-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedScale(btn.dataset.scaleChip));
  });

  document.querySelectorAll('[data-finish-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedFinish(btn.dataset.finishChip));
  });

  setSelectedScale(initialScale, false);
  setSelectedFinish(initialFinish, false);
}

document.addEventListener('DOMContentLoaded', initScaleUI);
