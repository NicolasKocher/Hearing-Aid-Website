// Startseite: Öffnungsstatus, Audiogramm, Hörprobe, Kontaktformular, Karte, Lightbox.
(function () {
  'use strict';

  // ---- Öffnungszeiten (Minuten seit Mitternacht, Zeitzone Zürich) ----
  var HOURS = {
    1: [[540, 720], [780, 1020]],
    2: [[540, 720], [780, 1020]],
    3: [[540, 720]],
    4: [[540, 720], [780, 1020]],
    5: [[540, 720]]
  };
  var DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function zurichNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var get = function (type) { return parts.filter(function (p) { return p.type === type; })[0].value; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: day, minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
  }
  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  (function openingStatus() {
    var el = document.getElementById('openStatus');
    var now;
    try { now = zurichNow(); } catch (e) { return; }

    var row = document.querySelector('#hoursTable tr[data-days="' + now.day + '"]');
    if (row) row.classList.add('is-today');
    if (!el) return;

    var text = el.querySelector('.status-text');
    var today = HOURS[now.day] || [];
    var open = today.filter(function (r) { return now.minutes >= r[0] && now.minutes < r[1]; })[0];
    var later = today.filter(function (r) { return now.minutes < r[0]; })[0];

    if (open) {
      el.classList.add('is-open');
      text.textContent = 'Jetzt geöffnet bis ' + fmt(open[1]) + ' Uhr';
    } else if (later) {
      text.textContent = (now.minutes >= 720 ? 'Mittagspause, ab ' : 'Heute ab ') + fmt(later[0]) + ' Uhr geöffnet';
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (now.day + i) % 7;
        if (HOURS[d]) {
          text.textContent = 'Geschlossen, öffnet ' + (i === 1 ? 'morgen' : 'am ' + DAY_NAMES[d]) + ' um ' + fmt(HOURS[d][0][0]) + ' Uhr';
          break;
        }
      }
    }
  })();

  // ---- Audiogramm: die Kurve hebt sich, sobald sie sichtbar ist ----
  (function audiogram() {
    var ag = document.querySelector('.audiogram');
    if (!ag) return;
    var rise = function () { ag.classList.add('is-risen'); };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { rise(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { setTimeout(rise, 450); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(ag);
  })();

  // ---- Hörprobe: synthetische Klangszene durch einen Tiefpass ----
  (function hearingProbe() {
    var playBtn = document.getElementById('probePlay');
    var spectrum = document.getElementById('spectrum');
    if (!playBtn || !spectrum) return;
    var label = playBtn.querySelector('.probe-play-label');
    var levels = Array.prototype.slice.call(document.querySelectorAll('.probe-levels [role="radio"]'));
    var bands = Array.prototype.slice.call(spectrum.querySelectorAll('.band'));
    var statusTitle = document.getElementById('probeStatus');
    var statusText = document.getElementById('probeStatusText');
    var STATUS = [
      'alle Geräusche der Hörprobe sind zu hören.',
      'Vogelgezwitscher und das Ticken der Uhr werden leise und dumpf. Das Brummen bleibt.',
      'Nur noch das tiefe Brummen ist deutlich. Auch Sprache verliert ihre Konsonanten.',
      'Alles klingt gedämpft wie durch eine Wand. Selbst die Vokale einer Stimme gehen verloren.'
    ];

    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { playBtn.hidden = true; }

    var ctx, master, lp1, lp2, noise, timer, nextTick, nextBird, tickHigh = false;
    var cutoff = 20000;

    function pos(f) { return Math.max(0, Math.min(100, (Math.log10(f) - 2) / 2 * 100)); }

    function setup() {
      ctx = new AC();
      lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.Q.value = 0.7;
      lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.Q.value = 0.7;
      master = ctx.createGain(); master.gain.value = 0;
      lp1.connect(lp2); lp2.connect(master); master.connect(ctx.destination);
      applyCutoff(true);

      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var data = noise.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      // Tiefes Brummen (Kühlschrank): bleibt bei jedem Hörverlust hörbar
      var hum = ctx.createGain(); hum.gain.value = 0.05; hum.connect(lp1);
      [100, 200, 300].forEach(function (f, i) {
        var o = ctx.createOscillator(); o.frequency.value = f;
        var g = ctx.createGain(); g.gain.value = [1, 0.45, 0.15][i];
        o.connect(g); g.connect(hum); o.start();
      });
    }

    function applyCutoff(instant) {
      if (!ctx) return;
      var f = Math.min(cutoff, ctx.sampleRate / 2 - 200);
      [lp1, lp2].forEach(function (lp) {
        if (instant) lp.frequency.value = f;
        else lp.frequency.setTargetAtTime(f, ctx.currentTime, 0.12);
      });
    }

    function tick(t) {
      tickHigh = !tickHigh;
      var src = ctx.createBufferSource(); src.buffer = noise;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = tickHigh ? 4400 : 3400; bp.Q.value = 5;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1.6, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      src.connect(bp); bp.connect(g); g.connect(lp1);
      src.start(t, Math.random() * 0.9, 0.06);
    }

    function birdPhrase(t) {
      var n = 3 + Math.floor(Math.random() * 5);
      var base = 3600 + Math.random() * 1400;
      var up = Math.random() > 0.4;
      for (var i = 0; i < n; i++) {
        var st = t + i * (0.09 + Math.random() * 0.04);
        var o = ctx.createOscillator(); o.type = 'sine';
        var f0 = base + Math.random() * 500;
        o.frequency.setValueAtTime(up ? f0 : f0 * 1.5, st);
        o.frequency.exponentialRampToValueAtTime(up ? f0 * 1.5 : f0, st + 0.07);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.11, st + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.085);
        o.connect(g); g.connect(lp1);
        o.start(st); o.stop(st + 0.1);
      }
      return n * 0.12;
    }

    function schedule() {
      var horizon = ctx.currentTime + 0.25;
      while (nextTick < horizon) { tick(nextTick); nextTick += 0.5; }
      while (nextBird < horizon) { nextBird += birdPhrase(nextBird) + 0.8 + Math.random() * 1.8; }
    }

    function start() {
      if (!ctx) setup();
      ctx.resume();
      nextTick = ctx.currentTime + 0.1;
      nextBird = ctx.currentTime + 0.3;
      schedule();
      timer = setInterval(schedule, 60);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.7, ctx.currentTime, 0.08);
      playBtn.setAttribute('aria-pressed', 'true');
      label.textContent = 'Hörprobe anhalten';
    }

    function stop() {
      clearInterval(timer);
      if (ctx) {
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        setTimeout(function () { if (playBtn.getAttribute('aria-pressed') === 'false') ctx.suspend(); }, 400);
      }
      playBtn.setAttribute('aria-pressed', 'false');
      label.textContent = 'Hörprobe starten';
    }

    playBtn.addEventListener('click', function () {
      if (playBtn.getAttribute('aria-pressed') === 'true') stop(); else start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && playBtn.getAttribute('aria-pressed') === 'true') stop();
    });

    function selectLevel(btn, focus) {
      var idx = levels.indexOf(btn);
      levels.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) btn.focus();
      cutoff = parseFloat(btn.getAttribute('data-cutoff'));
      var cut = pos(cutoff);
      spectrum.style.setProperty('--cut', cut + '%');
      spectrum.setAttribute('data-level', String(idx));
      bands.forEach(function (band) {
        var a = parseFloat(band.style.getPropertyValue('--a'));
        var b = parseFloat(band.style.getPropertyValue('--b'));
        band.classList.toggle('is-lost', (a + b) / 2 > cut);
      });
      if (statusTitle) statusTitle.textContent = btn.getAttribute('data-label') + ':';
      if (statusText) statusText.textContent = STATUS[idx];
      applyCutoff(false);
    }

    levels.forEach(function (btn, i) {
      btn.tabIndex = btn.getAttribute('aria-checked') === 'true' ? 0 : -1;
      btn.addEventListener('click', function () { selectLevel(btn, false); });
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = levels[(i + 1) % levels.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = levels[(i - 1 + levels.length) % levels.length];
        if (next) { e.preventDefault(); selectLevel(next, true); }
      });
    });
  })();

  // ---- Navigation: aktiven Abschnitt markieren ----
  (function activeNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  })();

  // ---- Kontaktformular: Validierung + Versand über Web3Forms ----
  (function contactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var submitBtn = document.getElementById('formSubmitBtn');
    var successMsg = document.getElementById('formSuccess');
    var failMsg = document.getElementById('formFail');
    var captchaError = document.getElementById('error_captcha');

    var fields = [
      { input: document.getElementById('contact_name'), error: document.getElementById('error_name'), msg: 'Bitte geben Sie Ihren Namen ein (mindestens 2 Zeichen).' },
      { input: document.getElementById('contact_email'), error: document.getElementById('error_email'), msg: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, z. B. name@beispiel.ch.' },
      { input: document.getElementById('contact_message'), error: document.getElementById('error_message'), msg: 'Bitte schreiben Sie eine kurze Nachricht (mindestens 10 Zeichen).' }
    ];

    function setError(f, show) {
      f.input.classList.toggle('is-invalid', show);
      f.input.setAttribute('aria-invalid', String(show));
      f.error.textContent = show ? f.msg : '';
    }

    fields.forEach(function (f) {
      f.input.addEventListener('input', function () { if (f.input.validity.valid) setError(f, false); });
      f.input.addEventListener('blur', function () {
        if (f.input.value.trim() && !f.input.validity.valid) setError(f, true);
      });
    });

    function captchaToken() {
      var el = form.querySelector('textarea[name="h-captcha-response"]');
      return el ? el.value.trim() : '';
    }

    function validateAll() {
      var valid = true;
      fields.forEach(function (f) {
        var bad = !f.input.validity.valid || !f.input.value.trim();
        setError(f, bad);
        if (bad) valid = false;
      });
      if (!captchaToken()) {
        if (captchaError) captchaError.textContent = 'Bitte bestätigen Sie, dass Sie kein Roboter sind.';
        valid = false;
      } else if (captchaError) {
        captchaError.textContent = '';
      }
      return valid;
    }

    function setLoading(on) {
      submitBtn.disabled = on;
      submitBtn.querySelector('.btn-icon-send').style.display = on ? 'none' : '';
      submitBtn.querySelector('.btn-spinner').hidden = !on;
      submitBtn.querySelector('.btn-text').textContent = on ? 'Wird gesendet …' : 'Nachricht senden';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successMsg.hidden = true;
      failMsg.hidden = true;

      if (!validateAll()) {
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      setLoading(true);
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (response) {
          return response.json().then(function (data) { return { ok: response.ok, data: data }; });
        })
        .then(function (res) {
          if (res.ok && res.data && res.data.success) {
            form.hidden = true;
            successMsg.hidden = false;
          } else {
            throw new Error((res.data && res.data.message) || 'Server error');
          }
        })
        .catch(function () {
          failMsg.hidden = false;
          try { if (window.hcaptcha) window.hcaptcha.reset(); } catch (err) {}
        })
        .finally(function () { setLoading(false); });
    });
  })();

  // ---- Google Maps: erst nach Einwilligung laden ----
  (function consentMap() {
    var container = document.getElementById('mapContainer');
    var consent = document.getElementById('mapConsent');
    var btn = document.getElementById('mapConsentBtn');
    if (!container || !btn) return;

    function loadMap() {
      consent.remove();
      var iframe = document.createElement('iframe');
      iframe.src = 'https://maps.google.com/maps?q=Alte%20Landstrasse%2014%2C%208810%20Horgen&z=17&hl=de&output=embed';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.title = 'Standort der Hörschmiede Boo GmbH auf Google Maps';
      container.appendChild(iframe);
      try { localStorage.setItem('maps_consent', '1'); } catch (e) {}
    }

    try { if (localStorage.getItem('maps_consent') === '1') { loadMap(); return; } } catch (e) {}
    btn.addEventListener('click', loadMap);
  })();

  // ---- Lightbox für die Wegbeschreibungen ----
  (function lightbox() {
    var dialog = document.getElementById('lightbox');
    var img = document.getElementById('lightboxImg');
    var close = document.getElementById('lightboxClose');
    if (!dialog || !img || typeof dialog.showModal !== 'function') return;

    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var thumb = trigger.querySelector('img');
        img.src = trigger.getAttribute('data-lightbox');
        img.alt = thumb ? thumb.alt : '';
        dialog.showModal();
      });
    });
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { img.removeAttribute('src'); });
  })();
})();
