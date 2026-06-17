const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const WA_NUMBER = '37122312828';
const TEL = '+37122312828';

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
  if (data.material) materialInput.value = data.material;
  if (data.fraction) fractionInput.value = data.fraction;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => materialInput.focus(), 80);
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
$('#qtyPlus')?.addEventListener('click', () => { qtyInput.value = formatQty(normaliseQty(qtyInput.value) + 0.1); });
$('#qtyMinus')?.addEventListener('click', () => { qtyInput.value = formatQty(Math.max(0, normaliseQty(qtyInput.value) - 0.1)); });
qtyInput?.addEventListener('input', () => { if (Number(qtyInput.value) < 0) qtyInput.value = 0; });

$('#quoteForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const unit = $('input[name="unit"]:checked')?.value || 'm³';
  const extras = $$('.extras input:checked').map(i => i.value).join(', ') || 'Nav norādīts';
  const qty = normaliseQty(qtyInput.value);
  const qtyText = qty > 0 ? `${formatQty(qty)} ${unit}` : `Nav precizēts (${unit})`;
  const msg = `*PASŪTĪJUMS — mainamies.lv / VEDMAN*\n\n` +
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
