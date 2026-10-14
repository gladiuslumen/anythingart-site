(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });

  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    });
  });
})();
