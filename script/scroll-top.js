/* subtle scroll-to-top button. Injects itself, fades in once the page is
   scrolled past a threshold, and eases back to the top on click (via Lenis
   when present, otherwise native smooth scroll). */

(function () {
  var THRESHOLD = 600; // px scrolled before the button appears

  var btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);

  function update() {
    btn.classList.toggle('is-visible', window.scrollY > THRESHOLD);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', function () {
    if (window.lenis) {
      window.lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();
