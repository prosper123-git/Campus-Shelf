import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

let purchasedCodes = [];

export function getPurchasedCodes() {
  return purchasedCodes;
}

export async function loadPurchases(uid) {
  if (!uid) {
    purchasedCodes = [];
    return;
  }
  const snap = await getDocs(collection(db, 'users', uid, 'purchases'));
  purchasedCodes = snap.docs.map(d => d.id);
}