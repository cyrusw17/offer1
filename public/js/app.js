(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var mobileCta = document.querySelector('.mobile-cta');
  var bookSection = document.querySelector('#book');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 48);
    if (mobileCta && bookSection) {
      var rect = bookSection.getBoundingClientRect();
      var show = y > 400 && rect.top > window.innerHeight;
      mobileCta.classList.toggle('is-visible', show);
      mobileCta.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-faq] .faq-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('is-open');
        el.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        var panel = el.querySelector('.faq-panel');
        if (panel) panel.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        var panel = item.querySelector('.faq-panel');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  document.querySelectorAll('.faq-item.is-open .faq-panel').forEach(function (panel) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  });

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initMotion() {
    if (reduced) return;

    if (window.Lenis) {
      var lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    if (window.gsap && window.ScrollTrigger) {
      document.documentElement.classList.add('js-anim');
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.reveal').forEach(function (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
          }
        );
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
