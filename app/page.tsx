"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { books, type Book } from "@/lib/books";

type Page = "home" | "catalogue" | "purchased" | "about";
type BookCitation = { page: number; excerpt: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CAMPUSSHELF_API_URL || "https://campusshelf-api-nu.vercel.app/api";

const formatPrice = (price: number) => `₦${price.toLocaleString("en-NG")}`;
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [purchasedCodes, setPurchasedCodes] = useState<string[]>([]);
  const [pdfLinks, setPdfLinks] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aiBookCode, setAiBookCode] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiCitations, setAiCitations] = useState<BookCitation[]>([]);
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setError("");
      if (!currentUser) {
        setFirstName("");
        setPurchasedCodes([]);
        setPdfLinks({});
        aiRequestId.current++;
        setAiBookCode("");
        setAiQuestion("");
        setAiAnswer("");
        setAiCitations([]);
        setAiError("");
        setAiLoading(false);
        return;
      }

      setFirstName(
        currentUser.displayName?.trim().split(/\s+/)[0] ||
          currentUser.email?.split("@")[0] ||
          "there",
      );
      const profilePromise = getDoc(doc(db, "users", currentUser.uid))
        .then((profile) => {
          const fullName = profile.data()?.fullName;
          if (active && typeof fullName === "string" && auth.currentUser?.uid === currentUser.uid) {
            setFirstName(fullName.trim().split(/\s+/)[0] || currentUser.email?.split("@")[0] || "there");
          }
        })
        .catch((profileError: unknown) => {
          if (active && auth.currentUser?.uid === currentUser.uid) {
            setError(`Could not load your profile: ${getErrorMessage(profileError)}`);
          }
        });

      try {
        const purchases = await getDocs(collection(db, "users", currentUser.uid, "purchases"));
        const codes = purchases.docs.map((purchase) => purchase.id);
        const links = await Promise.all(
          codes.map(async (code) => {
            const file = await getDoc(doc(db, "bookFiles", code));
            const pdfUrl = file.exists() ? file.data().pdfUrl : undefined;
            return [code, typeof pdfUrl === "string" ? pdfUrl : ""] as const;
          }),
        );
        await profilePromise;
        if (active) {
          setPurchasedCodes(codes);
          setPdfLinks(Object.fromEntries(links));
        }
      } catch (loadError) {
        if (active) setError(`Could not load your purchases: ${getErrorMessage(loadError)}`);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter(
      (book) => book.title.toLowerCase().includes(query) || book.code.toLowerCase().includes(query),
    );
  }, [search]);

  const purchasedBooks = books.filter((book) => purchasedCodes.includes(book.code));

  function navigate(nextPage: Page) {
    if (nextPage === "purchased" && !user) {
      setError("Please log in to view purchased books.");
      setModalOpen(true);
      return;
    }
    setError("");
    setPage(nextPage);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (signupMode) {
        if (!fullName.trim()) {
          setError("Enter your full name.");
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          fullName: fullName.trim(),
          department: department.trim(),
          matricNumber: matricNumber.trim(),
          email,
          createdAt: new Date(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setModalOpen(false);
      setPassword("");
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setError("");
    try {
      await signOut(auth);
    } catch (logoutError) {
      setError(`Could not log out: ${getErrorMessage(logoutError)}`);
    }
  }

  function purchaseBook(book: Book) {
    if (!user?.email) {
      setError("Please log in before purchasing a book.");
      setModalOpen(true);
      return;
    }
    if (!window.PaystackPop) {
      setError("The payment system failed to load. Check your connection and try again.");
      return;
    }

    const reference = `bushelf_${book.code.replace(/\s+/g, "")}_${Date.now()}`;
    window.PaystackPop.setup({
      key: "pk_test_be4fe089c2dd98ded14bddb1b637022dc357f685",
      email: user.email,
      amount: book.price * 100,
      currency: "NGN",
      ref: reference,
      metadata: { courseCode: book.code, uid: user.uid },
      callback: async (response) => {
        setError("");
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error("Your session expired. Please log in again.");
          const token = await currentUser.getIdToken();
          const result = await fetch("https://campusshelf-api-nu.vercel.app/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reference: response.reference }),
          });
          const body = (await result.json()) as { error?: string };
          if (!result.ok) throw new Error(body.error || "Payment verification failed.");

          const purchases = await getDocs(collection(db, "users", currentUser.uid, "purchases"));
          const codes = purchases.docs.map((purchase) => purchase.id);
          const links = await Promise.all(
            codes.map(async (code) => {
              const file = await getDoc(doc(db, "bookFiles", code));
              const pdfUrl = file.exists() ? file.data().pdfUrl : undefined;
              return [code, typeof pdfUrl === "string" ? pdfUrl : ""] as const;
            }),
          );
          setPurchasedCodes(codes);
          setPdfLinks(Object.fromEntries(links));
          navigate("purchased");
        } catch (paymentError) {
          setError(
            `We couldn't confirm your payment yet. Keep this reference and contact support: ${response.reference}. ${getErrorMessage(paymentError)}`,
          );
        }
      },
      onClose: () => {},
    }).openIframe();
  }

  async function askBookQuestion(event: FormEvent<HTMLFormElement>, book: Book) {
    event.preventDefault();
    const question = aiQuestion.trim();
    if (!question || aiLoading) return;

    const requestId = ++aiRequestId.current;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    setAiCitations([]);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Please log in to ask a question.");

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/ask-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookCode: book.code, question }),
      });
      const responseText = await response.text();
      let body: { answer?: unknown; citations?: unknown; error?: unknown };
      try {
        body = JSON.parse(responseText) as typeof body;
      } catch {
        throw new Error(response.ok ? "The AI service returned an invalid response." : "The AI service is temporarily unavailable.");
      }
      if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not answer that question.");
      }
      if (typeof body.answer !== "string") throw new Error("The AI service returned an invalid response.");
      const citations = Array.isArray(body.citations)
        ? body.citations.flatMap((citation): BookCitation[] => {
            if (!citation || typeof citation !== "object") return [];
            const source = citation as { page?: unknown; excerpt?: unknown };
            return typeof source.page === "number" &&
              Number.isInteger(source.page) &&
              typeof source.excerpt === "string"
              ? [{ page: source.page, excerpt: source.excerpt }]
              : [];
          })
        : [];

      if (requestId === aiRequestId.current) {
        setAiAnswer(body.answer);
        setAiCitations(citations);
      }
    } catch (questionError) {
      if (requestId === aiRequestId.current) setAiError(getErrorMessage(questionError));
    } finally {
      if (requestId === aiRequestId.current) setAiLoading(false);
    }
  }

  function renderBookCard(book: Book, isPurchased: boolean) {
    const pdfUrl = pdfLinks[book.code];
    const isAskingThisBook = aiBookCode === book.code;
    return (
      <article className="book-card" key={book.code}>
        <span className="book-code">{book.code}</span>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-dept">{book.dept}</p>
        <div className="book-footer">
          <span className="book-price">{formatPrice(book.price)}</span>
          {isPurchased ? (
            <div className="book-actions">
              {pdfUrl ? (
                <a className="book-btn" href={pdfUrl} target="_blank" rel="noreferrer">Open</a>
              ) : (
                <button className="book-btn" type="button" disabled>Purchased</button>
              )}
              <button
                className="book-btn book-btn-secondary"
                type="button"
                aria-expanded={isAskingThisBook}
                onClick={() => {
                  aiRequestId.current++;
                  setAiLoading(false);
                  setAiBookCode(isAskingThisBook ? "" : book.code);
                  setAiQuestion("");
                  setAiAnswer("");
                  setAiCitations([]);
                  setAiError("");
                }}
              >
                {isAskingThisBook ? "Close" : "Ask AI"}
              </button>
            </div>
          ) : (
            <button className="book-btn" type="button" onClick={() => purchaseBook(book)}>Buy</button>
          )}
        </div>
        {isPurchased && isAskingThisBook && (
          <section className="book-qa" aria-label={`Ask a question about ${book.title}`}>
            <h4>Ask this book</h4>
            <p>Answers are based on the text of your purchased book.</p>
            <form onSubmit={(event) => void askBookQuestion(event, book)}>
              <label className="sr-only" htmlFor={`question-${book.code}`}>Your question</label>
              <textarea
                id={`question-${book.code}`}
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder="What would you like to understand?"
                maxLength={1000}
                required
              />
              <button className="book-btn" type="submit" disabled={aiLoading || !aiQuestion.trim()}>
                {aiLoading ? "Searching the book…" : "Ask question"}
              </button>
            </form>
            {aiError && <p className="book-qa-error" role="alert">{aiError}</p>}
            {aiAnswer && (
              <div className="book-qa-answer" aria-live="polite">
                <p>{aiAnswer}</p>
                {aiCitations.length > 0 && (
                  <div className="book-qa-citations">
                    <strong>Sources in the book</strong>
                    {aiCitations.map((citation, index) => (
                      <p key={`${citation.page}-${index}`}>
                        Page {citation.page}: {citation.excerpt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </article>
    );
  }

  function navLink(label: string, target: Page) {
    return (
      <a
        className={`nav-link${page === target ? " active" : ""}`}
        href={`#${target}`}
        key={target}
        onClick={(event) => { event.preventDefault(); navigate(target); }}
      >
        {label}
      </a>
    );
  }

  function authAction() {
    if (user) void handleLogout();
    else { setError(""); setModalOpen(true); }
  }

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <div className="nav-inner">
          <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); navigate("home"); }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="7" height="22" rx="1.5" fill="#0A2856" transform="rotate(-6 4 6)" />
              <rect x="13" y="4" width="7" height="24" rx="1.5" fill="#2E6FD9" transform="rotate(-2 13 4)" />
              <rect x="22" y="7" width="7" height="21" rx="1.5" fill="#0A2856" transform="rotate(5 22 7)" />
            </svg>
            <span className="brand-name">CampusShelf</span>
          </a>
          <div className="nav-links">
            {navLink("Home", "home")}
            {navLink("Catalogue", "catalogue")}
            {navLink("Purchased", "purchased")}
            {navLink("About", "about")}
            <button className="nav-cta" type="button" onClick={authAction}>
              {user ? `Hello, ${firstName || user.email?.split("@")[0] || "there"}` : "Login / Sign up"}
            </button>
          </div>
          <button
            className={`hamburger${mobileMenuOpen ? " open" : ""}`}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          ><span /></button>
        </div>
        <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
          {navLink("Home", "home")}
          {navLink("Catalogue", "catalogue")}
          {navLink("Purchased", "purchased")}
          {navLink("About", "about")}
          <button className="nav-cta" type="button" onClick={authAction}>
            {user ? "Log out" : "Login / Sign up"}
          </button>
        </div>
      </nav>

      <main className="min-h-[70vh]">
        {error && <p className="notice" role="alert">{error}</p>}
        <section className={`page${page === "home" ? " active" : ""}`}>
          <div className="hero">
            <div className="hero-text">
              <span className="hero-eyebrow">Built for University Students</span>
              <h1>Your course textbooks. Digital. Affordable. Always in your bag.</h1>
              <p className="lead">CampusShelf gives students in-app access to lecturer-written course textbooks at a fraction of the print cost — no queueing at the bookstore, no heavy bags across the hilltop.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate("catalogue")}>Browse the catalogue</button>
                <button className="btn-secondary" onClick={() => navigate("about")}>How it works</button>
              </div>
            </div>
            <svg className="shelf-art" viewBox="0 0 420 320" fill="none" role="img" aria-label="Illustration of a bookshelf">
              <rect x="10" y="250" width="400" height="14" rx="4" fill="#0A2856" />
              <rect x="30" y="120" width="30" height="130" rx="3" fill="#2E6FD9" />
              <rect x="66" y="90" width="26" height="160" rx="3" fill="#0A2856" />
              <rect x="98" y="140" width="34" height="110" rx="3" fill="#B5D4F4" />
              <rect x="138" y="70" width="28" height="180" rx="3" fill="#123B7A" />
              <rect x="172" y="110" width="30" height="140" rx="3" fill="#2E6FD9" />
              <rect x="208" y="150" width="26" height="100" rx="3" fill="#0A2856" />
              <rect x="240" y="95" width="32" height="155" rx="3" fill="#B5D4F4" />
              <rect x="278" y="130" width="28" height="120" rx="3" fill="#123B7A" />
              <rect x="312" y="105" width="30" height="145" rx="3" fill="#2E6FD9" />
              <rect x="348" y="145" width="26" height="105" rx="3" fill="#0A2856" />
              <rect x="10" y="60" width="400" height="14" rx="4" fill="#0A2856" />
              <rect x="46" y="0" width="30" height="55" rx="3" fill="#123B7A" />
              <rect x="90" y="10" width="34" height="45" rx="3" fill="#2E6FD9" />
              <rect x="140" y="0" width="26" height="55" rx="3" fill="#0A2856" />
              <rect x="200" y="8" width="30" height="47" rx="3" fill="#B5D4F4" />
              <rect x="250" y="0" width="28" height="55" rx="3" fill="#2E6FD9" />
              <rect x="300" y="12" width="32" height="43" rx="3" fill="#123B7A" />
            </svg>
          </div>
          <div className="features">
            <div className="feature-card"><span className="num">01</span><h3>100% lecturer-authored</h3><p>Every title on CampusShelf is written by the University faculty — no third-party publishers, no imported editions.</p></div>
            <div className="feature-card"><span className="num">02</span><h3>Cheaper than print</h3><p>Every book on CampusShelf is priced under ₦7,000 — a fraction of what students currently pay for physical copies.</p></div>
            <div className="feature-card"><span className="num">03</span><h3>Read anywhere</h3><p>Access your books from your phone or laptop, in or out of class — no more carrying textbooks across campus.</p></div>
          </div>
        </section>

        <section className={`page${page === "catalogue" ? " active" : ""}`}>
          <div className="cat-header">
            <h1>Catalogue</h1>
            <p>Browse textbooks by course. Every title is written by a University lecturer and priced at ₦7,000 or less.</p>
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </span>
              <input aria-label="Search course title or code" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course title / course code" />
            </div>
          </div>
          <div className="cat-grid">
            {filteredBooks.length ? filteredBooks.map((book) => renderBookCard(book, purchasedCodes.includes(book.code))) : <p className="no-results">No books match that search. Try a different course title or code.</p>}
          </div>
        </section>

        <section className={`page${page === "purchased" ? " active" : ""}`}>
          <div className="cat-header">
            <h1>Purchased books</h1>
            <p>All books you have bought appear here. After purchase, open a title to access the digital copy when available.</p>
          </div>
          <div className="cat-grid">
            {!user ? <p className="no-results">Please log in to view your purchased books.</p> : purchasedBooks.length ? purchasedBooks.map((book) => renderBookCard(book, true)) : <p className="no-results">You have not purchased any books yet. Browse the catalogue to buy one.</p>}
          </div>
        </section>

        <section className={`page${page === "about" ? " active" : ""}`}>
          <div className="about-wrap">
            <h1>About CampusShelf</h1>
            <p>CampusShelf is a digital textbook platform built for University students. Every semester, students spend a significant amount on physical textbooks that are expensive to print and heavy to carry across a campus spread over a hilltop. CampusShelf solves this by giving lecturers a way to publish their course textbooks digitally, and students a way to get instant, affordable access — right from their phone or laptop.</p>
            <p>Because every textbook used at the University is written by a lecturer, CampusShelf works directly with course authors and departments to bring official course material online, rather than reselling outside publishers&apos; content.</p>
            <h2>What we&apos;re trying to do</h2>
            <ul className="about-list">
              <li><span className="dot" /><span><strong>Lower the cost of course materials.</strong> No title on CampusShelf is priced above ₦7,000, well under typical print costs.</span></li>
              <li><span className="dot" /><span><strong>Keep it official.</strong> Every book is linked to a real course code and uploaded directly by the lecturer or department that wrote it.</span></li>
              <li><span className="dot" /><span><strong>Make studying lighter, literally.</strong> Read your books in-app, on any device, without carrying physical copies between hostels and lecture halls.</span></li>
              <li><span className="dot" /><span><strong>Respect how the University works.</strong> CampusShelf is a platform for lecturers and departments to distribute their own material to students — it is not a marketplace for students to buy or sell among themselves.</span></li>
            </ul>
            <h2>Who it&apos;s for</h2>
            <p>CampusShelf is built for University undergraduate and postgraduate students across all colleges — from Basic and Applied Sciences to Business, Law, Theology and Nursing — and for the lecturers who write the textbooks they study from.</p>
          </div>
        </section>
      </main>

      <footer className="footer">© 2026 CampusShelf — an independent student project for the University.</footer>

      <div className={`modal-overlay${modalOpen ? " open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
          <h2 id="modal-title">{signupMode ? "Create your account" : "Welcome back"}</h2>
          <p className="sub">{signupMode ? "Sign up with your student email." : "Log in to access your books."}</p>
          <div className="modal-tabs">
            <button className={`modal-tab${!signupMode ? " active" : ""}`} type="button" onClick={() => { setSignupMode(false); setError(""); }}>Log in</button>
            <button className={`modal-tab${signupMode ? " active" : ""}`} type="button" onClick={() => { setSignupMode(true); setError(""); }}>Sign up</button>
          </div>
          <form onSubmit={handleAuth}>
            {signupMode && <>
              <div className="modal-field"><label htmlFor="fullName">Full name</label><input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Chidinma Okafor" required /></div>
              <div className="modal-field"><label htmlFor="department">Department</label><input id="department" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Computer Science" /></div>
              <div className="modal-field"><label htmlFor="matricNumber">Matric number</label><input id="matricNumber" value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} placeholder="21/1234" /></div>
            </>}
            <div className="modal-field"><label htmlFor="email">Student email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@student.student.edu.ng" required /></div>
            <div className="modal-field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div>
            {error && <p className="notice" role="alert">{error}</p>}
            <button className="modal-submit" type="submit" disabled={submitting}>{submitting ? "Please wait…" : signupMode ? "Sign up" : "Log in"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
