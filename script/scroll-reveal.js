/* scroll reveal: listed content elements slide up into place (transform
   only, no opacity) as they enter the viewport. Elements sharing a row
   (e.g. work cards, the label/body of a text row) stagger left-to-right.

   The down-offset itself is applied in CSS via html.reveal-ready (set
   pre-paint by an inline <head> script, skipped under reduced-motion).
   This script just reveals each element on intersection and sets the
   per-column transition-delay for the stagger.

   NOTE: keep SELECTOR in sync with the list in styles/components/scroll-reveal.scss */

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SELECTOR = [
    '.about__text', '.about__label', '.about__detail',
    '.work__title', '.work__label', '.work-card',
    '.closing__title', '.closing__email', '.closing__linkedin', '.closing__divider', '.closing__link',
    '.cs-header__intro', '.cs-media',
    '.cs-text-row__label', '.cs-text-row__body',
    '.closing__more-title', '.about__detail'
  ].join(', ');

  var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!els.length) return;

  // no IntersectionObserver support -> just show everything
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }

  var STEP = 0.16; // seconds of delay per column within a row

  // how many reveal targets precede this one on the same visual row
  // (same parent, same offsetTop) -> its left-to-right column index
  function columnIndex(el) {
    var top = el.offsetTop, i = 0, sib = el.previousElementSibling;
    while (sib) {
      if (sib.matches(SELECTOR) && Math.abs(sib.offsetTop - top) < 4) i++;
      sib = sib.previousElementSibling;
    }
    return i;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var col = columnIndex(el);
      if (col > 0) el.style.transitionDelay = (col * STEP) + 's';
      el.classList.add('is-revealed');
      io.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
