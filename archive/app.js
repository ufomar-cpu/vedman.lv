const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const WA_NUMBER = '37122312828';
const TEL = '+37122312828';

const MATERIAL_CATALOG = {
  "Dolomīta šķembas (maisījums)": ["0–16", "0–32", "0–45", "0–56", "0–63"],
  "Dolomīta šķembas (šķirotas)": ["8–32", "5–40", "16–40", "40–70"],
  "Dolomīta šķembas (mazgātas)": ["0–2", "0–5", "2–8", "8–16", "16–32"],
  "Granīta šķembas": ["2–8", "8–16", "5–20", "20–40", "Atsijas"],
  "Drupināti būvgruži": ["0–16", "0–32", "0–45", "0–56", "0–63", "20–40", "40–70"],
  "Betona šķembas": ["0–45", "0–63", "20–40", "40–70"],
  "Oļi": ["8–16", "16–32"],
  "Smilts": ["Mazgāta 0–2", "Mazgāta 0–4", "Nemazgāta", "Pieberamā", "Sijātā"],
  "Grants": ["Skalota 0–4", "Neskalota 0–4", "Dabīgā", "0–16", "0–32"],
  "Melnzeme": ["Sijāta", "Nesijāta"],
  "Frēzēts asfalts": ["Frēzēts asfalts"],
  "Asfalts": ["Frēzēts", "Karstais"],
  "Kūtsmēsli / komposts": ["Kūtsmēsli", "Komposts"],
  "Akmens": ["Pēc pieprasījuma"],
  "Pakalpojumi": ["Beramo kravu piegāde", "Pašizgāzējs", "Manipulators", "Manipulators ar greiferi", "Demontāža", "Grunts izvešana", "Grodu ierakšana", "Dīķu/grāvju rakšana", "Zaru/baļķu izvešana", "Koku pārstādīšana", "Teritorijas sakopšana", "Stikla loksnes transports"]
};

function normalizeDash(value = '') { return String(value).replace(/-/g, '–').trim(); }
function findCatalogKey(material = '') {
  const raw = String(material || '').trim();
  if (!raw) return 'Dolomīta šķembas (maisījums)';
  if (MATERIAL_CATALOG[raw]) return raw;
  const lower = raw.toLowerCase();
  if (lower.includes('dolom') || lower === 'šķembas') return 'Dolomīta šķembas (maisījums)';
  if (lower.includes('granīt')) return 'Granīta šķembas';
  if (lower.includes('betona')) return 'Betona šķembas';
  if (lower.includes('būvgruž')) return 'Drupināti būvgruži';
  if (lower.includes('smil')) return 'Smilts';
  if (lower.includes('grant')) return 'Grants';
  if (lower.includes('meln')) return 'Melnzeme';
  if (lower.includes('asfalt')) return 'Frēzēts asfalts';
  if (lower.includes('oļ')) return 'Oļi';
  if (lower.includes('kūts') || lower.includes('kompost')) return 'Kūtsmēsli / komposts';
  if (lower.includes('manip') || lower.includes('pakal') || lower.includes('demont') || lower.includes('grunts') || lower.includes('koku')) return 'Pakalpojumi';
  return raw;
}
function fillMaterialSelect(selectedMaterial = '', selectedFraction = '') {
  if (!materialInput || !fractionInput) return;
  const keys = Object.keys(MATERIAL_CATALOG);
  materialInput.innerHTML = keys.map(key => `<option value="${key}">${key}</option>`).join('');
  const key = findCatalogKey(selectedMaterial);
  if (!MATERIAL_CATALOG[key]) {
    const opt = document.createElement('option'); opt.value = key; opt.textContent = key; materialInput.appendChild(opt);
  }
  materialInput.value = key;
  fillFractionSelect(selectedFraction);
}
function fillFractionSelect(selectedFraction = '') {
  if (!materialInput || !fractionInput) return;
  const list = MATERIAL_CATALOG[materialInput.value] || ['Pēc pieprasījuma'];
  fractionInput.innerHTML = list.map(item => `<option value="${item}">${item}</option>`).join('');
  const wanted = normalizeDash(selectedFraction);
  if (wanted) {
    const match = list.find(item => normalizeDash(item) === wanted || normalizeDash(item).includes(wanted));
    if (match) fractionInput.value = match;
  }
}

const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
if (menuToggle) menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
$$('.mobile-menu a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

const overlay = $('#quoteOverlay');
const closeQuote = $('#closeQuote');
const materialInput = $('#quoteMaterial');
const fractionInput = $('#quoteFraction');
const qtyInput = $('#quoteQty');

function openQuote(data = {}) {
  fillMaterialSelect(data.material || materialInput?.value || '', data.fraction || fractionInput?.value || '');
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => materialInput?.focus(), 80);
}
function closeQuoteModal() {
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
}

$$('.js-open-quote').forEach(btn => btn.addEventListener('click', e => {
  e.preventDefault();
  openQuote({ material: btn.dataset.material || '', fraction: btn.dataset.fraction || '' });
  trackEvent('quote_open');
}));
$$('[data-material]').forEach(btn => btn.addEventListener('click', e => {
  if (btn.classList.contains('js-open-quote')) return;
  e.preventDefault();
  openQuote({ material: btn.dataset.material || '', fraction: btn.dataset.fraction || '' });
}));

materialInput?.addEventListener('change', () => fillFractionSelect(''));
fillMaterialSelect('Dolomīta šķembas (maisījums)', '0–32');
if (closeQuote) closeQuote.addEventListener('click', closeQuoteModal);
if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeQuoteModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuoteModal(); });

function normaliseQty(value) {
  const num = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}
function formatQty(num) {
  if (Number.isInteger(num)) return String(num);
  return String(Number(num.toFixed(2)));
}
$('#qtyPlus')?.addEventListener('click', () => { qtyInput.value = formatQty(normaliseQty(qtyInput.value) + 1); });
$('#qtyMinus')?.addEventListener('click', () => { qtyInput.value = formatQty(Math.max(0, normaliseQty(qtyInput.value) - 1)); });
qtyInput?.addEventListener('input', () => { if (Number(qtyInput.value) < 0) qtyInput.value = 0; });

const calcToggle = $('#calcToggle');
const volumeCalculator = $('#volumeCalculator');
const calcLength = $('#calcLength');
const calcWidth = $('#calcWidth');
const calcDepth = $('#calcDepth');
const calcResult = $('#calcResult');
const calcApply = $('#calcApply');

function calcVolume() {
  const length = normaliseQty(calcLength?.value || 0);
  const width = normaliseQty(calcWidth?.value || 0);
  const depthCm = normaliseQty(calcDepth?.value || 0);
  const m3 = Math.round(length * width * (depthCm / 100) * 100) / 100;
  if (!calcResult) return 0;
  if (m3 > 0) {
    calcResult.textContent = `${formatQty(length)} × ${formatQty(width)} × ${formatQty(depthCm)} cm = ${formatQty(m3)} m³`;
  } else {
    calcResult.textContent = 'm³ = garums × platums × biezums / 100';
  }
  return m3;
}

calcToggle?.addEventListener('click', () => {
  const isHidden = volumeCalculator?.hasAttribute('hidden');
  if (!volumeCalculator) return;
  if (isHidden) {
    volumeCalculator.removeAttribute('hidden');
    calcToggle.classList.add('active');
    calcToggle.setAttribute('aria-expanded', 'true');
    calcLength?.focus();
  } else {
    volumeCalculator.setAttribute('hidden', '');
    calcToggle.classList.remove('active');
    calcToggle.setAttribute('aria-expanded', 'false');
  }
});
[calcLength, calcWidth, calcDepth].forEach(input => input?.addEventListener('input', calcVolume));
calcApply?.addEventListener('click', () => {
  const m3 = calcVolume();
  if (m3 > 0 && qtyInput) {
    qtyInput.value = formatQty(m3);
    const m3Radio = $('input[name="unit"][value="m³"]');
    if (m3Radio) m3Radio.checked = true;
  }
});

$('#quoteForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const unit = $('input[name="unit"]:checked')?.value || 'm³';
  const calcOpen = $('#volumeCalculator') && !$('#volumeCalculator').hasAttribute('hidden');
  const calcText = calcOpen ? `Aprēķins: ${$('#calcResult')?.textContent || 'Nav aprēķināts'}` : '';
  const extrasList = $$('.extras input:checked').map(i => i.value);
  if (calcText) extrasList.unshift(calcText);
  const extras = extrasList.join(', ') || 'Nav norādīts';
  const qty = normaliseQty(qtyInput.value);
  const qtyText = qty > 0 ? `${formatQty(qty)} ${unit}` : `Nav precizēts (${unit})`;
  const msg = `*PASŪTĪJUMS — vedman.lv*\n\n` +
    `📦 Materiāls / pakalpojums:\n${materialInput.value || 'Nav norādīts'}\n\n` +
    `📏 Frakcija / tips:\n${fractionInput.value || 'Nav norādīts'}\n\n` +
    `🚚 Daudzums:\n${qtyText}\n\n` +
    `📍 Adrese:\n${$('#quoteAddress').value || 'Precizēšu vēlāk'}\n\n` +
    `⚠ Papildus:\n${extras}\n\n` +
    `👤 Vārds:\n${$('#quoteName').value || 'Nav norādīts'}\n\n` +
    `📞 Telefons:\n${$('#quotePhone').value || 'Nav norādīts'}\n\n` +
    `📝 Komentārs:\n${$('#quoteComment').value || 'Nav komentāra'}`;
  trackEvent('quote_submit');
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

function trackEvent(name) {
  if (window.gtag) window.gtag('event', name);
  if (window.fbq && ['quote_submit', 'whatsapp_click', 'phone_click'].includes(name)) window.fbq('track', 'Lead');
}
$$('a[href^="https://wa.me"]').forEach(a => a.addEventListener('click', () => trackEvent('whatsapp_click')));
$$('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => trackEvent('phone_click')));

$('#materialFilters')?.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  $$('#materialFilters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  $$('.material-card').forEach(card => {
    card.style.display = filter === 'all' || card.dataset.category === filter || card.dataset.category === 'all' ? '' : 'none';
  });
});
$('#galleryFilters')?.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  $$('#galleryFilters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.gallery;
  $$('.object-card').forEach(card => card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none');
});
