/* ==========================================================================
   Marta Lisovska — site behaviour
   Vanilla JS, no dependencies.

   The self-check is the part that needed care rather than cleverness. It is
   not a diagnostic instrument and must never read like one: it reflects back
   what the person just said, names it as common, and offers a next step. When
   the answers suggest someone is having a hard time right now, it surfaces the
   crisis contacts instead of a booking button.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- strings that only exist in JS ------------------------------ */

  var S = {
    en: {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      message: 'A couple more sentences will help me answer properly.',
      consent: 'Please tick this box so I can reply to you.',
      sending: 'Sending…',
      answered: 'Answered {done} of {total}',
      finishFirst: 'Please answer all six before seeing the result.',
      lowT: 'Nothing here suggests you need therapy right now',
      lowB: 'From what you have marked, things sound broadly manageable. That is worth noticing rather than dismissing. If you would still like to talk something through, a single consultation is a perfectly ordinary reason to get in touch — you do not have to be in crisis to come.',
      midT: 'This is what most people bring to a first session',
      midB: 'What you have marked is the ordinary content of therapy, not an unusual case. A first consultation is fifty minutes of working out what is going on and whether we are a good fit — it commits you to nothing beyond that hour.',
      highT: 'It sounds like things are hard right now',
      highB: 'Several of your answers point to a period that is heavy to carry alone. That is worth taking seriously and worth taking soon — either with me or with someone else. If at any point it feels unbearable rather than difficult, please use the contacts below straight away; they are staffed around the clock and you do not have to explain yourself.',
      notDiagnosis: 'This is not a diagnosis and not a test. Six questions cannot assess anybody. It only reflects back what you just said.'
    },
    ru: {
      required: 'Это поле обязательно.',
      email: 'Введите корректный адрес электронной почты.',
      message: 'Ещё пара предложений поможет ответить по делу.',
      consent: 'Отметьте это поле, чтобы я могла вам ответить.',
      sending: 'Отправляем…',
      answered: 'Отмечено {done} из {total}',
      finishFirst: 'Пожалуйста, ответьте на все шесть вопросов.',
      lowT: 'Ничего из этого не говорит, что вам нужна терапия прямо сейчас',
      lowB: 'Судя по отмеченному, вы более-менее справляетесь. Это стоит заметить, а не отмахнуться. Если всё-таки хочется что-то проговорить — одна консультация это совершенно обычный повод обратиться. Быть в кризисе, чтобы прийти, не обязательно.',
      midT: 'С этим и приходят на первую встречу',
      midB: 'То, что вы отметили, — обычное содержание терапии, а не редкий случай. Первая консультация это пятьдесят минут на то, чтобы разобраться, что происходит и подходим ли мы друг другу. Ни к чему, кроме этого часа, она вас не обязывает.',
      highT: 'Похоже, сейчас вам тяжело',
      highB: 'Несколько ответов говорят о периоде, который трудно нести в одиночку. К этому стоит отнестись серьёзно и не откладывать — со мной или с кем-то другим. И если в какой-то момент станет не трудно, а невыносимо, воспользуйтесь контактами ниже сразу: они работают круглосуточно, и объяснять себя там не нужно.',
      notDiagnosis: 'Это не диагноз и не тест. Шесть вопросов не могут никого оценить. Они только возвращают вам то, что вы сами отметили.'
    }
  };

  function lang() { return root.getAttribute('data-lang') || 'en'; }
  function s(key) { return (S[lang()] || S.en)[key] || S.en[key] || key; }

  /* ---------- theme ------------------------------------------------------ */

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ml-theme', next); } catch (e) {}
    });
  });

  /* ---------- sticky header ---------------------------------------------- */

  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 6); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile menu ------------------------------------------------- */

  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    navToggle.addEventListener('click', function () { setMenu(!mobileMenu.classList.contains('is-open')); });
    mobileMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 920) setMenu(false); });
  }

  /* ---------- FAQ ---------------------------------------------------------- */

  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.classList.toggle('is-open', !open);
    });
  });

  /* ---------- reveal -------------------------------------------------------- */

  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (!('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ==========================================================================
     Self-check
     ========================================================================== */

  /* The widget, not the section around it — the data-* labels live on the
     widget, and reading them from the section silently yields null hrefs. */
  var check = document.getElementById('self-check-widget');

  if (check) {
    var questions = check.querySelectorAll('.check__q');
    var total = questions.length;
    var progress = check.querySelector('[data-check-progress]');
    var showBtn = check.querySelector('[data-check-show]');
    var resetBtn = check.querySelector('[data-check-reset]');
    var result = check.querySelector('.check__result');
    var resultTitle = result.querySelector('[data-result-title]');
    var resultBody = result.querySelector('[data-result-body]');
    var resultActions = result.querySelector('.check__actions');
    var hint = check.querySelector('[data-check-hint]');

    function answers() {
      return Array.prototype.map.call(questions, function (q) {
        var picked = q.querySelector('input:checked');
        return picked ? Number(picked.value) : null;
      });
    }

    function updateProgress() {
      var done = answers().filter(function (v) { return v !== null; }).length;
      progress.textContent = s('answered').replace('{done}', done).replace('{total}', total);
      if (hint && done === total) hint.textContent = '';
    }

    function band(score) {
      if (score <= 3) return 'low';
      if (score <= 8) return 'mid';
      return 'high';
    }

    function render() {
      var values = answers();
      if (values.some(function (v) { return v === null; })) {
        if (hint) hint.textContent = s('finishFirst');
        var firstEmpty = Array.prototype.filter.call(questions, function (q) {
          return !q.querySelector('input:checked');
        })[0];
        if (firstEmpty) firstEmpty.querySelector('input').focus();
        return;
      }

      var score = values.reduce(function (a, b) { return a + b; }, 0);
      var b = band(score);

      resultTitle.textContent = s(b + 'T');
      resultBody.textContent = s(b + 'B');

      /* The high band gets the crisis contacts first and the booking link
         second — in that order, deliberately. */
      resultActions.innerHTML = '';
      if (b === 'high') {
        resultActions.appendChild(link('#crisis', check.getAttribute('data-label-crisis'), 'btn'));
        resultActions.appendChild(link(check.getAttribute('data-contact-url'), check.getAttribute('data-label-book'), 'btn btn--outline'));
      } else {
        resultActions.appendChild(link(check.getAttribute('data-contact-url'), check.getAttribute('data-label-book'), 'btn'));
        resultActions.appendChild(link('#how', check.getAttribute('data-label-how'), 'btn btn--outline'));
      }

      result.hidden = false;
      result.setAttribute('tabindex', '-1');
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function link(href, text, cls) {
      var a = document.createElement('a');
      a.className = cls;
      a.href = href;
      a.textContent = text;
      return a;
    }

    check.querySelectorAll('.check__q input').forEach(function (input) {
      input.addEventListener('change', updateProgress);
    });

    showBtn.addEventListener('click', render);

    resetBtn.addEventListener('click', function () {
      check.querySelectorAll('.check__q input:checked').forEach(function (i) { i.checked = false; });
      result.hidden = true;
      if (hint) hint.textContent = '';
      updateProgress();
      check.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('languagechange', function () {
      updateProgress();
      if (!result.hidden) render();
    });

    updateProgress();
  }

  /* ==========================================================================
     Contact form
     ========================================================================== */

  var form = document.querySelector('[data-validate]');
  if (form) {
    var showError = function (field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('has-error', Boolean(message));
      var slot = wrap.querySelector('.error');
      if (slot) slot.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    var validateField = function (field) {
      var value = (field.value || '').trim();
      if (field.required && !value) { showError(field, s('required')); return false; }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showError(field, s('email')); return false;
      }
      if (field.name === 'message' && value && value.length < 15) {
        showError(field, s('message')); return false;
      }
      showError(field, '');
      return true;
    };

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      if (field.type === 'checkbox') return;
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap && wrap.classList.contains('has-error')) validateField(field);
      });
    });

    document.addEventListener('languagechange', function () {
      form.querySelectorAll('.field.has-error').forEach(function (wrap) {
        var f = wrap.querySelector('input, textarea, select');
        if (f) validateField(f);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = Array.prototype.slice.call(
        form.querySelectorAll('input[required], textarea[required], select[required]')
      ).filter(function (f) { return f.type !== 'checkbox'; });

      var ok = fields.map(validateField).every(Boolean);

      var consent = form.querySelector('input[name="consent"]');
      var consentError = document.getElementById('consent-error');
      if (consent && !consent.checked) {
        if (consentError) consentError.textContent = s('consent');
        ok = false;
      } else if (consentError) {
        consentError.textContent = '';
      }

      if (!ok) {
        var bad = form.querySelector('.has-error input, .has-error textarea');
        if (bad) bad.focus();
        return;
      }

      // Demo build: nothing is sent anywhere.
      var btn = form.querySelector('[type="submit"]');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = s('sending'); }

      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = original; }
        var success = document.querySelector('.form-success');
        if (success) {
          success.classList.add('is-visible');
          success.setAttribute('tabindex', '-1');
          success.focus();
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 650);
    });
  }

  /* ---------- year ---------------------------------------------------------- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
