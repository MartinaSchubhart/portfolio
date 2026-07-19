/* nav hover roll: wrap each nav link's text in an inner <span> and mirror
   it via data-text, so CSS can slide the text up out of frame on hover
   while a duplicate (::after) rises from below. Progressive enhancement —
   without this script the links stay plain (with the underline fallback).

   The overflow clipping lives on the inner .nav-roll__inner wrapper rather
   than on the <a>, so the anchor itself stays unclipped and can carry an
   oversized invisible tap target (see .site-nav a::before). */

(function () {
  var links = document.querySelectorAll('.site-nav a');
  links.forEach(function (a) {
    var text = a.textContent.trim();
    if (!text) return;
    a.classList.add('nav-roll');
    a.textContent = '';

    var inner = document.createElement('span');
    inner.className = 'nav-roll__inner';
    inner.setAttribute('data-text', text);

    var span = document.createElement('span');
    span.textContent = text;

    inner.appendChild(span);
    a.appendChild(inner);
  });
})();
