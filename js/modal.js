const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const signupFields = document.getElementById('signupFields');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalSubmit = document.getElementById('modalSubmit');

export function openModal() {
  modalOverlay.classList.add('open');
}

export function closeModal() {
  modalOverlay.classList.remove('open');
}

// Wires up the modal's own controls (close button, backdrop click, tab
// switching). Call this once from main.js. openModal/closeModal are
// exported separately so other modules (e.g. auth.js) can trigger the
// modal without needing to re-wire any of this.
export function initModal() {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    signupFields.style.display = 'none';
    modalTitle.textContent = 'Welcome back';
    modalSub.textContent = 'Log in to access your books.';
    modalSubmit.textContent = 'Log in';
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupFields.style.display = 'block';
    modalTitle.textContent = 'Create your account';
    modalSub.textContent = 'Sign up with your student email.';
    modalSubmit.textContent = 'Sign up';
  });
}