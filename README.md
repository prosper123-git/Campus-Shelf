📚 Campus-Shelf

![Campus-Shelf Banner](banner/campus_shelf_banner.svg)

A Digital Textbook Platform for Babcock University Students.

## Overview

Campus-Shelf is a digital textbook platform built for Babcock University students to purchase and access lecturer-authored textbooks. It's built with vanilla HTML/CSS/JavaScript on the frontend and Firebase on the backend for authentication, data storage, and file hosting — giving students a fast, reliable way to find and read course materials online.

> **⚠️ Project Status: In Progress**
> Campus-Shelf is not yet complete. The core platform — auth, textbook storage, and reading — is functional, but a **payment system** still needs to be integrated before the platform is ready for real transactions.

## Project Identity

**Campus-Shelf**
Built by: Prosper
Repo: [github.com/prosper123-git/Campus-Shelf](https://github.com/prosper123-git/Campus-Shelf/tree/main)

## Key Features

- 📖 **Lecturer-Authored Textbooks** — Access course materials written by Babcock University lecturers
- 🔐 **Firebase Authentication** — Secure sign-up and login flow
- 📄 **PDF Textbook Delivery** — Textbook files served straight from the `pdfs/` folder
- ☁️ **Firebase Backend** — Firestore and Storage power the data and file layer
- 🚀 **Firebase Hosting** — Deployed directly through Firebase, no separate frontend framework

## Status / Roadmap

| Feature | Status |
|---|---|
| Auth flow (sign-up/login) | ✅ |
| Firestore data layer | ✅ |
| Textbook storage & retrieval | ✅ |
| Firebase Hosting deployment | ✅ |
| **Payment system** | ❌ Not yet integrated — **required to complete the platform** |

## Technologies

- **HTML / CSS / JavaScript** — Vanilla frontend (`index.html`, `js/`)
- **Firebase** — Auth, Firestore, Storage, and Hosting (`firebase.json`, `.firebaserc`)
- **Firebase Hosting** — Deployment
- **Payment gateway** — Planned, not yet integrated

## Directory Structure

```
Campus-Shelf/
├── .vscode/         # Editor settings
├── js/              # Frontend JavaScript (auth, Firebase config, app logic)
├── pdfs/            # Textbook PDF files
├── .firebaserc      # Firebase project configuration
├── firebase.json    # Firebase Hosting configuration
├── index.html       # Main app entry point
├── 404.html         # Custom error page
└── README.md
```

## Installation

Make sure you have the **Firebase CLI** installed, and a Firebase project set up with Auth, Firestore, and Storage enabled.

```bash
git clone https://github.com/prosper123-git/Campus-Shelf.git
cd Campus-Shelf
firebase login
firebase serve
```

Then open the local address shown in your terminal (e.g. `http://localhost:5000`) to view the app locally. Add your Firebase config keys in the `js/` folder before running.

To deploy: `firebase deploy`.

> If the issue persists, please reach out via GitHub issues.

## Why Choose Campus-Shelf?

- **Built for Students** — Solves a real, local problem: affordable access to course textbooks
- **Simple & Lightweight** — Vanilla JS + Firebase, no framework overhead
- **Easy to Deploy** — Firebase Hosting means one command to ship changes
- **Actively Being Built** — Core platform works; payments are the last major piece

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
