import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { books } from './books_data.js';
import { state } from './state.js';
import { getPurchasedCodes } from './purchases.js';

export function renderPurchasedBooks() {
  const purchasedGrid = document.getElementById('purchasedGrid');
  if (!purchasedGrid) { return; }

  if (!state.currentUser) {
    purchasedGrid.innerHTML = '<p class="no-results">Please login to view your purchased books.</p>';
    return;
  }

  const purchasedCodes = getPurchasedCodes();
  const purchasedBooks = books.filter(b => purchasedCodes.includes(b.code));
  purchasedGrid.innerHTML = '';

  if (purchasedBooks.length === 0) {
    purchasedGrid.innerHTML = '<p class="no-results">You have not purchased any books yet. Browse the catalogue to buy one.</p>';
    return;
  }

  purchasedBooks.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    const hasPdf = Boolean(b.pdfUrl);
    card.innerHTML = `
      <span class="book-code">${b.code}</span>
      <h3 class="book-title">${b.title}</h3>
      <p class="book-dept">${b.dept}</p>
      <div class="book-footer">
        <span class="book-price">₦${b.price.toLocaleString()}</span>
        <button class="book-btn">${hasPdf ? 'Open' : 'Purchased'}</button>
      </div>`;
    purchasedGrid.appendChild(card);

    const actionButton = card.querySelector('.book-btn');
    actionButton.addEventListener('click', () => {
      if (hasPdf) {
        window.open(b.pdfUrl, '_blank');
      }
    });
  });
}

// Pulls each book's pdfUrl from the `books` collection in Firestore and
// mutates the in-memory `books` array to attach it, then re-renders.
export async function loadBookPdfLinks() {
  try {
    const snapshot = await getDocs(collection(db, 'books'));
    snapshot.forEach(doc => {
      const data = doc.data();
      const match = books.find(b => b.code === data.courseCode);
      if (match) {
        match.pdfUrl = data.pdfUrl;
      }
    });
    renderPurchasedBooks();
  } catch (error) {
    console.error('Could not load PDF links:', error);
  }
}