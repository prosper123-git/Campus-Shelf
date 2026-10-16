📚 Campus-Shelf

![Campus-Shelf Banner](banner/campus_shelf_banner.svg)

A Digital Textbook Platform for Babcock University Students.

## Overview

Campus-Shelf is a digital textbook platform built for Babcock University students to purchase and access lecturer-authored textbooks. The frontend uses Next.js, TypeScript, and Tailwind CSS. Firebase provides authentication and data storage, and Paystack handles payments.

> **Project Status: In Progress**
> Paystack checkout and server-side payment verification are integrated. The frontend currently uses a Paystack test key; configure a production key and verify the payment provider setup before accepting real transactions.

## Project Identity

**Campus-Shelf**
Built by: Prosper
Repo: [github.com/prosper123-git/Campus-Shelf](https://github.com/prosper123-git/Campus-Shelf/tree/main)

## Key Features

- 📖 **Lecturer-Authored Textbooks** — Access course materials written by Babcock University lecturers
- 🔐 **Firebase Authentication** — Secure sign-up and login flow
- 📄 **PDF Textbook Delivery** — Textbook files served straight from the `pdfs/` folder
- 🤖 **AI book Q&A** — Ask questions about a purchased textbook and see supporting page excerpts
- ☁️ **Firebase Backend** — Firestore and Storage power the data and file layer
- 🚀 **Next.js** — React application with statically exported pages for Firebase Hosting

## Status / Roadmap

| Feature | Status |
|---|---|
| Auth flow (sign-up/login) | ✅ |
| Firestore data layer | ✅ |
| Textbook storage & retrieval | ✅ |
| **AI book Q&A** | 🧪 Backend and purchased-book access checks integrated; configure an AI provider to enable answers |
| Firebase Hosting deployment | ✅ |
| **Payment system** | 🧪 Integrated with Paystack test-mode checkout and server-side verification |

## Technologies

- **Next.js / React / TypeScript** — Frontend (`app/`, `lib/`)
- **Tailwind CSS** — Utility CSS framework, loaded in `app/globals.css`
- **Firebase** — Auth, Firestore, and Hosting (`firebase.json`, `.firebaserc`)
- **Firebase Hosting** — Deployment
- **Paystack** — Checkout and payment verification

## Directory Structure

```
Campus-Shelf/
├── .vscode/         # Editor settings
├── app/             # Next.js pages and global styles
├── lib/             # Typed book catalogue and Firebase client
├── pdfs/            # Textbook PDF files
├── .firebaserc      # Firebase project configuration
├── campus_shelfApi/ # Payment verification API
├── firebase.json    # Firebase Hosting configuration (Next.js static output)
└── README.md
```

## Installation

Install Node.js and the **Firebase CLI**, and make sure the Firebase project has Authentication and Firestore enabled.

```bash
git clone https://github.com/prosper123-git/Campus-Shelf.git
cd Campus-Shelf
npm install
npm run dev
```

Open `http://localhost:3000`. The Firebase client configuration is in `lib/firebase.ts`. The payment and book Q&A API must allow the frontend origin; `http://localhost:3000` is included for local development.

### Configure AI book Q&A

The Q&A endpoint is in `campus_shelfApi/api/ask-question.js`. It checks the Firebase ID token and purchase record, extracts relevant passages from the book PDF in Firebase, and sends only those passages to an **OpenAI-compatible chat-completions API**. The provider is selected through server-side environment variables; no model key is exposed to the browser. Students can ask up to 20 questions per UTC day.

Set these variables in the API deployment environment:

| Variable | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin service-account JSON, used to verify users and read purchase/PDF records |
| `AI_API_URL` | Full HTTPS URL of the provider's chat-completions endpoint |
| `AI_API_KEY` | Server-side API key for that provider |
| `AI_MODEL` | Model identifier accepted by the configured endpoint |

The configured Firebase `bookFiles/{bookCode}` document must contain a `pdfUrl` hosted on `bushelf.web.app`, `bushelf.firebaseapp.com`, or Firebase Storage. A site-relative path such as `/pdfs/CSC201.pdf` is also supported when the filename matches its book code. PDFs must contain selectable text and be no larger than 25 MB. To use a different API deployment, set `NEXT_PUBLIC_CAMPUSSHELF_API_URL` to its `/api` base URL when building the frontend; otherwise, the existing CampusShelf API URL is used.

Until the AI variables are configured and the API is deployed, the Q&A interface reports that the service is unavailable.

Run `npm run typecheck` to check the TypeScript sources.

To build and deploy the static Next.js site to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

The build exports pages to `out/` and copies the textbook PDFs into the exported static assets. The existing payment verification API remains in `campus_shelfApi/`.

> If the issue persists, please reach out via GitHub issues.

## Why Choose Campus-Shelf?

- **Built for Students** — Solves a real, local problem: affordable access to course textbooks
- **Simple & Lightweight** — Next.js frontend with Firebase services
- **Easy to Deploy** — Firebase Hosting means one command to ship changes
- **Actively Being Built** — Core platform works; production payment setup remains

## Contributing

Contributions are welcome! Whether it's fixing bugs, suggesting features, improving documentation, or helping finish the payment integration — your help is appreciated.

### How to Contribute

1. Fork the repository
2. Create a branch for your feature or bugfix
3. Commit your changes with clear messages
4. Open a Pull Request (PR) with a detailed description
5. Ensure your contribution aligns with the project's guidelines

## Contact

- GitHub: [prosper123-git](https://github.com/prosper123-git)
- LinkedIn: [Prosper Onyekwere](https://www.linkedin.com/in/prosper-onyekwere-034259332)
- Email: [prosperonyekwere62@gmail.com](mailto:prosperonyekwere62@gmail.com)
- Repo: [Campus-Shelf](https://github.com/prosper123-git/Campus-Shelf/tree/main)
