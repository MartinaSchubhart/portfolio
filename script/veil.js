/* veil: preloader + page transition.
   Reveal: strokes thin out & fade, bottom-left band first -> top-right.
   Cover (before navigating): the reverse — strokes grow & fade in,
   top-right band first -> bottom-left. Navigation happens fully covered;
   the next page arrives covered (?pt=1, applied pre-paint by an inline
   script) and plays the reveal.

   The handoff travels via URL param, not sessionStorage, so it also
   works under file:// where every document is its own storage origin. */

(function () {
  var veil = document.querySelector('.veil');
  if (!veil) return;

  var paths = Array.prototype.slice.call(veil.querySelectorAll('path'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PARAM = 'pt';
  var DUR = 700;          /* per-stroke sweep duration */
  var STAGGER = 80;       /* delay between bands */
  var HOLD = 350;         /* yellow hold on a cold load (preloader) */
  var ARRIVAL_HOLD = 60;  /* yellow hold when arriving mid-transition */
  var EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
  var TOTAL = DUR + STAGGER * (paths.length - 1);

  var params = new URLSearchParams(location.search);
  var arrived = params.has(PARAM);
  if (arrived) {
    params.delete(PARAM);
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  function setHidden() {
    veil.classList.remove('is-covered');
    veil.style.background = 'transparent';
    paths.forEach(function (p) {
      p.getAnimations().forEach(function (a) { a.cancel(); });
      p.style.strokeWidth = '0px';
      p.style.opacity = '0';
    });
  }

  function sweep(orderedPaths, from, to, done) {
    var called = false;
    function finish() {
      if (called) return;
      called = true;
      if (done) done();
    }
    orderedPaths.forEach(function (p, i) {
      var anim = p.animate([from, to], {
        duration: DUR,
        delay: i * STAGGER,
        easing: EASE,
        fill: 'forwards'
      });
      if (i === orderedPaths.length - 1) anim.onfinish = finish;
    });
    setTimeout(finish, TOTAL + 250); /* fallback if onfinish never fires */
  }

  function reveal() {
    /* let the rest of the page sync to the sweep (e.g. headline reveal) */
    document.dispatchEvent(new CustomEvent('veil:reveal'));
    /* strokes fully tile the screen right now, so dropping the solid
       backdrop is invisible — the reveal happens through the strokes */
    veil.style.background = 'transparent';
    sweep(
      paths, /* DOM order = bottom-left band first */
      { strokeWidth: '540px', opacity: 1 },
      { strokeWidth: '0px', opacity: 0 },
      setHidden
    );
  }

  /* restored from bfcache mid-transition: never stay covered */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) setHidden();
  });

  if (reduced) return; /* CSS hides the veil entirely; native navigation */

  if (veil.classList.contains('is-covered')) {
    setTimeout(reveal, arrived ? ARRIVAL_HOLD : HOLD);
  }

  /* intercept internal links: cover, then navigate */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var url;
    try { url = new URL(link.href, location.href); } catch (err) { return; }

    if (location.protocol === 'file:') {
      if (url.protocol !== 'file:') return;
      /* file:// gives every document a unique origin — skip origin check */
    } else {
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.origin !== location.origin) return;
    }
    if (url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();

    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      /* fully covered now — pin the solid backdrop for the unload gap */
      veil.style.background = 'var(--yellow)';
      url.searchParams.set(PARAM, '1');
      window.location.href = url.toString();
    }

    sweep(
      paths.slice().reverse(), /* reverse: top-right band first */
      { strokeWidth: '0px', opacity: 0 },
      { strokeWidth: '540px', opacity: 1 },
      go
    );
  });
})();
