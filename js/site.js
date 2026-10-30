// Gemeinsames Verhalten aller Seiten: Header, Mobile-Menü, Erscheinen, FAQ-Akkordeon.
(function () {
  document.documentElement.classList.add('js');

  // ---- Header: Zustand beim Scrollen ----
  // Über dem senfgelben Hero bleibt der Header senfgelb, danach wechselt er auf Kalkweiss.
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero, .page-hero');
  function onScroll() {
    if (!header) return;
    var limit = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight : 24;
    header.classList.toggle('is-scrolled', window.scrollY > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile-Menü ----
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    nav.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1041px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ---- Erscheinen beim Scrollen (Inhalte sind ohne JS sichtbar) ----
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---- FAQ-Akkordeon ----
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger, i) {
    var item = trigger.closest('.accordion-item');
    var body = item && item.querySelector('.accordion-body');
    if (!item || !body) return;
    var id = 'faq-panel-' + i;
    body.id = id;
    trigger.setAttribute('aria-controls', id);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function () {
      var open = !item.classList.contains('active');
      item.classList.toggle('active', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  // ---- Sprungziel aus der URL sofort anfahren, danach sanftes Scrollen freischalten ----
  var userScrolled = false;
  ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { userScrolled = true; }, { once: true, passive: true });
  });
  function onLoaded() {
    var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && !userScrolled) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    requestAnimationFrame(function () { document.documentElement.classList.add('is-loaded'); });
  }
  if (document.readyState === 'complete') onLoaded();
  else window.addEventListener('load', onLoaded);

  // ---- Jahr im Footer ----
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
