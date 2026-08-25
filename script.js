const header = document.querySelector('[data-header]');
const nav = document.querySelector('.nav');
const menu = document.querySelector('[data-menu]');
const navLinks = document.querySelectorAll('[data-nav-links] a');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const closeMenu = () => {
  nav?.classList.remove('menu-open');
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Ouvrir le menu');
};

menu?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(isOpen));
  menu.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

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
  }, { threshold: 0.08, rootMargin: '0px 0px -35px' });
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

const offerDetails = document.querySelectorAll('.site-offers details');
offerDetails.forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    offerDetails.forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const copyButton = document.querySelector('[data-copy-brief]');
const toast = document.querySelector('[data-toast]');
copyButton?.addEventListener('click', async () => {
  const brief = `Bonjour CASANOVAX,

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
