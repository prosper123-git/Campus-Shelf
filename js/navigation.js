import { state } from './state.js';
import { renderPurchasedBooks } from './purchased.js';

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

export function goToPage(name) {
  if (name === 'purchased' && !state.currentUser) {
    alert('Please login to view purchased books.');
    return;
  }

  pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === name));
  mobileMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'purchased') {
    renderPurchasedBooks();
  }
}

export function initNavigation() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goToPage(el.dataset.page);
    });
  });

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
  });
}