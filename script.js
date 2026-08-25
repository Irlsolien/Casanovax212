const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const markReady = () => {
  body.classList.remove('is-loading');
  body.classList.add('ready');
};

const loader = document.querySelector('[data-loader]');
const loaderFill = document.querySelector('[data-loader-fill]');
const loaderCount = document.querySelector('[data-loader-count]');
let loaderSeen = false;
try { loaderSeen = sessionStorage.getItem('casanovax-loader-seen') === '1'; } catch {}

if (!loader || reducedMotion || loaderSeen) {
  loader?.remove();
  markReady();
} else {
  try { sessionStorage.setItem('casanovax-loader-seen', '1'); } catch {}
  body.classList.add('is-loading');
  const start = performance.now();
  const duration = 1050;
  const easeInOutCubic = (value) => value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

  const tickLoader = (time) => {
    const elapsed = Math.min((time - start) / duration, 1);
    const value = Math.round(easeInOutCubic(elapsed) * 100);
    loaderFill.style.width = `${value}%`;
    loaderCount.textContent = String(value).padStart(3, '0');
    if (elapsed < 1) {
      requestAnimationFrame(tickLoader);
      return;
    }
    window.setTimeout(() => {
      loader.classList.add('loader-exit');
      markReady();
      window.setTimeout(() => loader.remove(), 850);
    }, 120);
  };
  requestAnimationFrame(tickLoader);
}

const header = document.querySelector('[data-header]');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

const navOverlay = document.querySelector('[data-nav-overlay]');
const menuButton = document.querySelector('[data-menu]');
const menuClose = document.querySelector('[data-menu-close]');

const openMenu = () => {
  navOverlay?.classList.add('open');
  navOverlay?.setAttribute('aria-hidden', 'false');
  menuButton?.setAttribute('aria-expanded', 'true');
  body.classList.add('menu-visible');
};

const closeMenu = () => {
  navOverlay?.classList.remove('open');
  navOverlay?.setAttribute('aria-hidden', 'true');
  menuButton?.setAttribute('aria-expanded', 'false');
  body.classList.remove('menu-visible');
};

menuButton?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);
navOverlay?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navOverlay?.classList.contains('open')) closeMenu();
});

const timeNode = document.querySelector('[data-local-time]');
const updateTime = () => {
  if (!timeNode) return;
  const time = new Intl.DateTimeFormat('fr-MA', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
  timeNode.textContent = `Casablanca · ${time}`;
};
updateTime();
window.setInterval(updateTime, 30000);

const liquidHero = document.querySelector('[data-liquid-hero]');
const liquidLayer = liquidHero?.querySelector('.hero-image-color');
if (liquidHero && liquidLayer && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
  liquidHero.addEventListener('pointermove', (event) => {
    const rect = liquidHero.getBoundingClientRect();
    liquidLayer.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    liquidLayer.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: '220px 0px 220px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const signal = document.querySelector('[data-signal]');
if (signal) {
  const signalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) signal.classList.add('active');
    });
  }, { threshold: 0.35 });
  signalObserver.observe(signal);
}

const method = document.querySelector('[data-method]');
const steps = [...document.querySelectorAll('[data-step]')];
if (method && steps.length) {
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      const index = steps.indexOf(entry.target);
      const progress = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 100;
      method.style.setProperty('--method-progress', `${progress}%`);
    });
  }, { threshold: 0.55 });
  steps.forEach((step) => stepObserver.observe(step));
}

let selectedPlan = '';
const selectedPlanBox = document.querySelector('[data-selected-plan]');
const selectedPlanName = selectedPlanBox?.querySelector('strong');
const clearPlanButton = document.querySelector('[data-clear-plan]');

document.querySelectorAll('[data-choose-plan]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedPlan = button.dataset.choosePlan;
    selectedPlanName.textContent = selectedPlan;
    selectedPlanBox.hidden = false;
    document.querySelector('#contact')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

clearPlanButton?.addEventListener('click', () => {
  selectedPlan = '';
  selectedPlanBox.hidden = true;
});

const contactSection = document.querySelector('#contact');
if (contactSection) {
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => body.classList.toggle('contact-visible', entry.isIntersecting));
  }, { threshold: 0.2 });
  contactObserver.observe(contactSection);
}

const copyButton = document.querySelector('[data-copy-brief]');
const toast = document.querySelector('[data-toast]');
copyButton?.addEventListener('click', async () => {
  const brief = `Bonjour CASANOVAX,

Offre envisagée : ${selectedPlan || 'À définir ensemble'}
Entreprise :
Secteur d’activité :
Objectif prioritaire :
Services recherchés : site / Google / NFC / automatisation
Budget indicatif :
Date souhaitée :
Site actuel :

Merci.`;

  try {
    await navigator.clipboard.writeText(brief);
    toast.textContent = 'Brief copié. Collez-le dans votre message.';
  } catch {
    toast.textContent = 'La copie est bloquée par votre navigateur.';
  }
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
