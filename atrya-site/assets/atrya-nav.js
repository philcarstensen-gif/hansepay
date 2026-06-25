(function () {
  var path = window.location.pathname;
  var hp          = path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '';
  var isAgentic   = path.includes('agentic');
  var isCrossB    = path.includes('cross-border');
  var isInvestors = path.includes('investors');
  var isUC        = isAgentic || isCrossB;

  var logoHref = hp ? '#'           : '/';
  var feat     = hp ? '#features'   : '/#features';
  var uc       = hp ? '#usecases'   : '/#usecases';
  var vis      = hp ? '#vision'     : '/#vision';
  var abt      = hp ? '#about'      : '/#about';

  /* Nav CSS injected inline — single source of truth, no separate head append */
  var css = document.getElementById('atrya-nav-css') ? '' : `<style id="atrya-nav-css">
nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:22px 56px;display:flex;align-items:center;justify-content:space-between;background:rgba(4,6,14,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--line);transition:background .3s,border-color .3s}
nav.up{background:rgba(4,6,14,.88)}
[data-theme="light"] nav{background:rgba(240,244,252,.78);border-color:rgba(12,22,40,.09)}
[data-theme="light"] nav.up{background:rgba(240,244,252,.94)}
.logo{display:flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;font-size:30px;font-weight:600;color:var(--text);letter-spacing:-.025em;text-decoration:none}
.logo svg{width:36px;height:36px;flex-shrink:0}
.nav-r{display:flex;align-items:center;gap:34px}
.nav-links{display:flex;gap:30px;list-style:none}
.nav-links>li>a{font-size:13.5px;color:var(--dim);text-decoration:none;transition:color .2s}
.nav-links>li>a:hover,.nav-links>li>a.active{color:var(--text)}
.nav-btn{padding:8px 18px;border:1px solid var(--line);border-radius:6px;font-size:13.5px;color:var(--text);text-decoration:none;transition:border-color .2s,background .2s}
.nav-btn:hover{border-color:rgba(79,168,255,.4);background:var(--acg)}
[data-theme="light"] .nav-btn:hover{border-color:rgba(26,142,224,.35);background:var(--acg)}
.theme-toggle{width:34px;height:34px;border-radius:8px;border:1px solid var(--line);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--dim);flex-shrink:0;transition:color .2s,border-color .2s,background .2s}
.theme-toggle:hover{color:var(--text);border-color:var(--lineb);background:var(--acg)}
.theme-toggle svg{width:16px;height:16px}
.icon-sun{display:none}
[data-theme="light"] .icon-moon{display:none}
[data-theme="light"] .icon-sun{display:block}
.nav-hamburger{display:none;flex-direction:column;gap:5px;width:34px;height:34px;align-items:center;justify-content:center;color:var(--text)}
.nav-hamburger span{display:block;width:18px;height:1.5px;background:currentColor;border-radius:2px;transition:transform .25s,opacity .25s}
.nav-hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.nav-hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.nav-hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
/* ── Dropdown ── */
.nav-has-dd{position:relative}
.nav-dd-trigger{display:inline-flex!important;align-items:center;gap:4px;cursor:default}
.nav-dd-chev{transition:transform .22s cubic-bezier(.16,1,.3,1);flex-shrink:0;opacity:.6}
.nav-has-dd.dd-open .nav-dd-chev{transform:rotate(180deg);opacity:1}
.nav-dd{
  position:absolute;top:calc(100% + 16px);left:50%;transform:translateX(-50%) translateY(-8px);
  background:rgba(7,10,22,.96);backdrop-filter:blur(28px) saturate(1.6);-webkit-backdrop-filter:blur(28px) saturate(1.6);
  border:1px solid rgba(226,234,248,.08);border-radius:14px;padding:6px;
  min-width:230px;
  opacity:0;pointer-events:none;
  transition:opacity .2s cubic-bezier(.16,1,.3,1),transform .2s cubic-bezier(.16,1,.3,1);
  box-shadow:0 16px 48px rgba(0,0,0,.5),0 4px 16px rgba(0,0,0,.3);
  z-index:1100
}
.nav-has-dd.dd-open .nav-dd{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
[data-theme="light"] .nav-dd{background:rgba(246,249,255,.97);border-color:rgba(12,22,40,.09);box-shadow:0 12px 40px rgba(12,22,80,.12),0 3px 10px rgba(12,22,80,.07)}
.nav-dd-item{display:flex;align-items:flex-start;gap:11px;padding:10px 11px;border-radius:9px;text-decoration:none;transition:background .15s}
.nav-dd-item:hover{background:rgba(79,168,255,.07)}
.nav-dd-item.active{background:rgba(79,168,255,.08)}
[data-theme="light"] .nav-dd-item:hover{background:rgba(26,142,224,.07)}
[data-theme="light"] .nav-dd-item.active{background:rgba(26,142,224,.08)}
.nav-dd-icon{width:30px;height:30px;border-radius:8px;background:rgba(79,168,255,.09);border:1px solid rgba(79,168,255,.14);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.nav-dd-icon svg{width:14px;height:14px;color:var(--ac)}
[data-theme="light"] .nav-dd-icon{background:rgba(26,142,224,.08);border-color:rgba(26,142,224,.16)}
.nav-dd-name{font-size:13px;font-weight:500;color:var(--text);display:block;line-height:1.3;margin-bottom:2px}
.nav-dd-desc{font-size:11.5px;font-weight:300;color:var(--dim);display:block;line-height:1.45}
.nav-dd-sep{height:1px;background:rgba(226,234,248,.06);margin:4px 5px}
[data-theme="light"] .nav-dd-sep{background:rgba(12,22,40,.07)}
/* Mobile */
@media(max-width:768px){
  nav{padding:16px 20px}
  .nav-btn{display:none}
  .nav-links{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(4,6,14,.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);flex-direction:column;gap:0;padding:80px 0 24px;overflow-y:auto;z-index:1001;list-style:none}
  .nav-links.open{display:flex}
  .nav-links>li{border-bottom:1px solid var(--line)}
  .nav-links>li>a{display:block;padding:16px 24px;font-size:16px;color:var(--mid)}
  .nav-links>li>a:hover{color:var(--text);background:var(--acg)}
  [data-theme="light"] .nav-links{background:rgba(240,244,252,.97)}
  [data-theme="light"] .nav-links>li{border-color:rgba(12,22,40,.08)}
  .nav-hamburger{display:flex}
  /* Dropdown in mobile — static inline, no animation */
  .nav-has-dd{display:contents}
  .nav-dd-trigger{display:none!important}
  .nav-dd{position:static;opacity:1;pointer-events:auto;transform:none;background:none;backdrop-filter:none;-webkit-backdrop-filter:none;border:none;padding:0;border-radius:0;min-width:0;box-shadow:none}
  .nav-dd-item{border-radius:0;padding:16px 24px 16px 42px;border-bottom:1px solid var(--line)}
  .nav-dd-item:last-child{border-bottom:none}
  .nav-dd-icon{display:none}
  .nav-dd-name{font-size:15px;font-weight:400;color:var(--mid);margin:0}
  .nav-dd-desc{display:none}
}
</style>`;

  var html = css + `
<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true">
  <defs>
    <linearGradient id="atrya-lg" x1="10" y1="6" x2="90" y2="94" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="var(--logo-g1)"/>
      <stop offset="52%"  stop-color="var(--logo-g2)"/>
      <stop offset="100%" stop-color="var(--logo-g3)"/>
    </linearGradient>
  </defs>
</svg>
<nav id="nav">
  <a class="logo" href="${logoHref}">
    <svg viewBox="0 0 100 100" fill="none">
      <path fill="url(#atrya-lg)" d="M11.9,47 L11.9,33 Q11.9,28 16.2,25.5 L45.7,8.5 Q50,6 54.3,8.5 L83.8,25.5 Q88.1,28 88.1,33 L88.1,47 C74,47 63,22 50,22 C37,22 26,47 11.9,47Z"/>
      <path fill="url(#atrya-lg)" d="M11.9,53 L11.9,67 Q11.9,72 16.2,74.5 L45.7,91.5 Q50,94 54.3,91.5 L83.8,74.5 Q88.1,72 88.1,67 L88.1,53 C74,53 63,78 50,78 C37,78 26,53 11.9,53Z"/>
    </svg>
    Atrya
  </a>
  <div class="nav-r">
    <ul class="nav-links" id="nav-links">
      <li><a href="${feat}">Features</a></li>
      <li class="nav-has-dd">
        <a href="${uc}" class="nav-dd-trigger${isUC ? ' active' : ''}">
          Use Cases
          <svg class="nav-dd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><polyline points="6 9 12 15 18 9"/></svg>
        </a>
        <div class="nav-dd" role="menu">
          <a href="/agentic" class="nav-dd-item${isAgentic ? ' active' : ''}" role="menuitem">
            <div class="nav-dd-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <span class="nav-dd-name">Agentic</span>
              <span class="nav-dd-desc">Execution engine for AI agents</span>
            </div>
          </a>
          <div class="nav-dd-sep"></div>
          <a href="/cross-border" class="nav-dd-item${isCrossB ? ' active' : ''}" role="menuitem">
            <div class="nav-dd-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <span class="nav-dd-name">Cross-Border</span>
              <span class="nav-dd-desc">Global B2B payouts via HansePay</span>
            </div>
          </a>
        </div>
      </li>
      <li><a href="${vis}">Vision</a></li>
      <li><a href="${abt}">About</a></li>
      <li><a href="/investors-v2"${isInvestors ? ' class="active"' : ''}>Investors</a></li>
    </ul>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
    <a class="nav-btn" href="waitlist.html">Join Beta</a>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open navigation">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>`;

  document.currentScript.insertAdjacentHTML('afterend', html);

  /* THEME */
  (function () {
    var root  = document.documentElement;
    var saved = localStorage.getItem('atrya-theme');
    var dark  = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'light' || (saved === null && !dark)) root.setAttribute('data-theme', 'light');

    document.getElementById('theme-toggle').addEventListener('click', function () {
      var light = root.getAttribute('data-theme') === 'light';
      if (light) { root.removeAttribute('data-theme');         localStorage.setItem('atrya-theme', 'dark');  }
      else        { root.setAttribute('data-theme', 'light');  localStorage.setItem('atrya-theme', 'light'); }
      window.dispatchEvent(new CustomEvent('themechange', { detail: { light: !light } }));
    });
  })();

  /* NAV SCROLL */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () { nav.classList.toggle('up', window.scrollY > 10); }, { passive: true });

  /* HAMBURGER */
  (function () {
    var btn   = document.getElementById('nav-hamburger');
    var links = document.querySelector('.nav-links');
    var navR  = document.querySelector('.nav-r');
    if (!btn || !links || !navR) return;

    function close() {
      if (!navR.contains(links)) navR.insertBefore(links, navR.firstChild);
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
      var open = btn.classList.toggle('open');
      if (open) {
        document.body.appendChild(links);
        links.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        close();
      }
    });

    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  })();

  /* DROPDOWN — JS-driven with grace period so gap doesn't close menu */
  (function () {
    var has = document.querySelector('.nav-has-dd');
    if (!has) return;
    var t;
    has.addEventListener('mouseenter', function () { clearTimeout(t); has.classList.add('dd-open'); });
    has.addEventListener('mouseleave', function () { t = setTimeout(function () { has.classList.remove('dd-open'); }, 150); });
  })();
})();
