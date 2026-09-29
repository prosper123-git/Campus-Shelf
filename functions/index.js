const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/purchase', async (req, res) => {
  const { userId, bookId } = req.body || {};
  if (!userId || !bookId) {
    return res.status(400).json({ error: 'Missing userId or bookId' });
  }

  try {
    // Placeholder: integrate real payment and database logic here
    const purchase = {
      userId,
      bookId,
      purchasedAt: new Date().toISOString()
    };

    // Optionally store purchase in Firestore
    try {
      const db = admin.firestore();
      await db.collection('purchases').add(purchase);
    } catch (e) {
      console.warn('Firestore write failed (dev):', e.message);
    }

    res.json({ success: true, purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);
