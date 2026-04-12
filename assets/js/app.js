const DEFAULT_SCALE = '1:180';
const validScales = ['1:180','1:200','1:285'];

function getSelectedScale() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get('scale');
  if (q && validScales.includes(q.replace('-', ':'))) return q.replace('-', ':');
  const stored = localStorage.getItem('mtf-scale');
  return validScales.includes(stored) ? stored : DEFAULT_SCALE;
}

function setSelectedScale(scale, updateUrl = true) {
  if (!validScales.includes(scale)) return;
  localStorage.setItem('mtf-scale', scale);
  document.querySelectorAll('[data-current-scale]').forEach(el => el.textContent = scale);
  document.querySelectorAll('[data-scale-chip]').forEach(el => {
    el.classList.toggle('active', el.dataset.scaleChip === scale);
  });
  document.querySelectorAll('[data-scale-link]').forEach(el => {
    const base = el.dataset.scaleLink;
    el.href = `${base}${base.includes('?') ? '&' : '?'}scale=${scale.replace(':','-')}`;
  });
  document.querySelectorAll('[data-etsy-base]').forEach(el => {
    const base = el.dataset.etsyBase;
    const u = new URL(base, window.location.origin);
    u.searchParams.set('scale', scale);
    el.href = u.toString();
  });
  document.querySelectorAll('[data-dimensions]').forEach(el => {
    const map = JSON.parse(el.dataset.dimensions);
    if (map[scale]) el.textContent = map[scale];
  });
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('scale', scale.replace(':','-'));
    window.history.replaceState({}, '', url);
  }
}

function initScaleUI() {
  const initial = getSelectedScale();
  document.querySelectorAll('[data-scale-chip]').forEach(btn => {
    btn.addEventListener('click', () => setSelectedScale(btn.dataset.scaleChip));
  });
  setSelectedScale(initial, false);
}

document.addEventListener('DOMContentLoaded', initScaleUI);
