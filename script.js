document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-nav');
function closeMenu() {
  menu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
// Preserve previously shared section links while navigation uses real pages.
if (location.pathname === '/' || location.pathname === '/index.html') {
  const legacyPages = {
    '#services': '/services/', '#work': '/work/', '#approach': '/approach/',
    '#methodology': '/approach/', '#about': '/about/', '#contact': '/contact/',
    '#faq': '/contact/#faq'
  };
  if (legacyPages[location.hash]) location.replace(legacyPages[location.hash]);
}
