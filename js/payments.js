import { state } from './state.js';
import { auth } from './firebase.js';

const PAYSTACK_PUBLIC_KEY = 'pk_test_be4fe089c2dd98ded14bddb1b637022dc357f685';
const API_URL = 'https://campusshelf-api-nu.vercel.app/api/verify-payment';

export function payForBook(book, onSuccess) {
  if (!state.currentUser || !state.currentUser.email) {
    alert('Please login before purchasing a book.');
    return;
  }

  if (typeof PaystackPop === 'undefined') {
    alert('Payment system failed to load. Check your connection and try again.');
    return;
  }

  const reference = `bushelf_${book.code.replace(/\s+/g, '')}_${Date.now()}`;

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: state.currentUser.email,
    amount: book.price * 100, // kobo
    currency: 'NGN',
    ref: reference,
    metadata: {
      courseCode: book.code,
      uid: state.currentUser.uid
    },
    callback: function (response) {
      onSuccess(response.reference);
    },
    onClose: function () {}
  });

  handler.openIframe();
}

export async function verifyPayment(reference) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reference })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Verification failed');
  }
  return res.json();
}