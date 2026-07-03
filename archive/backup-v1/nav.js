/**
 * VEDMAN.LV — Shared Navigation & Footer
 * Injects nav + footer into every page
 * Usage: <script src="js/nav.js"></script>
 * Requires: data-page="pagename" on <body>
 */

(function() {

  // ─── TRANSLATIONS ────────────────────────────────
  const T = {
    lv: {
      home: 'Sākums', bulk: 'Beramkravas', manipulator: 'Manipulators',
      timber: 'Kokmateriāli', about: 'Par mums', contact: 'Kontakti',
      order: 'Pasūtīt', dol: 'Dolomīta šķembas', gran: 'Granīta šķembas',
      grants: 'Grants', smilts: 'Smilts', melnzeme: 'Melnzeme',
      asfalts: 'Frēzēts asfalts/betons', manip_gr: 'Manipulators ar greiferi',
      demontaza: 'Demontāža', koki: 'Koku serviss / izvešana',
      deli: 'Dēļi', brusas: 'Brusas', sijas: 'Sijas',
      riga: '📍 Rīgā · Ogrē · Visā Latvijā', phone: '+371 22312828',
      hours: 'P–Sv 7:00–21:00',
      footer_desc: 'Beramās kravas, manipulators un kokmateriāli ar piegādi Rīgā, Ogrē un visā Latvijā.',
      footer_services: 'Pakalpojumi', footer_links: 'Saites', footer_contact: 'Kontakti',
      copyright: '© 2025 AMAPU SIA. Visas tiesības aizsargātas.',
    },
    ru: {
      home: 'Главная', bulk: 'Сыпучие грузы', manipulator: 'Манипулятор',
      timber: 'Пиломатериалы', about: 'О нас', contact: 'Контакты',
      order: 'Заказать', dol: 'Доломитный щебень', gran: 'Гранитный щебень',
      grants: 'Гравий', smilts: 'Песок', melnzeme: 'Чернозём',
      asfalts: 'Фрезерованный асфальт/бетон', manip_gr: 'Манипулятор с грейфером',
      demontaza: 'Демонтаж', koki: 'Обслуживание деревьев',
      deli: 'Доски', brusas: 'Брус', sijas: 'Балки',
      riga: '📍 Рига · Огре · По всей Латвии', phone: '+371 22312828',
      hours: 'Пн–Вс 7:00–21:00',
      footer_desc: 'Перевозка сыпучих грузов, манипулятор и пиломатериалы с доставкой в Риге, Огре и по всей Латвии.',
      footer_services: 'Услуги', footer_links: 'Ссылки', footer_contact: 'Контакты',
      copyright: '© 2025 AMAPU SIA. Все права защищены.',
    },
    en: {
      home: 'Home', bulk: 'Bulk Materials', manipulator: 'Crane Truck',
      timber: 'Timber', about: 'About', contact: 'Contact',
      order: 'Order', dol: 'Dolomite Gravel', gran: 'Granite Gravel',
      grants: 'Gravel', smilts: 'Sand', melnzeme: 'Black Soil',
      asfalts: 'Milled Asphalt/Concrete', manip_gr: 'Crane with Grapple',
      demontaza: 'Demolition', koki: 'Tree Removal',
      deli: 'Planks', brusas: 'Beams', sijas: 'Joists',
      riga: '📍 Riga · Ogre · All Latvia', phone: '+371 22312828',
      hours: 'Mon–Sun 7:00–21:00',
      footer_desc: 'Bulk material delivery, crane truck and timber in Riga, Ogre and across Latvia.',
      footer_services: 'Services', footer_links: 'Links', footer_contact: 'Contact',
      copyright: '© 2025 AMAPU SIA. All rights reserved.',
    }
  };

  // ─── STATE ───────────────────────────────────────
  let lang = localStorage.getItem('vl') || 'lv';

  // ─── RENDER NAV ──────────────────────────────────
  function renderNav() {
    const t = T[lang];
    const page = document.body.dataset.page || '';
    const active = (p) => p === page ? 'active' : '';
    const wa = 'https://wa.me/37122312828';

    return `
    <div class="topbar">
      <div class="topbar-left">
        <span><span class="pulse"></span>&nbsp;${t.riga}</span>
        <a href="tel:+37122312828">📞 ${t.phone}</a>
        <a href="mailto:ufomar21@gmail.com">✉ ufomar21@gmail.com</a>
      </div>
      <span style="color:#444">${t.hours}</span>
    </div>

    <nav class="navbar" id="mainNav">
      <a href="index.html" class="logo">
        <div class="logo-mark">V</div>
        <div class="logo-text">VED<em>MAN</em><small>.LV</small></div>
      </a>

      <ul class="nav-links">
        <li><a href="index.html" class="${active('home')}">${t.home}</a></li>

        <li>
          <button class="nav-btn ${['skembas','grants','smilts','melnzeme','asfalts'].includes(page)?'active':''}">${t.bulk} <span class="chevron"></span></button>
          <div class="dropdown">
            <a href="skembas.html#dolomita"><span class="d-icon">🪨</span><span class="d-lbl">${t.dol}</span><span class="d-arr">›</span></a>
            <a href="skembas.html#granita"><span class="d-icon">⬛</span><span class="d-lbl">${t.gran}</span><span class="d-arr">›</span></a>
            <a href="grants.html#grants"><span class="d-icon">🏖</span><span class="d-lbl">${t.grants}</span><span class="d-arr">›</span></a>
            <a href="smilts.html#smilts"><span class="d-icon">🟡</span><span class="d-lbl">${t.smilts}</span><span class="d-arr">›</span></a>
            <a href="melnzeme.html#melnzeme"><span class="d-icon">🌱</span><span class="d-lbl">${t.melnzeme}</span><span class="d-arr">›</span></a>
            <a href="asfalts.html#asfalts"><span class="d-icon">🛣</span><span class="d-lbl">${t.asfalts}</span><span class="d-arr">›</span></a>
          </div>
        </li>

        <li>
          <button class="nav-btn ${active('manipulators')}">${t.manipulator} <span class="chevron"></span></button>
          <div class="dropdown">
            <a href="manipulators.html#manipulators"><span class="d-icon">🦾</span><span class="d-lbl">${t.manip_gr}</span><span class="d-arr">›</span></a>
            <a href="manipulators.html#demontaza"><span class="d-icon">🏗</span><span class="d-lbl">${t.demontaza}</span><span class="d-arr">›</span></a>
            <a href="manipulators.html#koki"><span class="d-icon">🌳</span><span class="d-lbl">${t.koki}</span><span class="d-arr">›</span></a>
          </div>
        </li>

        <li>
          <button class="nav-btn ${active('koks')}">${t.timber} <span class="chevron"></span></button>
          <div class="dropdown">
            <a href="koks.html#deli"><span class="d-icon">🪵</span><span class="d-lbl">${t.deli}</span><span class="d-arr">›</span></a>
            <a href="koks.html#brusas"><span class="d-icon">🪵</span><span class="d-lbl">${t.brusas}</span><span class="d-arr">›</span></a>
            <a href="koks.html#sijas"><span class="d-icon">🪵</span><span class="d-lbl">${t.sijas}</span><span class="d-arr">›</span></a>
          </div>
        </li>

        <li><a href="par-mums.html" class="${active('about')}">${t.about}</a></li>
        <li><a href="kontakti.html" class="${active('contact')}">${t.contact}</a></li>
      </ul>

      <div class="nav-right">
        <div class="lang-sw" id="langSw">
          <button onclick="setLang('lv')" class="${lang==='lv'?'active':''}">LV</button>
          <button onclick="setLang('ru')" class="${lang==='ru'?'active':''}">RU</button>
          <button onclick="setLang('en')" class="${lang==='en'?'active':''}">EN</button>
        </div>
        <a href="${wa}" class="btn-cta" target="_blank" rel="noopener">💬 ${t.order}</a>
      </div>

      <button class="hamburger" id="hamBtn" onclick="toggleMob()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="mob-menu" id="mobMenu">
      <a href="index.html" class="mob-link" style="border-top:1px solid var(--border)">${t.home}</a>
      <button class="mob-link" onclick="toggleSub('ms1',this)">${t.bulk} <span>▾</span></button>
      <div class="mob-sub" id="ms1">
        <a href="skembas.html#dolomita">🪨 ${t.dol}</a>
        <a href="skembas.html#granita">⬛ ${t.gran}</a>
        <a href="grants.html#grants">🏖 ${t.grants}</a>
        <a href="smilts.html#smilts">🟡 ${t.smilts}</a>
        <a href="melnzeme.html#melnzeme">🌱 ${t.melnzeme}</a>
        <a href="asfalts.html#asfalts">🛣 ${t.asfalts}</a>
      </div>
      <button class="mob-link" onclick="toggleSub('ms2',this)">${t.manipulator} <span>▾</span></button>
      <div class="mob-sub" id="ms2">
        <a href="manipulators.html#manipulators">🦾 ${t.manip_gr}</a>
        <a href="manipulators.html#demontaza">🏗 ${t.demontaza}</a>
        <a href="manipulators.html#koki">🌳 ${t.koki}</a>
      </div>
      <button class="mob-link" onclick="toggleSub('ms3',this)">${t.timber} <span>▾</span></button>
      <div class="mob-sub" id="ms3">
        <a href="koks.html#deli">🪵 ${t.deli}</a>
        <a href="koks.html#brusas">🪵 ${t.brusas}</a>
        <a href="koks.html#sijas">🪵 ${t.sijas}</a>
      </div>
      <a href="par-mums.html" class="mob-link">${t.about}</a>
      <a href="kontakti.html" class="mob-link">${t.contact}</a>
      <div class="mob-bottom">
        <a href="${wa}" class="btn-cta" target="_blank" rel="noopener">💬 ${t.order}</a>
        <div class="lang-sw">
          <button onclick="setLang('lv')" class="${lang==='lv'?'active':''}">LV</button>
          <button onclick="setLang('ru')" class="${lang==='ru'?'active':''}">RU</button>
          <button onclick="setLang('en')" class="${lang==='en'?'active':''}">EN</button>
        </div>
      </div>
    </div>`;
  }

  // ─── RENDER FOOTER ───────────────────────────────
  function renderFooter() {
    const t = T[lang];
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="logo">
              <div class="logo-mark">V</div>
              <div class="logo-text">VED<em>MAN</em><small>.LV</small></div>
            </a>
            <p>${t.footer_desc}</p>
            <div class="footer-social">
              <a href="https://www.facebook.com/profile.php?id=61563519773146" target="_blank" rel="noopener" title="Facebook">📘</a>
              <a href="https://www.instagram.com/vedman.lv" target="_blank" rel="noopener" title="Instagram">📸</a>
              <a href="https://www.tiktok.com/@vedmanlv" target="_blank" rel="noopener" title="TikTok">🎵</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>${t.footer_services}</h4>
            <ul>
              <li><a href="skembas.html#dolomita">${t.dol}</a></li>
              <li><a href="skembas.html#granita">${t.gran}</a></li>
              <li><a href="grants.html#grants">${t.grants}</a></li>
              <li><a href="smilts.html#smilts">${t.smilts}</a></li>
              <li><a href="melnzeme.html#melnzeme">${t.melnzeme}</a></li>
              <li><a href="asfalts.html#asfalts">${t.asfalts}</a></li>
              <li><a href="manipulators.html#manipulators">${t.manipulator}</a></li>
              <li><a href="koks.html#deli">${t.timber}</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>${t.footer_links}</h4>
            <ul>
              <li><a href="par-mums.html">${t.about}</a></li>
              <li><a href="kontakti.html">${t.contact}</a></li>
              <li><a href="https://www.ss.lv/lv/transport/cargo-vehicles/" target="_blank" rel="noopener">ss.lv</a></li>
              <li><a href="https://www.1188.lv" target="_blank" rel="noopener">1188.lv</a></li>
              <li><a href="https://www.firmas.lv" target="_blank" rel="noopener">Firmas.lv</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>${t.footer_contact}</h4>
            <ul>
              <li><a href="tel:+37122312828">📞 +371 22312828</a></li>
              <li><a href="mailto:ufomar21@gmail.com">✉ ufomar21@gmail.com</a></li>
              <li><a href="https://wa.me/37122312828" target="_blank" rel="noopener">💬 WhatsApp</a></li>
              <li style="color:var(--muted);font-size:13px;margin-top:8px">📍 Rīga, Ogre, Latvija</li>
              <li style="color:var(--muted);font-size:13px">🕐 P–Sv 7:00–21:00</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>${t.copyright}</span>
          <span>AMAPU SIA · Reģ. nr. tiek precizēts</span>
        </div>
      </div>
    </footer>`;
  }

  // ─── RENDER ORDER BUTTONS ────────────────────────
  function renderOrderButtons() {
    return `
    <div class="order-btn-group" id="orderBtnGroup">
      <div class="order-sub-btns hidden" id="orderSubBtns">
        <a href="https://wa.me/37122312828" class="order-sub-btn osb-wa" target="_blank" rel="noopener">💬 WhatsApp</a>
        <a href="tel:+37122312828" class="order-sub-btn osb-tel">📞 Zvanīt</a>
        <a href="sms:+37122312828" class="order-sub-btn osb-sms">📱 SMS</a>
        <button class="order-sub-btn osb-form" onclick="openOrderForm()">📋 Forma</button>
      </div>
      <button class="order-main-btn" id="orderMainBtn" onclick="toggleOrderMenu()" title="Pasūtīt">💬</button>
    </div>

    <div class="order-overlay" id="orderOverlay" onclick="closeOrderForm(event)">
      <div class="order-modal">
        <button class="order-close" onclick="closeOrderFormDirect()">✕</button>
        <div class="order-title">📋 Pasūtījuma forma</div>
        <form id="orderForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
          <input type="hidden" name="_subject" value="Jauns pasūtījums — vedman.lv">
          <div class="form-group">
            <label class="form-label">Vārds *</label>
            <input type="text" name="name" class="form-input" placeholder="Jūsu vārds" required>
          </div>
          <div class="form-group">
            <label class="form-label">Tālrunis *</label>
            <input type="tel" name="phone" class="form-input" placeholder="+371 XXXXXXXX" required>
          </div>
          <div class="form-group">
            <label class="form-label">Pakalpojums</label>
            <select name="service" class="form-input form-select">
              <option value="">— izvēlieties —</option>
              <option>Dolomīta šķembas</option>
              <option>Granīta šķembas</option>
              <option>Grants</option>
              <option>Smilts</option>
              <option>Melnzeme</option>
              <option>Frēzēts asfalts/betons</option>
              <option>Manipulators</option>
              <option>Demontāža</option>
              <option>Koku serviss</option>
              <option>Kokmateriāli</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Daudzums (m³ vai tonnas)</label>
            <input type="text" name="amount" class="form-input" placeholder="piem. 5 m³">
          </div>
          <div class="form-group">
            <label class="form-label">Piegādes adrese</label>
            <input type="text" name="address" class="form-input" placeholder="Iela, Rīga vai cita vieta">
          </div>
          <div class="form-group">
            <label class="form-label">Ziņojums</label>
            <textarea name="message" class="form-textarea" placeholder="Papildu informācija..."></textarea>
          </div>
          <button type="submit" class="btn btn-green" style="width:100%;justify-content:center;padding:14px">
            📤 Nosūtīt pasūtījumu
          </button>
        </form>
      </div>
    </div>`;
  }

  // ─── INJECT INTO PAGE ────────────────────────────
  function init() {
    // Nav
    const navWrap = document.getElementById('nav-root');
    if (navWrap) navWrap.innerHTML = renderNav();

    // Footer
    const footerWrap = document.getElementById('footer-root');
    if (footerWrap) footerWrap.innerHTML = renderFooter();

    // Order buttons
    const orderWrap = document.getElementById('order-root');
    if (orderWrap) orderWrap.innerHTML = renderOrderButtons();
  }

  // ─── GLOBAL FUNCTIONS ────────────────────────────
  window.setLang = function(l) {
    lang = l;
    localStorage.setItem('vl', l);
    init();
    // Re-run any page-specific language updates
    if (typeof window.onLangChange === 'function') window.onLangChange(l);
  };

  window.toggleMob = function() {
    const m = document.getElementById('mobMenu');
    const h = document.getElementById('hamBtn');
    if (m) m.classList.toggle('open');
    if (h) h.classList.toggle('open');
  };

  window.toggleSub = function(id, btn) {
    const sub = document.getElementById(id);
    if (!sub) return;
    sub.classList.toggle('open');
    const arrow = btn.querySelector('span');
    if (arrow) arrow.textContent = sub.classList.contains('open') ? '▴' : '▾';
  };

  window.toggleOrderMenu = function() {
    const subs = document.getElementById('orderSubBtns');
    const btn  = document.getElementById('orderMainBtn');
    if (!subs) return;
    subs.classList.toggle('hidden');
    btn.textContent = subs.classList.contains('hidden') ? '💬' : '✕';
  };

  window.openOrderForm = function() {
    const ov = document.getElementById('orderOverlay');
    if (ov) ov.classList.add('open');
    // close sub menu
    const subs = document.getElementById('orderSubBtns');
    const btn  = document.getElementById('orderMainBtn');
    if (subs) subs.classList.add('hidden');
    if (btn)  btn.textContent = '💬';
  };

  window.closeOrderForm = function(e) {
    if (e.target.id === 'orderOverlay') closeOrderFormDirect();
  };

  window.closeOrderFormDirect = function() {
    const ov = document.getElementById('orderOverlay');
    if (ov) ov.classList.remove('open');
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
