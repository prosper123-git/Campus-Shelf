// Single source of truth for the current logged-in user. Firebase's
// onAuthStateChanged (wired in main.js) is the only thing that writes
// to this; every other module just reads state.currentUser.
export const state = {
  currentUser: null
};