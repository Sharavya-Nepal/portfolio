/* Runs before paint so cross-document transitions respect the saved preference. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function disabled() {
    let preference = false;
    try { preference = sessionStorage.getItem('sharavya-motion') === 'off'; } catch (_) { /* Optional storage. */ }
    return reduce.matches || preference;
  }
  document.documentElement.dataset.motion = disabled() ? 'off' : 'on';
  const respectPreference = event => {
    if (disabled()) event.viewTransition?.skipTransition();
  };
  window.addEventListener('pageswap', respectPreference);
  window.addEventListener('pagereveal', respectPreference);
})();
