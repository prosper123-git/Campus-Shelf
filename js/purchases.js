const PURCHASED_KEY = 'campusShelfPurchasedBooks';

export function getPurchasedCodes() {
  try {
    return JSON.parse(localStorage.getItem(PURCHASED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function setPurchasedCodes(codes) {
  localStorage.setItem(PURCHASED_KEY, JSON.stringify([...new Set(codes)]));
}

export function addPurchasedBook(book) {
  const codes = getPurchasedCodes();
  if (!codes.includes(book.code)) {
    codes.push(book.code);
    setPurchasedCodes(codes);
  }
}