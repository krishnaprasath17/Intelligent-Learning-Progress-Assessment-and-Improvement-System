import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { firestore } from './firebaseAuth';
import { AccessControlEntry } from '../src/types';

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

function resolveSafeAccessControlFile(): string {
  if (process.env.ACCESS_CONTROL_FILE) {
    return path.resolve(process.env.ACCESS_CONTROL_FILE);
  }
  if (IS_SERVERLESS) {
    return path.resolve(os.tmpdir(), 'access-control.json');
  }
  const localDefault = path.resolve(process.cwd(), 'data', 'access-control.json');
  try {
    fs.mkdirSync(path.dirname(localDefault), { recursive: true });
    return localDefault;
  } catch {
    return path.resolve(os.tmpdir(), 'access-control.json');
  }
}

const ACCESS_CONTROL_FILE = resolveSafeAccessControlFile();

// Normalizes email addresses (lowercase, trimmed)
export function normalizeEmail(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

class AccessControlService {
  private cache: Map<string, AccessControlEntry> = new Map();
  public ready: Promise<void>;

  constructor() {
    this.loadLocal();
    this.ready = this.bootstrap();
  }

  private loadLocal() {
    if (!fs.existsSync(ACCESS_CONTROL_FILE)) return;
    try {
      const data = JSON.parse(fs.readFileSync(ACCESS_CONTROL_FILE, 'utf8'));
      if (Array.isArray(data)) {
        for (const entry of data) {
          const norm = normalizeEmail(entry.email);
          if (norm) {
            this.cache.set(norm, {
              ...entry,
              email: norm,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Unable to read local access control cache:', err);
    }
  }

  private persistLocal() {
    try {
      fs.mkdirSync(path.dirname(ACCESS_CONTROL_FILE), { recursive: true });
      fs.writeFileSync(
        ACCESS_CONTROL_FILE,
        JSON.stringify(Array.from(this.cache.values()), null, 2),
        'utf8'
      );
    } catch (err) {
      console.warn('Unable to persist local access control cache:', err);
    }
  }

  private async bootstrap(): Promise<void> {
    // 1. Sync from Firestore collection 'accessControl'
    if (firestore) {
      try {
        const snap = await firestore.collection('accessControl').get();
        snap.forEach((doc) => {
          const data = doc.data() as Partial<AccessControlEntry>;
          const norm = normalizeEmail(doc.id || data.email);
          if (norm) {
            this.cache.set(norm, {
              email: norm,
              approved: Boolean(data.approved),
              role: data.role === 'admin' ? 'admin' : 'user',
              approvedAt: data.approvedAt || new Date().toISOString(),
              approvedBy: data.approvedBy || 'system',
              notes: data.notes || '',
            });
          }
        });

        // Real-time Firestore synchronization listener
        try {
          firestore.collection('accessControl').onSnapshot(
            (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                const docId = change.doc.id;
                const data = change.doc.data() as Partial<AccessControlEntry>;
                const norm = normalizeEmail(docId || data.email);
                if (!norm) return;

                if (change.type === 'removed') {
                  this.cache.delete(norm);
                } else {
                  this.cache.set(norm, {
                    email: norm,
                    approved: Boolean(data.approved),
                    role: data.role === 'admin' ? 'admin' : 'user',
                    approvedAt: data.approvedAt || new Date().toISOString(),
                    approvedBy: data.approvedBy || 'system',
                    notes: data.notes || '',
                  });
                }
              });
              this.persistLocal();
            },
            (err) => {
              console.warn('Realtime accessControl subscription note:', err);
            }
          );
        } catch (subErr) {
          console.warn('Unable to bind realtime accessControl snapshot listener:', subErr);
        }
      } catch (err) {
        console.warn('Firestore accessControl load warning:', err);
      }
    }

    // 2. Bootstrap initial admin if configured via INITIAL_ADMIN_EMAIL or default owner
    const initialAdmin = normalizeEmail(
      process.env.INITIAL_ADMIN_EMAIL || 'krishnaprasathm.ad23@bitsathy.ac.in'
    );

    if (initialAdmin && !this.cache.has(initialAdmin)) {
      await this.setApproval(initialAdmin, {
        approved: true,
        role: 'admin',
        approvedBy: 'system-bootstrap',
        notes: 'Initial Platform Administrator',
      });
    } else if (initialAdmin && this.cache.get(initialAdmin)?.role !== 'admin') {
      await this.setApproval(initialAdmin, {
        approved: true,
        role: 'admin',
        approvedBy: 'system-bootstrap',
        notes: 'Promoted to Administrator',
      });
    }

    this.persistLocal();
  }

  public async getEntry(rawEmail?: string | null): Promise<AccessControlEntry | null> {
    const email = normalizeEmail(rawEmail);
    if (!email) return null;

    // Check in-memory cache first
    let entry = this.cache.get(email) || null;

    // Query Firestore if not found or sync
    if (firestore) {
      try {
        const docRef = firestore.collection('accessControl').doc(email);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data() as AccessControlEntry;
          entry = {
            email,
            approved: Boolean(data.approved),
            role: data.role === 'admin' ? 'admin' : 'user',
            approvedAt: data.approvedAt || new Date().toISOString(),
            approvedBy: data.approvedBy || 'admin',
            notes: data.notes || '',
          };
          this.cache.set(email, entry);
          this.persistLocal();
        }
      } catch (err) {
        console.warn(`Firestore read for accessControl/${email} error:`, err);
      }
    }

    return entry;
  }

  public async isApproved(rawEmail?: string | null): Promise<boolean> {
    const entry = await this.getEntry(rawEmail);
    return Boolean(entry && entry.approved);
  }

  public async isAdmin(rawEmail?: string | null): Promise<boolean> {
    const entry = await this.getEntry(rawEmail);
    return Boolean(entry && entry.approved && entry.role === 'admin');
  }

  public async listAll(): Promise<AccessControlEntry[]> {
    if (firestore) {
      try {
        const snap = await firestore.collection('accessControl').get();
        snap.forEach((doc) => {
          const data = doc.data() as Partial<AccessControlEntry>;
          const norm = normalizeEmail(doc.id || data.email);
          if (norm) {
            this.cache.set(norm, {
              email: norm,
              approved: Boolean(data.approved),
              role: data.role === 'admin' ? 'admin' : 'user',
              approvedAt: data.approvedAt || new Date().toISOString(),
              approvedBy: data.approvedBy || 'system',
              notes: data.notes || '',
            });
          }
        });
      } catch (err) {
        console.warn('Firestore accessControl list sync warning:', err);
      }
    }
    return Array.from(this.cache.values()).sort((a, b) => a.email.localeCompare(b.email));
  }

  public async setApproval(
    rawEmail: string,
    options: {
      approved: boolean;
      role: 'admin' | 'user';
      approvedBy: string;
      notes?: string;
    }
  ): Promise<AccessControlEntry> {
    const email = normalizeEmail(rawEmail);
    if (!email) throw new Error('A valid email address is required.');

    const entry: AccessControlEntry = {
      email,
      approved: options.approved,
      role: options.role,
      approvedAt: new Date().toISOString(),
      approvedBy: options.approvedBy,
      notes: options.notes || '',
    };

    this.cache.set(email, entry);
    this.persistLocal();

    if (firestore) {
      try {
        await firestore.collection('accessControl').doc(email).set(
          {
            email,
            approved: entry.approved,
            role: entry.role,
            approvedAt: entry.approvedAt,
            approvedBy: entry.approvedBy,
            notes: entry.notes,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`Firestore save to accessControl/${email} failed:`, err);
      }
    }

    return entry;
  }

  public async revokeApproval(rawEmail: string, revokedBy: string): Promise<boolean> {
    const email = normalizeEmail(rawEmail);
    if (!email) return false;

    const existing = await this.getEntry(email);
    if (!existing) return false;

    // Safety: Prevent revoking the root bootstrap admin if only 1 admin remains
    const allAdmins = Array.from(this.cache.values()).filter((e) => e.approved && e.role === 'admin');
    if (existing.role === 'admin' && allAdmins.length <= 1) {
      throw new Error('Cannot revoke or remove the last remaining administrator.');
    }

    const updated: AccessControlEntry = {
      ...existing,
      approved: false,
      approvedAt: new Date().toISOString(),
      approvedBy: revokedBy,
    };

    this.cache.set(email, updated);
    this.persistLocal();

    if (firestore) {
      try {
        await firestore.collection('accessControl').doc(email).set(
          {
            approved: false,
            updatedAt: new Date().toISOString(),
            updatedBy: revokedBy,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`Firestore update to accessControl/${email} failed:`, err);
      }
    }

    return true;
  }

  public async deleteEntry(rawEmail: string): Promise<boolean> {
    const email = normalizeEmail(rawEmail);
    if (!email) return false;

    const existing = await this.getEntry(email);
    if (existing && existing.role === 'admin') {
      const allAdmins = Array.from(this.cache.values()).filter((e) => e.approved && e.role === 'admin');
      if (allAdmins.length <= 1) {
        throw new Error('Cannot delete the last remaining administrator.');
      }
    }

    this.cache.delete(email);
    this.persistLocal();

    if (firestore) {
      try {
        await firestore.collection('accessControl').doc(email).delete();
      } catch (err) {
        console.warn(`Firestore delete for accessControl/${email} failed:`, err);
      }
    }

    return true;
  }
}

export const accessControlService = new AccessControlService();
