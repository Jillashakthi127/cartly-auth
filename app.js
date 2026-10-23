/* Cartly auth pages — front-end only demo (no backend calls). */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MOBILE_RE = /^\d{10}$/;
  var $ = function (id) { return document.getElementById(id); };

  function isValidId(v) {
    v = v.trim();
    return MOBILE_RE.test(v) || EMAIL_RE.test(v);
  }

  function setInvalid(fieldId, invalid) {
    var f = $(fieldId);
    f.classList.toggle('invalid', invalid);
    var input = f.querySelector('input');
    if (input) input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    return invalid;
  }

  function clearOnInput(fieldId) {
    var input = $(fieldId).querySelector('input');
    input.addEventListener('input', function () { setInvalid(fieldId, false); });
  }

  function digitsOnly(input, max) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, max);
    });
  }

  function showStep(steps, id) {
    steps.forEach(function (s) { $(s).hidden = s !== id; });
    var first = $(id).querySelector('input');
    if (first) first.focus();
  }

  function bindPasswordToggles() {
    document.querySelectorAll('[data-toggle-pass]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = $(btn.getAttribute('data-toggle-pass'));
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  }

  function bindResend() {
    document.querySelectorAll('[data-resend]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var seconds = 30;
        btn.disabled = true;
        btn.textContent = 'Resend in ' + seconds + 's';
        var t = setInterval(function () {
          seconds -= 1;
          if (seconds <= 0) {
            clearInterval(t);
            btn.disabled = false;
            btn.textContent = 'Resend OTP';
          } else {
            btn.textContent = 'Resend in ' + seconds + 's';
          }
        }, 1000);
      });
    });
  }

  function formatTarget(v) {
    v = v.trim();
    return MOBILE_RE.test(v) ? '+91 ' + v : v;
  }

  function initLogin() {
    var steps = ['step-id', 'step-pass', 'step-otp', 'step-done'];
    var idInput = $('login-id');
    var id2Input = $('login-id2');
    var otpInput = $('login-otp');

    ['f-id', 'f-id2', 'f-pw', 'f-otp'].forEach(clearOnInput);
    digitsOnly(otpInput, 6);
    bindPasswordToggles();
    bindResend();

    $('step-id').addEventListener('submit', function (e) {
      e.preventDefault();
      if (setInvalid('f-id', !isValidId(idInput.value))) { idInput.focus(); return; }
      $('otp-target').textContent = formatTarget(idInput.value);
      otpInput.value = '';
      showStep(steps, 'step-otp');
    });

    $('use-password').addEventListener('click', function () {
      id2Input.value = idInput.value;
      showStep(steps, 'step-pass');
    });

    $('use-otp').addEventListener('click', function () {
      idInput.value = id2Input.value;
      showStep(steps, 'step-id');
    });

    $('step-pass').addEventListener('submit', function (e) {
      e.preventDefault();
      var badId = setInvalid('f-id2', !isValidId(id2Input.value));
      var badPw = setInvalid('f-pw', !$('login-pw').value);
      if (badId || badPw) return;
      showStep(steps, 'step-done');
    });

    $('step-otp').addEventListener('submit', function (e) {
      e.preventDefault();
      if (setInvalid('f-otp', !/^\d{6}$/.test(otpInput.value))) { otpInput.focus(); return; }
      showStep(steps, 'step-done');
    });

    document.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { showStep(steps, 'step-id'); });
    });
  }

  function initSignup() {
    var steps = ['step-form', 'step-otp', 'step-done'];
    var name = $('su-name'), mobile = $('su-mobile'), email = $('su-email'), pass = $('su-pass');
    var otpInput = $('su-otp');

    ['f-name', 'f-mobile', 'f-email', 'f-pass', 'f-otp'].forEach(clearOnInput);
    digitsOnly(mobile, 10);
    digitsOnly(otpInput, 6);
    bindPasswordToggles();
    bindResend();

    $('step-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [
        setInvalid('f-name', !name.value.trim()),
        setInvalid('f-mobile', !MOBILE_RE.test(mobile.value)),
        setInvalid('f-email', !!email.value.trim() && !EMAIL_RE.test(email.value.trim())),
        setInvalid('f-pass', !(pass.value.length >= 8 && /\d/.test(pass.value)))
      ];
      var firstBad = ['su-name', 'su-mobile', 'su-email', 'su-pass'][bad.indexOf(true)];
      if (firstBad) { $(firstBad).focus(); return; }
      $('otp-target').textContent = '+91 ' + mobile.value;
      otpInput.value = '';
      showStep(steps, 'step-otp');
    });

    $('step-otp').addEventListener('submit', function (e) {
      e.preventDefault();
      if (setInvalid('f-otp', !/^\d{6}$/.test(otpInput.value))) { otpInput.focus(); return; }
      var first = name.value.trim().split(/\s+/)[0];
      $('welcome').textContent = 'Welcome to Cartly, ' + first + '!';
      showStep(steps, 'step-done');
    });

    document.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { showStep(steps, 'step-form'); });
    });
  }

  window.Cartly = { initLogin: initLogin, initSignup: initSignup };
})();
