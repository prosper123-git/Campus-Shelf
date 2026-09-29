import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import { state } from './state.js';
import { books } from './books_data.js';
import { initModal } from './modal.js';
import { initNavigation } from './navigation.js';
import { initCatalogue, renderBooks } from './catalogue.js';
import { renderPurchasedBooks, loadBookPdfLinks } from './purchased.js';
import { loadPurchases } from './purchases.js';

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user;
  try {
    await loadPurchases(user ? user.uid : null);
    await loadBookPdfLinks();
  } catch (e) {
    console.error(e);
  }
  renderBooks(books);
  renderPurchasedBooks();
});

initModal();
initNavigation();
initCatalogue();