/* nav hover roll: wrap each nav link's text in a <span> and mirror it via
   data-text, so CSS can slide the text up out of frame on hover while a
   duplicate (::after) rises from below. Progressive enhancement — without
   this script the links stay plain (with the underline fallback). */

(function () {
  var links = document.querySelectorAll('.site-nav a');
  links.forEach(function (a) {
    var text = a.textContent.trim();
    if (!text) return;
    a.setAttribute('data-text', text);
    a.classList.add('nav-roll');
    var span = document.createElement('span');
    span.textContent = text;
    a.textContent = '';
    a.appendChild(span);
  });
})();
