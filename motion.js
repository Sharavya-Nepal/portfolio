/* GSAP 3.13.0 + ScrollTrigger. All content is visible before enhancement. */
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = sessionStorage.getItem('sharavya-motion') === 'off'; } catch (_) { /* Storage is optional. */ }
  const control = document.createElement('button');
  control.className = 'motion-control';
  control.type = 'button';
  document.querySelector('.footer-bottom')?.append(control);
  const media = gsap.matchMedia();
  const revealTweens = new Map();

  function updateControl() {
    const off = paused || systemMotion.matches;
    document.documentElement.dataset.motion = off ? 'off' : 'on';
    control.textContent = off ? 'Motion: off' : 'Motion: on';
    control.setAttribute('aria-label', systemMotion.matches ? 'Motion off: follows your device preference' : off ? 'Enable animations' : 'Pause animations');
    control.setAttribute('aria-pressed', String(!off));
    control.disabled = systemMotion.matches;
  }

  // An original, lightweight perspective field. It only runs while on screen.
  function createLightField(section, desktop) {
    const canvas = document.createElement('canvas');
    canvas.className = 'cinema-field';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    section.prepend(canvas);
    let width = 1, height = 1, active = false, running = false, last = 0, phase = 0;
    let pointerX = 0, pointerY = 0, aimX = 0, aimY = 0;
    function draw(time = 0) {
      if (time && time - last < 1 / 30) return;
      const delta = last ? Math.min(time - last, 0.06) : 0;
      last = time;
      phase += delta * 0.22;
      pointerX += (aimX - pointerX) * 0.04;
      pointerY += (aimY - pointerY) * 0.04;
      ctx.clearRect(0, 0, width, height);
      const horizon = height * 0.39 + pointerY * 16;
      const vanishingX = width * 0.5 + pointerX * 20;
      const rows = desktop ? 27 : 17;
      for (let row = 0; row < rows; row++) {
        const depth = row / (rows - 1);
        const spread = 0.12 + depth * depth * 1.15;
        ctx.beginPath();
        for (let step = 0; step <= 56; step++) {
          const u = step / 56;
          const x = vanishingX + (u - 0.5) * width * 2.1 * spread;
          const wave = Math.sin(u * 9 + phase + depth * 4) * Math.cos(u * 3 - phase * 0.5);
          const y = horizon + depth * depth * height * 0.73 + wave * height * 0.12 * spread;
          if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = row % 7 === 0 ? `rgba(223,255,122,${0.07 + depth * 0.2})` : `rgba(106,141,255,${0.08 + depth * 0.19})`;
        ctx.lineWidth = row % 7 === 0 ? 1.15 : 0.65;
        ctx.stroke();
      }
    }
    function resize() {
      width = section.clientWidth; height = section.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2400000 / Math.max(1, width * height)));
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function sync() {
      const next = active && !document.hidden;
      if (next === running) return;
      running = next; last = 0;
      if (next) gsap.ticker.add(draw); else gsap.ticker.remove(draw);
    }
    const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; sync(); });
    observer.observe(section);
    const resizer = new ResizeObserver(resize);
    resizer.observe(section);
    const point = event => {
      if (event.pointerType !== 'mouse') return;
      const rect = section.getBoundingClientRect();
      aimX = (event.clientX - rect.left) / width - 0.5;
      aimY = (event.clientY - rect.top) / height - 0.5;
    };
    const reset = () => { aimX = 0; aimY = 0; };
    section.addEventListener('pointermove', point, { passive: true });
    section.addEventListener('pointerleave', reset);
    document.addEventListener('visibilitychange', sync);
    resize();
    return () => {
      observer.disconnect(); resizer.disconnect(); gsap.ticker.remove(draw);
      section.removeEventListener('pointermove', point);
      section.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', sync);
      canvas.remove();
    };
  }

  function setup() {
    media.revert();
    revealTweens.clear();
    updateControl();
    if (paused) return;
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 901px)', pointer: '(hover: hover) and (pointer: fine)' }, context => {
      if (!context.conditions.motion) return;
      const desktop = context.conditions.desktop;
      const cleanups = [];
      const hero = document.querySelector('.hero');
      if (hero && window.scrollY < 100) {
        const opening = gsap.timeline({ defaults: { duration: 1, ease: 'power3.out' } });
        opening.addLabel('assemble', 0)
          .from('.hero-line', { y: 65, rotationX: -12, opacity: 0.15, stagger: 0.16, duration: 1.45, clearProps: 'transform,opacity' }, 'assemble')
          .from('.hero-photograph', { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.8, clearProps: 'clipPath' }, 'assemble')
          .from('.hero-photo', { scale: 1.2, opacity: 0.5, duration: 2.3, clearProps: 'transform,opacity' }, 'assemble')
          .from('.art-top, .art-bottom', { y: 12, opacity: 0, stagger: 0.12, clearProps: 'transform,opacity' }, 'assemble+=0.25');
      }
      if (hero && desktop) {
        gsap.to('.hero-photo', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.3 } });
        gsap.to('.hero-art .art-bottom', { y: -28, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.1 } });
      }
      document.querySelectorAll('.home-city').forEach(city => {
        const image = city.querySelector('img');
        gsap.from(city, { clipPath: 'inset(8% 6% 8% 6%)', duration: 1.7, ease: 'power3.out', immediateRender: false, clearProps: 'clipPath', scrollTrigger: { trigger: city, start: 'clamp(top 88%)', once: true } });
        if (image && desktop) gsap.fromTo(image, { objectPosition: '50% 30%' }, { objectPosition: '50% 65%', ease: 'none', scrollTrigger: { trigger: city, start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
      });
      document.querySelectorAll('.project-visual').forEach(visual => {
        gsap.from(visual, { rotationX: desktop ? 9 : 0, y: desktop ? 28 : 12, scale: 0.96, duration: 1.5, transformPerspective: 1200, transformOrigin: 'center bottom', ease: 'power3.out', immediateRender: false, clearProps: 'transform,transformOrigin', scrollTrigger: { trigger: visual, start: 'clamp(top 92%)', once: true } });
      });
      const partners = document.querySelector('.home-page .client-strip');
      if (partners) {
        gsap.from(partners.querySelectorAll('.client-names > a'), {
          y: desktop ? 28 : 12, opacity: 0.6, stagger: 0.1, duration: 1.15,
          ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: partners, start: 'clamp(top 92%)', once: true }
        });
      }
      const intro = document.querySelector('.page-intro h1, .service-page-hero h1');
      if (intro && window.scrollY < 100) gsap.from(intro, { y: 30, opacity: 0.3, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity' });

      // Each element remains visible until its own entrance begins. No hidden content or scroll trap.
      const targets = gsap.utils.toArray('.section-heading, .service-card, .project, .capability-grid > article, .process-grid > article, .delivery-chapters > article, .discipline-grid > article, .collaboration-section > div, .connection-copy, .planning-section > div, .contact-copy, .starting-grid > article, .next-step-grid > li, .scenario-heading, .work-context > h2, .home-city');
      targets.forEach((element, index) => {
        const tween = gsap.from(element, {
          y: desktop ? 48 : 22, opacity: 0.3, duration: 1.05, delay: element.matches('article, .service-card, .project') ? (index % 3) * 0.045 : 0, ease: 'power3.out', immediateRender: false,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'clamp(top 92%)', once: true }
        });
        revealTweens.set(element, tween);
      });
      // Continuous parallax lives on children, leaving the editorial rows in normal flow.
      const depth = desktop ? 22 : 10;
      gsap.utils.toArray('.section-heading h2, .service-card h3, .process-grid h3, .capability-grid h3, .project-heading h3, .delivery-chapters h3, .team-person h3').forEach((element, index) => {
        gsap.fromTo(element, { y: depth * (index % 2 ? -0.5 : 1) }, {
          y: -depth * (index % 2 ? 1 : 0.5), ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
        });
      });
      if (desktop) document.querySelectorAll('.project-visual > img').forEach(image => {
        gsap.fromTo(image, { y: 18 }, { y: -18, ease: 'none', scrollTrigger: { trigger: image.closest('.project'), start: 'top bottom', end: 'bottom top', scrub: 1.3 } });
      });
      document.querySelectorAll('.team-initials').forEach(initials => {
        gsap.fromTo(initials, { y: 8 }, { y: -8, ease: 'none', scrollTrigger: { trigger: initials.closest('.team-person'), start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      });
      // A native sticky scene: the page never intercepts wheel or touch scrolling.
      const story = document.querySelector('.studio-story');
      if (story) {
        gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.studio-chapters', start: 'top 75%', end: 'bottom 55%', scrub: 0.8 } })
          .fromTo('.plane-a', { x: -45, y: -45, rotation: -65 }, { x: 0, y: 0, rotation: -30 }, 0)
          .fromTo('.plane-b', { scale: 0.75, rotation: 20 }, { scale: 1, rotation: -30 }, 0)
          .fromTo('.plane-c', { x: 45, y: 45, rotation: 5 }, { x: 0, y: 0, rotation: -30 }, 0)
          .fromTo('.signal-core', { scale: 0.85, rotation: -12 }, { scale: 1, rotation: 0 }, 0);
        story.querySelectorAll('.studio-chapters article').forEach(chapter => {
          ScrollTrigger.create({ trigger: chapter, start: 'top 65%', end: 'bottom 45%', toggleClass: 'is-current' });
        });
      }
      const manifesto = document.querySelector('.manifesto');
      if (manifesto) {
        const compass = manifesto.querySelector('.north-compass');
        if (compass) cleanups.push(createLightField(compass, desktop));
        const statement = gsap.timeline({ defaults: { ease: 'none', immediateRender: false }, scrollTrigger: { trigger: manifesto, start: 'top 88%', end: desktop ? 'top 28%' : 'top 20%', scrub: 1.1 } });
        statement.fromTo('.manifesto-line > span', { yPercent: 105, opacity: 0.25 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.28 }, 0)
          .fromTo('.north-compass', { scale: 0.82, opacity: 0.3, rotation: -28 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.85 }, 0.2)
          .fromTo('.manifesto-bottom', { y: 24, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.8 }, 0.9);
        revealTweens.set(manifesto, statement);
        gsap.fromTo('.north-needle', { rotation: -18 }, { rotation: 18, ease: 'none', scrollTrigger: { trigger: manifesto, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
        const orbit = gsap.timeline({ paused: true, repeat: -1, defaults: { duration: 36, ease: 'none' } })
          .to('.north-orbit-outer', { rotation: 360 }, 0)
          .to('.north-orbit-inner', { rotation: -360 }, 0);
        const orbitVisibility = ScrollTrigger.create({ trigger: manifesto, start: 'top bottom', end: 'bottom top', onToggle: self => orbit.paused(!self.isActive || document.hidden) });
        const syncOrbit = () => orbit.paused(document.hidden || !orbitVisibility.isActive);
        document.addEventListener('visibilitychange', syncOrbit);
        syncOrbit();
        cleanups.push(() => document.removeEventListener('visibilitychange', syncOrbit));
      }
      document.querySelectorAll('.contact').forEach(contact => {
        const title = contact.querySelector('h2');
        if (title) {
          const arrival = gsap.from(title, { y: 60, clipPath: 'inset(0 0 100% 0)', duration: 1.6, ease: 'power3.out', immediateRender: false, clearProps: 'transform,clipPath', scrollTrigger: { trigger: contact, start: 'clamp(top 75%)', once: true } });
          revealTweens.set(title, arrival);
        }
        gsap.fromTo(contact, { '--light-position': '0%' }, { '--light-position': '100%', ease: 'none', scrollTrigger: { trigger: contact, start: 'top bottom', end: 'bottom top', scrub: 1.6 } });
      });
      document.querySelectorAll('.contact-art').forEach(symbol => gsap.from(symbol, { y: 48, rotation: -12, scale: 0.88, duration: 1.5, ease: 'power3.out', immediateRender: false, clearProps: 'transform', scrollTrigger: { trigger: symbol.closest('.contact'), start: 'clamp(top 82%)', once: true } }));
      const progress = document.createElement('div');
      progress.className = 'reading-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.append(progress);
      gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.15 } });
      cleanups.push(() => progress.remove());

      document.querySelectorAll('.process-index i').forEach(line => {
        gsap.from(line, { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power2.out', immediateRender: false, scrollTrigger: { trigger: line, start: 'clamp(top 90%)', once: true } });
      });
      const scene = document.querySelector('.connection-scene');
      if (scene) {
        const orbit = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 0.65 } });
        orbit.fromTo('.orbit-one', { rotation: -28 }, { rotation: 48 }, 0)
          .fromTo('.orbit-two', { rotation: 50 }, { rotation: -30 }, 0)
          .fromTo('.orbit-three', { rotation: -65 }, { rotation: 15 }, 0);
      }
      if (desktop) {
        document.querySelectorAll('.discipline-art').forEach(art => {
          gsap.from(art.children, { y: index => (index - 1) * 36, rotation: index => (index - 1) * 12, ease: 'none', scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom center', scrub: 0.6 } });
        });
        const track = document.querySelector('.delivery-track i');
        if (track) gsap.from(track, { scaleX: 0, transformOrigin: 'left center', ease: 'none', scrollTrigger: { trigger: '.delivery-section', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      }
      return () => cleanups.forEach(cleanup => cleanup());
    });
  }

  // Keyboard navigation always gets a fully settled target.
  document.addEventListener('focusin', event => {
    revealTweens.forEach((tween, element) => {
      if (element.contains(event.target)) { tween.progress(1); tween.scrollTrigger?.kill(); }
    });
  });
  control.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('sharavya-motion', paused ? 'off' : 'on'); } catch (_) { /* Optional preference. */ }
    setup();
  });
  systemMotion.addEventListener('change', updateControl);
  setup();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.querySelectorAll('img[loading="lazy"]').forEach(img => img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => ScrollTrigger.refresh());
    details.addEventListener('transitionend', event => {
      if (event.propertyName === 'block-size' || event.propertyName === 'height') ScrollTrigger.refresh();
    });
  });
})();
