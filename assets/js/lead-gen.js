/*!
 * UI UX Powerhouse — Lead Generation System
 * Sticky bar, modal, lead magnets, toast, progress bar
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────── */
  var CFG = {
    stickyDelay:   4000,   // ms before sticky bar appears
    modalDelay:    35000,  // ms before exit-intent modal fires (fallback timer)
    toastDelay:    8000,   // ms before social-proof toast fires
    toastInterval: 45000,  // ms between subsequent toasts
    scrollThreshold: 35,   // % page scrolled before sticky shows
    modalShownKey: 'lg_modal_shown',
    auditFormAction: '#contact-section', // fallback href
  };

  /* ── Social proof data ──────────────────────── */
  var TOASTS = [
    { name: 'James R.',     role: 'CTO, Logistics SaaS',        action: 'booked a UI Audit',                time: '2 hours ago' },
    { name: 'Priya M.',     role: 'VP Engineering, FinTech',     action: 'requested a dashboard consultation', time: '4 hours ago' },
    { name: 'Daniel K.',    role: 'Product Lead, Fleet SaaS',    action: 'downloaded the Performance Checklist', time: 'yesterday'  },
    { name: 'Sarah O.',     role: 'Head of Engineering, Scaleup', action: 'booked a frontend audit',          time: '3 hours ago' },
    { name: 'Tom B.',       role: 'Engineering Manager',          action: 'requested an Angular architecture review', time: '1 hour ago' },
  ];

  /* ── Utilities ──────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function setCookie(name, val, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 86400000));
    document.cookie = name + '=' + val + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : null;
  }

  function scrollPercent() {
    var el = document.documentElement;
    var scrolled = el.scrollTop || document.body.scrollTop;
    var total = el.scrollHeight - el.clientHeight;
    return total > 0 ? Math.round((scrolled / total) * 100) : 0;
  }

  /* ── Scroll progress bar ────────────────────── */
  var progressBar = document.getElementById('lg-progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      progressBar.style.width = scrollPercent() + '%';
    }, { passive: true });
  }

  /* ── Sticky bar ─────────────────────────────── */
  var stickyBar = document.getElementById('lg-sticky-bar');
  var stickyDismissed = getCookie('lg_sticky_dismissed');

  if (stickyBar && !stickyDismissed) {
    var stickyShown = false;

    function tryShowSticky() {
      if (!stickyShown && scrollPercent() >= CFG.scrollThreshold) {
        stickyShown = true;
        stickyBar.classList.add('lg-visible');
      }
    }

    // Show after delay OR scroll, whichever comes first
    setTimeout(function () { stickyShown = false; tryShowSticky(); stickyShown = true; stickyBar.classList.add('lg-visible'); }, CFG.stickyDelay);
    window.addEventListener('scroll', tryShowSticky, { passive: true });

    var closeBtn = stickyBar.querySelector('.lg-sticky-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        stickyBar.classList.remove('lg-visible');
        setCookie('lg_sticky_dismissed', '1', 1);
      });
    }
  }

  /* ── Lead-capture modal ─────────────────────── */
  var modalOverlay = document.getElementById('lg-modal-overlay');
  var modalShown   = getCookie(CFG.modalShownKey);

  function openModal() {
    if (!modalOverlay || modalShown) return;
    modalShown = true;
    setCookie(CFG.modalShownKey, '1', 3);
    modalOverlay.classList.add('lg-modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('lg-modal-open');
    document.body.style.overflow = '';
  }

  if (modalOverlay && !modalShown) {
    // Fallback timer
    var modalTimer = setTimeout(openModal, CFG.modalDelay);

    // Exit intent (desktop)
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) {
        clearTimeout(modalTimer);
        openModal();
      }
    });

    // Close handlers
    var closeBtn = modalOverlay.querySelector('.lg-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Modal form submit
    var modalForm = modalOverlay.querySelector('.lg-modal-form');
    if (modalForm) {
      modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = modalForm.querySelector('input[type="email"]').value.trim();
        var name  = modalForm.querySelector('input[type="text"]') && modalForm.querySelector('input[type="text"]').value.trim();
        if (!email) return;

        // GA event
        if (window.gtag) gtag('event', 'modal_lead_capture', { email: email });

        var formEl  = modalForm;
        var success = modalOverlay.querySelector('.lg-success-msg');
        if (formEl && success) {
          formEl.style.display = 'none';
          success.style.display = 'block';
        }

        setTimeout(closeModal, 3500);
      });
    }
  }

  /* ── Social-proof toast ─────────────────────── */
  var toast = document.getElementById('lg-toast');
  var toastIdx = 0;

  function showToast() {
    if (!toast || TOASTS.length === 0) return;
    var data = TOASTS[toastIdx % TOASTS.length];
    toastIdx++;

    var nameEl   = toast.querySelector('.lg-toast-name');
    var actionEl = toast.querySelector('.lg-toast-action');
    var timeEl   = toast.querySelector('.lg-toast-time');

    if (nameEl)   nameEl.textContent   = data.name + ' (' + data.role + ')';
    if (actionEl) actionEl.textContent = data.action;
    if (timeEl)   timeEl.textContent   = data.time;

    toast.classList.add('lg-toast-show');

    setTimeout(function () {
      toast.classList.remove('lg-toast-show');
    }, 5000);
  }

  setTimeout(function () {
    showToast();
    setInterval(showToast, CFG.toastInterval);
  }, CFG.toastDelay);

  /* ── Lead magnet forms ──────────────────────── */
  $$('.lg-magnet-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input   = form.querySelector('.lg-magnet-input');
      var email   = input ? input.value.trim() : '';
      var magnet  = form.dataset.magnet || 'checklist';

      if (!email) { input && input.focus(); return; }

      if (window.gtag) gtag('event', 'lead_magnet_download', { magnet: magnet, email: email });

      var card    = form.closest('.lg-magnet-card');
      var success = card && card.querySelector('.lg-success-msg');
      if (card && success) {
        form.style.display = 'none';
        success.style.display = 'block';
      }

      // Simulate download trigger
      var dl = form.dataset.downloadUrl;
      if (dl) {
        var a = document.createElement('a');
        a.href     = dl;
        a.download = '';
        a.click();
      }
    });
  });

  /* ── Audit form (inline offer) ──────────────── */
  var auditForm = document.getElementById('lg-audit-form');
  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = auditForm.querySelector('input[type="email"]').value.trim();
      var name  = auditForm.querySelector('input[name="name"]') && auditForm.querySelector('input[name="name"]').value.trim();

      if (!email) return;

      if (window.gtag) gtag('event', 'ui_audit_request', { email: email });

      var success = document.getElementById('lg-audit-success');
      if (success) {
        auditForm.style.display = 'none';
        success.style.display = 'block';
      }
    });
  }

  /* ── Calendly intent tracking ───────────────── */
  $$('[data-calendly]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.gtag) gtag('event', 'calendly_click', { slot: btn.dataset.calendly });
      // When real Calendly URL is set in data-href, open it
      var url = btn.dataset.href;
      if (url && url !== '#') window.open(url, '_blank', 'noopener');
    });
  });

  /* ── Smooth scroll for anchor links ─────────── */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Year in footer ─────────────────────────── */
  $$('#footerDate').forEach(function (el) {
    el.textContent = ' ' + new Date().getFullYear();
  });

  /* ── Open modal from trigger buttons ─────────── */
  $$('[data-modal="audit"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      modalShown = false; // reset so it can reopen
      setCookie(CFG.modalShownKey, '', -1);
      openModal();
    });
  });

})();
