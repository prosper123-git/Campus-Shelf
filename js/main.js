import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import { state } from './state.js';
import { initModal } from './modal.js';
import { initNavigation } from './navigation.js';
import { initCatalogue } from './catalogue.js';
import { renderPurchasedBooks, loadBookPdfLinks } from './purchased.js';

// Keep the shared auth state in sync and re-render anything that
// depends on it. auth.js (loaded separately) handles the login
// button's own text/click behavior — this only needs to update
// state.currentUser and refresh the purchased-books view.
onAuthStateChanged(auth, (user) => {
  state.currentUser = user;
  renderPurchasedBooks();
});

initModal();
initNavigation();
initCatalogue();
loadBookPdfLinks();