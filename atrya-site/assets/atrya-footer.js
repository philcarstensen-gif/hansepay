(function () {
  var html = `
<footer id="about">
  <div class="ft-brand">
    <svg viewBox="0 0 100 100" fill="none" width="52" height="52" aria-hidden="true" style="margin-bottom:4px">
      <path fill="url(#atrya-lg)" d="M11.9,47 L11.9,33 Q11.9,28 16.2,25.5 L45.7,8.5 Q50,6 54.3,8.5 L83.8,25.5 Q88.1,28 88.1,33 L88.1,47 C74,47 63,22 50,22 C37,22 26,47 11.9,47Z"/>
      <path fill="url(#atrya-lg)" d="M11.9,53 L11.9,67 Q11.9,72 16.2,74.5 L45.7,91.5 Q50,94 54.3,91.5 L83.8,74.5 Q88.1,72 88.1,67 L88.1,53 C74,53 63,78 50,78 C37,78 26,53 11.9,53Z"/>
    </svg>
    <span class="fl">Atrya</span>
    <span class="fc">Europe's first regulated on-chain FX facility.<br>Building programmable money infrastructure.</span>
  </div>
  <div class="ft-col">
    <span class="ft-col-label">Product</span>
    <div class="flinks">
      <a href="index.html#usecases">Use Cases</a>
      <a href="agentic.html">Agentic Payments</a>
    </div>
  </div>
  <div class="ft-col">
    <span class="ft-col-label">Company</span>
    <div class="flinks">
      <a href="index.html#vision">Vision</a>
      <a href="index.html#about">About</a>
      <a href="imprint.html">Imprint</a>
    </div>
  </div>
  <div class="ft-col ft-get-in-touch">
    <span class="ft-col-label">Get In Touch</span>
    <div class="flinks">
      <a href="mailto:hello@atrya.io" style="color:var(--dim)">hello@atrya.io</a>
      <a href="https://www.linkedin.com/company/atrya-infrastructure" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </div>
    <span class="fc" style="margin-top:14px;display:block">Caplend Technologies GmbH<br>c/o Factory Works GmbH<br>Stadtdeich 2-4<br>20097 Hamburg<br>Germany</span>
  </div>
  <div class="ft-bottom">
    <span class="ft-copy">&copy; 2026 Caplend Technologies GmbH &middot; HRB 185277 Amtsgericht Hamburg</span>
    <div class="flinks" style="flex-direction:row;gap:20px"><a href="cookie-policy.html">Cookies</a><a href="imprint.html">Imprint</a></div>
  </div>
</footer>

<div class="cookie-banner" id="cookie-banner">
  <span>We use cookies to remember your theme preference. Fonts are loaded via <a href="https://fonts.google.com" target="_blank" rel="noopener">Google Fonts</a>. See our <a href="cookie-policy.html">Cookie Policy</a>.</span>
  <button class="cookie-btn" id="cookie-accept">Accept</button>
</div>`;

  document.currentScript.insertAdjacentHTML('beforebegin', html);

  /* COOKIE BANNER */
  (function () {
    var banner = document.getElementById('cookie-banner');
    var btn    = document.getElementById('cookie-accept');
    if (!banner || !btn) return;
    if (localStorage.getItem('atrya-cookies')) banner.classList.add('hidden');
    btn.addEventListener('click', function () {
      localStorage.setItem('atrya-cookies', '1');
      banner.classList.add('hidden');
    });
  })();
})();
