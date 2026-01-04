/**
 * Firebase Authentication Middleware
 *
 * Verifies Firebase ID tokens and ensures userId in requests matches the authenticated user.
 * Uses Option B pattern (individual env vars): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: DecodedIdToken;
    }
  }
}

// Initialize Firebase Admin (Option B - individual env vars)
// Pattern from api/stripe-webhook.ts:12-18
let app: App;
if (getApps().length === 0) {
  try {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Auth] Firebase Admin initialized successfully');
  } catch (error) {
    console.error('[Auth] Firebase Admin initialization error:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization: Bearer <token> header
 * Attaches decoded token to req.firebaseUser
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}

/**
 * Middleware to verify Firebase token AND validate userId matches
 * Use this for routes with :userId param
 * Returns 401 if token invalid, 403 if userId mismatch
 */
export async function verifyUserAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);
    req.firebaseUser = decodedToken;

    // Check userId in params
    const paramUserId = req.params.userId;
    if (paramUserId && paramUserId !== decodedToken.uid) {
      console.warn(`[Auth] userId mismatch: param=${paramUserId}, token=${decodedToken.uid}`);
      res.status(403).json({ error: 'Access denied: userId mismatch' });
      return;
    }

    // Check userId in body (for POST requests)
    const bodyUserId = req.body?.userId;
    if (bodyUserId && bodyUserId !== decodedToken.uid) {
      console.warn(`[Auth] userId mismatch: body=${bodyUserId}, token=${decodedToken.uid}`);
      res.status(403).json({ error: 'Access denied: userId mismatch' });
      return;
    }

    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}
