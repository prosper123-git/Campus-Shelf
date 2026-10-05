import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  collection, getDocs, orderBy, query
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { books } from './books_data.js';

const $ = (id) => document.getElementById(id);
const naira = (n) => '₦' + Number(n).toLocaleString();

// Student names and emails are typed by users, so always escape them
// before putting them into HTML.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const fmtDate = (ts) =>
  ts && ts.toDate
    ? ts.toDate().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

let students = [];
let payments = [];

function showView(name) {
  ['loginView', 'deniedView', 'dashView'].forEach((id) =>
    $(id).classList.toggle('hidden', id !== name + 'View')
  );
}

// ---------- Auth ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) { showView('login'); return; }

  // Force-refresh the token so a newly granted admin claim is picked up.
  const token = await user.getIdTokenResult(true);
  if (!token.claims.admin) { showView('denied'); return; }

  $('adminEmail').textContent = user.email;
  showView('dash');
  loadDashboard();
});

$('loginBtn').addEventListener('click', async () => {
  $('loginError').textContent = '';
  try {
    await signInWithEmailAndPassword(auth, $('loginEmail').value, $('loginPassword').value);
  } catch (err) {
    $('loginError').textContent = err.message;
  }
});

$('signOutBtn').addEventListener('click', () => signOut(auth));
$('deniedSignOut').addEventListener('click', () => signOut(auth));
$('refreshBtn').addEventListener('click', loadDashboard);
$('studentSearch').addEventListener('input', renderStudents);

// ---------- Data ----------
async function loadDashboard() {
  $('status').textContent = 'Loading…';
  try {
    const [userSnap, paySnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')))
    ]);
    students = userSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    payments = paySnap.docs.map((d) => ({ ref: d.id, ...d.data() }));
    students.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    renderStats();
    renderBooks();
    renderPayments();
    renderStudents();
    $('status').textContent = 'Updated ' + new Date().toLocaleTimeString();
  } catch (err) {
    console.error(err);
    $('status').textContent = 'Could not load data: ' + err.message;
  }
}

// ---------- Rendering ----------
function renderStats() {
  const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100; // kobo -> naira
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const todayCount = payments.filter(
    (p) => p.createdAt?.toDate && p.createdAt.toDate() >= startOfToday
  ).length;

  const cards = [
    ['Students', students.length],
    ['Total sales', payments.length],
    ['Revenue', naira(revenue)],
    ["Today's sales", todayCount]
  ];
  $('stats').innerHTML = cards.map(([label, value]) =>
    `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`
  ).join('');
}

function renderBooks() {
  const rows = books.map((b) => {
    const sold = payments.filter((p) => p.courseCode === b.code);
    return { ...b, copies: sold.length, revenue: sold.reduce((s, p) => s + (p.amount || 0), 0) / 100 };
  }).sort((a, b) => b.copies - a.copies);

  const max = Math.max(1, ...rows.map((r) => r.copies));

  $('booksTable').innerHTML = `
    <tr><th>Code</th><th>Title</th><th>Price</th><th>Copies sold</th><th></th><th>Revenue</th></tr>
    ${rows.map((r) => `
      <tr>
        <td>${esc(r.code)}</td>
        <td>${esc(r.title)}</td>
        <td>${naira(r.price)}</td>
        <td>${r.copies}</td>
        <td><div class="bar"><span style="width:${(r.copies / max) * 100}%"></span></div></td>
        <td>${naira(r.revenue)}</td>
      </tr>`).join('')}`;
}

function renderPayments() {
  const nameOf = Object.fromEntries(students.map((s) => [s.uid, s.fullName || s.email || s.uid]));
  const recent = payments.slice(0, 25);

  if (recent.length === 0) {
    $('paymentsTable').innerHTML = '<tr><td class="empty">No payments yet.</td></tr>';
    return;
  }

  $('paymentsTable').innerHTML = `
    <tr><th>Date</th><th>Student</th><th>Book</th><th>Amount</th><th>Reference</th></tr>
    ${recent.map((p) => `
      <tr>
        <td>${esc(fmtDate(p.createdAt))}</td>
        <td>${esc(nameOf[p.uid] || p.uid)}</td>
        <td>${esc(p.courseCode)}</td>
        <td>${naira((p.amount || 0) / 100)}</td>
        <td>${esc(p.ref)}</td>
      </tr>`).join('')}`;
}

function renderStudents() {
  const q = $('studentSearch').value.trim().toLowerCase();
  const list = students.filter((s) =>
    [s.fullName, s.email, s.matricNumber, s.department]
      .some((v) => String(v || '').toLowerCase().includes(q))
  );

  if (list.length === 0) {
    $('studentsTable').innerHTML = '<tr><td class="empty">No students match.</td></tr>';
    return;
  }

  $('studentsTable').innerHTML = `
    <tr><th>Name</th><th>Department</th><th>Matric no.</th><th>Email</th><th>Joined</th><th>Books</th></tr>
    ${list.map((s) => `
      <tr>
        <td>${esc(s.fullName)}</td>
        <td>${esc(s.department)}</td>
        <td>${esc(s.matricNumber)}</td>
        <td>${esc(s.email)}</td>
        <td>${esc(fmtDate(s.createdAt))}</td>
        <td>${payments.filter((p) => p.uid === s.uid).length}</td>
      </tr>`).join('')}`;
}