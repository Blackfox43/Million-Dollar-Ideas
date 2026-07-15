import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin SDK
// Make sure your FIREBASE_SERVICE_ACCOUNT env variable points to your service account key file
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 5000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// Stripe requires the RAW body string to verify signature authenticity on Webhooks.
// We declare this endpoint BEFORE app.use(express.json()) so it intercepts raw payloads.
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // 1. User successfully pays for a recurring plan
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const firebaseUid = session.metadata?.firebaseUid;

      if (firebaseUid) {
        await db.collection('users').doc(firebaseUid).set({
          isPremium: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`User ${firebaseUid} successfully upgraded to Premium.`);
      }
    }

    // 2. User cancels their subscription, or card fails to renew
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await userDoc.ref.set({
          isPremium: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`User ${userDoc.id} subscription canceled. Downgraded from Premium.`);
      }
    }

    res.json({ received: true });
  } catch (dbError: any) {
    console.error(`Database operations failed for event ${event.type}:`, dbError);
    res.status(500).send('Internal Server Error updating billing document.');
  }
});

// Parse regular JSON bodies for standard endpoints
app.use(express.json());

// API Endpoint: Trigger Stripe Checkout
app.post('/api/checkout/create-session', async (req, res) => {
  const { firebaseUid, email } = req.body;

  if (!firebaseUid || !email) {
    return res.status(400).json({ error: 'Missing user credentials (UID and email)' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // Your Stripe Subscription Plan Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hub?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
      customer_email: email,
      metadata: {
        firebaseUid: firebaseUid, // Important: Tells our webhook which database user to upgrade
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Failed to generate Stripe checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint: Access Stripe Billing Portal to manage, cancel, or update cards
app.post('/api/checkout/portal', async (req, res) => {
  const { stripeCustomerId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({ error: 'User does not possess an active Stripe profile' });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/hub`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Failed to open billing customer portal:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Secure Stripe API online and listening on port ${PORT}`);
});
