import { state } from './state.js';

// TODO: replace with your own Test Public Key from the Paystack
// dashboard (Settings -> API Keys & Webhooks). This key is safe to
// expose in frontend code — it can only open a payment popup, it
// can't move money or verify anything on its own.
const PAYSTACK_PUBLIC_KEY = 'pk_test_REPLACE_ME';

// Opens the Paystack popup for a single book purchase. Calls
// onSuccess(reference) once Paystack's client-side callback fires.
//
// IMPORTANT: onSuccess firing here does NOT prove the payment actually
// went through — it's only what the browser reported, and a student
// could trigger it manually from devtools without paying anything.
// This is test-mode wiring to get the flow working end to end. Before
// this handles real money, add a Firebase Cloud Function that calls
// Paystack's GET /transaction/verify/:reference with your SECRET key
// and only then writes the purchase to Firestore — see the note in
// main.js once that function exists.
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
    amount: book.price * 100, // Paystack expects kobo, not naira
    currency: 'NGN',
    ref: reference,
    metadata: {
      courseCode: book.code,
      uid: state.currentUser.uid
    },
    callback: function (response) {
      onSuccess(response.reference);
    },
    onClose: function () {
      // Student closed the popup without paying — nothing to do.
    }
  });

  handler.openIframe();
}