import { books } from './books_data.js';
import { state } from './state.js';
import { getPurchasedCodes, addPurchasedBook } from './purchases.js';
import { renderPurchasedBooks } from './purchased.js';
import { goToPage } from './navigation.js';
import { payForBook } from './payments.js';

const catGrid = document.getElementById('catGrid');

export function renderBooks(list) {
  catGrid.innerHTML = '';

  if (list.length === 0) {
    catGrid.innerHTML = '<p class="no-results">No books match that search. Try a different course title or code.</p>';
    return;
  }

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    const purchased = getPurchasedCodes().includes(b.code);
    card.innerHTML = `
      <span class="book-code">${b.code}</span>
      <h3 class="book-title">${b.title}</h3>
      <p class="book-dept">${b.dept}</p>
      <div class="book-footer">
        <span class="book-price">₦${b.price.toLocaleString()}</span>
        <button class="book-btn">${purchased ? 'Purchased' : 'Buy'}</button>
      </div>`;
    catGrid.appendChild(card);

    const viewButton = card.querySelector('.book-btn');
    viewButton.addEventListener('click', () => {
      if (purchased) {
        renderPurchasedBooks();
        goToPage('purchased');
        return;
      }
      payForBook(b, () => {
        // TEMPORARY: marks the book purchased as soon as Paystack's
        // client-side callback fires. Replace this with a call to your
        // Cloud Function verification endpoint once it exists — see
        // the note at the top of payments.js.
        addPurchasedBook(b);
        renderPurchasedBooks();
        goToPage('purchased');
      });
    });
  });
}

export function initCatalogue() {
  renderBooks(books);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
    renderBooks(filtered);
  });
}