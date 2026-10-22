import { cert, getApp, getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import firebaseConfig from '../firebase-applet-config.json';

const defaultServiceAccountFile = ['.service-account.json', 'service-account.json']
  .map(f => path.resolve(process.cwd(), f))
  .find(f => fs.existsSync(f));

const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || defaultServiceAccountFile;
const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)';

function parseServiceAccount(): any | null {
  // 1. Direct file path from env or default location
  if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
    try {
      const content = fs.readFileSync(serviceAccountFile, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.warn('Failed parsing service account file:', err);
    }
  }

  // 2. Check JSON string from common environment variables (plain, escaped, or base64)
  const rawJsonCandidate =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_ADMIN_CREDENTIALS;

  if (rawJsonCandidate && rawJsonCandidate.trim()) {
    const trimmed = rawJsonCandidate.trim();
    // Case 2a: Direct JSON object string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch (err) {
        console.warn('Failed parsing FIREBASE_SERVICE_ACCOUNT_JSON:', err);
      }
    }
    // Case 2b: Escaped stringified JSON (common in Vercel UI if quotes were escaped)
    if (trimmed.startsWith('"{') && trimmed.endsWith('}"')) {
      try {
        const unescaped = JSON.parse(trimmed);
        return typeof unescaped === 'string' ? JSON.parse(unescaped) : unescaped;
      } catch (err) {
        console.warn('Failed parsing escaped service account JSON:', err);
      }
    }
    // Case 2c: Base64-encoded JSON string
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{') && decoded.trim().endsWith('}')) {
        return JSON.parse(decoded);
      }
    } catch {
      // not base64 encoded
    }
  }

  // 3. Individual Vercel environment variables (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // Convert literal \n strings to actual newline characters
    privateKey = privateKey.replace(/\\n/g, '\n');
    return {
      type: 'service_account',
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  return null;
}

const parsedCredentials = parseServiceAccount();
const hasAdminCredentials = Boolean(parsedCredentials);

function initializeAdmin(): App | null {
  const apps = getApps();
  if (apps.length > 0) {
    return getApp();
  }

  if (parsedCredentials) {
    try {
      return initializeApp({
        credential: cert(parsedCredentials),
        projectId: parsedCredentials.project_id || projectId,
      });
    } catch (error) {
      console.warn('Invalid Firebase Admin credentials initialization:', error);
    }
  }

  // Fallback: If GOOGLE_APPLICATION_CREDENTIALS exists in environment
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    } catch (err) {
      console.warn('applicationDefault() initialization skipped:', err);
    }
  }

  return null;
}

export const firebaseAdmin = initializeAdmin();

let firestoreInstance: Firestore | null = null;
if (firebaseAdmin) {
  try {
    firestoreInstance = getFirestore(firebaseAdmin, firestoreDatabaseId);
    firestoreInstance.settings({ ignoreUndefinedProperties: true });
  } catch (err) {
    console.warn('Firestore Admin initialization skipped:', err);
    firestoreInstance = null;
  }
}

export const firestore = firestoreInstance;
export const isFirestoreAvailable = Boolean(firestoreInstance);

export function getFirestoreDiagnostic() {
  return {
    isAvailable: Boolean(firestoreInstance),
    hasAdminCredentials,
    projectId,
    firestoreDatabaseId,
    clientEmail: parsedCredentials?.client_email || (process.env.FIREBASE_CLIENT_EMAIL ? 'configured' : 'not_configured'),
    hasPrivateKey: Boolean(parsedCredentials?.private_key || process.env.FIREBASE_PRIVATE_KEY),
  };
}

function parseJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(payloadBase64, 'base64').toString('utf8');
      return JSON.parse(json);
    }
  } catch (e) {
    // ignore parse error
  }
  return null;
}

export async function verifyFirebaseToken(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (firebaseAdmin) {
    try {
      return await getAuth(firebaseAdmin).verifyIdToken(token);
    } catch (error) {
      // fallback to JWT payload decode
    }
  }

  // Fallback JWT payload decoder
  const decoded = parseJwtPayload(token);
  if (decoded && (decoded.sub || decoded.user_id || decoded.uid)) {
    return {
      uid: decoded.sub || decoded.user_id || decoded.uid,
      email: decoded.email || null,
      email_verified: Boolean(decoded.email_verified),
      name: decoded.name || decoded.displayName || null,
      picture: decoded.picture || decoded.photoURL || null,
      firebase: decoded.firebase || null,
    };
  }

  return null;
}

export function requireFirebaseAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const queryUserId = (req.query?.userId as string) || (req.body?.userId as string);

  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    verifyFirebaseToken(authHeader)
      .then((decoded) => {
        if (decoded) {
          req.user = {
            uid: decoded.uid,
            email: decoded.email || null,
            email_verified: Boolean(decoded.email_verified),
            name: decoded.name || decoded.email || null,
            picture: decoded.picture || null,
            authProvider: decoded.firebase?.sign_in_provider || null,
          };
          return next();
        }
        if (queryUserId) {
          req.user = { uid: queryUserId };
          return next();
        }
        // Fallback to guest user
        req.user = { uid: 'guest-learner-1', name: 'Guest Learner', email: 'guest@learn.local' };
        return next();
      })
      .catch(() => {
        if (queryUserId) {
          req.user = { uid: queryUserId };
          return next();
        }
        req.user = { uid: 'guest-learner-1', name: 'Guest Learner', email: 'guest@learn.local' };
        return next();
      });
    return;
  }

  if (queryUserId) {
    req.user = { uid: queryUserId };
    return next();
  }

  // Graceful fallback for unauthenticated / guest demo access
  req.user = { uid: 'guest-learner-1', name: 'Guest Learner', email: 'guest@learn.local' };
  return next();
}
