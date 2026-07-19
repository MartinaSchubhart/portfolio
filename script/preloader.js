/* "Folio26" preloader — landing page, once per browser session.
 *
 * Stacked, rotated work images reveal one by one, then collapse, and the
 * dark panel clips up and off the top. Ported from the original site's
 * index.js preloader (GSAP), with the custom "hop" eases implemented inline
 * so no extra plugin/CDN is needed.
 *
 * While it runs, <html> gets `.is-preloading` and it fires a `veil:reveal`
 * event as the panel lifts, so script/text-reveal.js can hold the hero
 * headline and start it in sync as the panel clears. */
(function () {
  var preloader = document.querySelector('.preloader');
  if (!preloader) return;

  var KEY = window.PRELOADER_SESSION_KEY || 'preloaderShown';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reduced motion, no GSAP, or already shown this session -> skip cleanly
  if (reduced || !window.gsap) { preloader.remove(); return; }
  try {
    if (sessionStorage.getItem(KEY)) { preloader.remove(); return; }
    sessionStorage.setItem(KEY, 'true');
  } catch (e) { /* private mode: sessionStorage may throw — just play it */ }

  var root = document.documentElement;
  root.classList.add('is-preloading');

  function cleanup() {
    root.classList.remove('is-preloading');
    if (preloader.parentNode) preloader.remove();
  }

  // cubic-bezier easing without the CustomEase plugin
  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    function solve(x) {
      var t = x, i, d, e;
      for (i = 0; i < 8; i++) { e = sx(t) - x; if (Math.abs(e) < 1e-4) return t; d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      var lo = 0, hi = 1; t = x;
      for (i = 0; i < 24; i++) { e = sx(t); if (Math.abs(e - x) < 1e-4) break; if (x > e) lo = t; else hi = t; t = (lo + hi) / 2; }
      return t;
    }
    return function (p) { return p <= 0 ? 0 : p >= 1 ? 1 : sy(solve(p)); };
  }
  var hop = bezier(0.8, 0, 0.2, 1);
  var hop2 = bezier(0.9, 0, 0.1, 1);

  var COVER = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'; // image fully shown
  var TINY  = 'polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)'; // image pinched away
  var UP    = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';     // panel gone off the top

  var initRotations = [7.5, -2.5, -10, 12.5, -5, 5];
  gsap.set('.preloader-img', { rotate: function (i) { return initRotations[i] || 0; } });

  var counterEl = preloader.querySelector('.preloader-counter p');
  function setCount(n) {
    if (counterEl) counterEl.textContent = ('00' + Math.round(n)).slice(-3);
  }

  var tl = gsap.timeline({ delay: 0.5, onComplete: cleanup });

  // count up while the images stack in
  tl.to({ v: 0 }, {
    v: 100, duration: 3.2, ease: 'none',
    onUpdate: function () { setCount(this.targets()[0].v); }
  }, 0);

  // images reveal one by one, bottom of the stack first
  tl.to('.preloader-img', {
    scale: 1, clipPath: COVER, duration: 1, ease: hop, stagger: 0.2
  }, 0);

  // images collapse back, top of the stack first
  tl.to('.preloader-images .preloader-img', {
    scale: 0, clipPath: TINY, duration: 1, ease: hop2, stagger: -0.075
  }, 3.5);

  // cue the headline, then clip the whole panel up and off the top
  tl.call(function () { document.dispatchEvent(new CustomEvent('veil:reveal')); }, null, 4.35);
  tl.to('.preloader', { clipPath: UP, duration: 1, ease: hop2 }, 4.35);

  // safety net: never strand the panel if a frame stalls
  setTimeout(cleanup, 8000);
})();
