(() => {
  const nav = document.querySelector('.nav-bar');
  const btn = nav?.querySelector('.nav-toggle');
  const links = nav?.querySelector('.nav-links');
  if (!nav || !btn || !links) return;

  const setOpen = (open) => {
    nav.dataset.open = open ? 'true' : 'false';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  btn.addEventListener('click', () => {
    setOpen(nav.dataset.open !== 'true');
  });

  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (nav.dataset.open === 'true' && !nav.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  const mq = window.matchMedia('(min-width: 901px)');
  const onResize = () => { if (mq.matches) setOpen(false); };
  mq.addEventListener('change', onResize);
})();

/* Auto-append a right-arrow span to every .btn so the Figma hover-grow (gap 4→12) animates.
   Doing it here keeps the HTML clean and works on every page that loads nav.js. */
(() => {
  document.querySelectorAll('.btn').forEach(btn => {
    if (btn.querySelector('.btn-arrow')) return;
    const arrow = document.createElement('span');
    arrow.className = 'btn-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    btn.appendChild(arrow);
  });
})();

/* Wrap each .menu-item's label in two stacked .menu-text spans (white + blue)
   so the CSS can roll them on hover/focus/active. */
(() => {
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item.querySelector('.menu-text')) return;
    const label = item.textContent.trim();
    if (!label) return;
    item.textContent = '';
    const top = document.createElement('span');
    top.className = 'menu-text';
    top.textContent = label;
    const bottom = document.createElement('span');
    bottom.className = 'menu-text menu-text-blue';
    bottom.textContent = label;
    bottom.setAttribute('aria-hidden', 'true');
    item.append(top, bottom);
  });
})();
