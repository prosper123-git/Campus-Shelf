"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { books } from "@/lib/books";

type Student = {
  uid: string;
  fullName?: string;
  email?: string;
  matricNumber?: string;
  department?: string;
  createdAt?: Timestamp;
};

type Payment = {
  ref: string;
  uid: string;
  courseCode: string;
  amount: number;
  createdAt?: Timestamp;
};

type View = "loading" | "login" | "denied" | "dashboard";
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred.";
const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const formatDate = (timestamp?: Timestamp) =>
  timestamp ? timestamp.toDate().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function AdminPage() {
  const [view, setView] = useState<View>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setStatus("Loading…");
    setError("");
    try {
      const [studentSnapshot, paymentSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc"))),
      ]);
      const nextStudents = studentSnapshot.docs.map((snapshot) => ({
        uid: snapshot.id,
        ...snapshot.data(),
      })) as Student[];
      const nextPayments = paymentSnapshot.docs.map((snapshot) => ({
        ref: snapshot.id,
        ...snapshot.data(),
      })) as Payment[];
      nextStudents.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setStudents(nextStudents);
      setPayments(nextPayments);
      setStatus(`Updated ${new Date().toLocaleTimeString()}`);
    } catch (loadError) {
      setError(`Could not load dashboard data: ${errorMessage(loadError)}`);
      setStatus("Data unavailable");
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    setError("");
    if (!currentUser) {
      setView("login");
      return;
    }
    setView("loading");
    try {
      const token = await currentUser.getIdTokenResult(true);
      if (!token.claims.admin) {
        setView("denied");
        return;
      }
      setView("dashboard");
      await loadDashboard();
    } catch (authError) {
      setError(`Could not verify administrator access: ${errorMessage(authError)}`);
      setView("denied");
    }
  }), [loadDashboard]);

  const filteredStudents = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return students.filter((student) =>
      [student.fullName, student.email, student.matricNumber, student.department]
        .some((value) => (value ?? "").toLowerCase().includes(queryText)),
    );
  }, [search, students]);

  const revenue = payments.reduce((total, payment) => total + (payment.amount || 0), 0) / 100;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaySales = payments.filter((payment) => payment.createdAt && payment.createdAt.toDate() >= startOfToday).length;

  const sales = books.map((book) => {
    const bookPayments = payments.filter((payment) => payment.courseCode === book.code);
    return {
      ...book,
      copies: bookPayments.length,
      revenue: bookPayments.reduce((total, payment) => total + (payment.amount || 0), 0) / 100,
    };
  }).sort((a, b) => b.copies - a.copies);
  const maxCopies = Math.max(1, ...sales.map((book) => book.copies));
  const studentsById = new Map(students.map((student) => [student.uid, student]));

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (loginError) {
      setError(errorMessage(loginError));
    }
  }

  if (view === "loading") {
    return <main className="admin-center"><p>Checking administrator access…</p></main>;
  }

  if (view === "login") {
    return (
      <main className="admin-center">
        <form className="admin-card" onSubmit={login}>
          <h1>Admin login</h1>
          <p>Sign in with your administrator account.</p>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-button" type="submit">Log in</button>
        </form>
      </main>
    );
  }

  if (view === "denied") {
    return (
      <main className="admin-center">
        <section className="admin-card">
          <h1>Access denied</h1>
          <p>This account does not have administrator access.</p>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-button light" onClick={() => void signOut(auth)}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <h1>CampusShelf Admin</h1>
        <div className="admin-toolbar">
          <span>{status}</span><span>{user?.email}</span>
          <button className="admin-button light" onClick={() => void loadDashboard()}>Refresh</button>
          <button className="admin-button" onClick={() => void signOut(auth)}>Sign out</button>
        </div>
      </header>
      <main className="admin-main">
        {error && <p className="admin-error" role="alert">{error}</p>}
        <section className="admin-stats">
          {[
            ["Students", students.length],
            ["Total sales", payments.length],
            ["Revenue", formatNaira(revenue)],
            ["Today's sales", todaySales],
          ].map(([label, value]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}
        </section>
        <section className="admin-panel">
          <h2>Sales by book</h2>
          <div className="admin-table-wrap"><table>
            <thead><tr><th>Code</th><th>Title</th><th>Price</th><th>Copies sold</th><th aria-label="Sales chart" /><th>Revenue</th></tr></thead>
            <tbody>{sales.map((book) => <tr key={book.code}>
              <td>{book.code}</td><td>{book.title}</td><td>{formatNaira(book.price)}</td><td>{book.copies}</td>
              <td><div className="admin-bar"><span style={{ width: `${(book.copies / maxCopies) * 100}%` }} /></div></td><td>{formatNaira(book.revenue)}</td>
            </tr>)}</tbody>
          </table></div>
        </section>
        <section className="admin-panel">
          <h2>Recent payments</h2>
          <div className="admin-table-wrap"><table>
            <thead><tr><th>Date</th><th>Student</th><th>Book</th><th>Amount</th><th>Reference</th></tr></thead>
            <tbody>{payments.length ? payments.slice(0, 25).map((payment) => (
              <tr key={payment.ref}>
                <td>{formatDate(payment.createdAt)}</td>
                <td>{studentsById.get(payment.uid)?.fullName || studentsById.get(payment.uid)?.email || payment.uid}</td>
                <td>{payment.courseCode}</td><td>{formatNaira((payment.amount || 0) / 100)}</td><td>{payment.ref}</td>
              </tr>
            )) : <tr><td colSpan={5}>No payments yet.</td></tr>}</tbody>
          </table></div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <h2>Students</h2>
            <input aria-label="Search students" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, matric or department" />
          </div>
          <div className="admin-table-wrap"><table>
            <thead><tr><th>Name</th><th>Department</th><th>Matric no.</th><th>Email</th><th>Joined</th><th>Books</th></tr></thead>
            <tbody>{filteredStudents.length ? filteredStudents.map((student) => (
              <tr key={student.uid}>
                <td>{student.fullName || "—"}</td><td>{student.department || "—"}</td><td>{student.matricNumber || "—"}</td>
                <td>{student.email || "—"}</td><td>{formatDate(student.createdAt)}</td>
                <td>{payments.filter((payment) => payment.uid === student.uid).length}</td>
              </tr>
            )) : <tr><td colSpan={6}>No students match.</td></tr>}</tbody>
          </table></div>
        </section>
      </main>
    </div>
  );
}
