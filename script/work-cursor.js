/* work-card follow cursor: a small plus-tile that trails the pointer
   and scales in while hovering a .work-card. Ported from the old site's
   case-study grid cursor. Pointer-fine devices only; needs GSAP. */

(function () {
  if (!window.gsap) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var items = document.querySelectorAll('.work-card');
  if (!items.length) return;

  var PLUS = '<span>Discover</span>';
  var FOLLOW = 0.4, SCALE_IN = 0.4, SCALE_OUT = 0.3;

  var el = document.createElement('div');
  el.className = 'work-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = PLUS;
  document.body.appendChild(el);

  gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  var xTo = gsap.quickTo(el, 'x', { duration: FOLLOW, ease: 'power3' });
  var yTo = gsap.quickTo(el, 'y', { duration: FOLLOW, ease: 'power3' });

  var over = false;

  function enter(e) {
    if (over) return;                 // already shown (moving between cards)
    over = true;
    gsap.set(el, { x: e.clientX, y: e.clientY });
    gsap.to(el, { scale: 1, autoAlpha: 1, duration: SCALE_IN, ease: 'back.out(1.7)', overwrite: 'auto' });
  }

  function move(e) {
    xTo(e.clientX);
    yTo(e.clientY);
  }

  function leave(e) {
    // stay visible when moving directly onto another card
    if (e.relatedTarget && e.relatedTarget.closest('.work-card')) return;
    over = false;
    gsap.to(el, { scale: 0, autoAlpha: 0, duration: SCALE_OUT, ease: 'power2.in', overwrite: 'auto' });
  }

  items.forEach(function (it) {
    it.addEventListener('mouseenter', enter);
    it.addEventListener('mousemove', move);
    it.addEventListener('mouseleave', leave);
  });
})();
