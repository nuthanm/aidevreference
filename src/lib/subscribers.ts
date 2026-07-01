import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type SubscriberRecord = {
  email: string;
  confirmed: boolean;
  createdAt: string;
  confirmedAt?: string;
  confirmToken?: string;
  confirmExpiresAt?: string;
  unsubscribeToken: string;
};

type LegacySubscriber = string;

type RawSubscriber = LegacySubscriber | Partial<SubscriberRecord>;

const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");
const CONFIRM_TOKEN_HOURS = 48;

function nowIso() {
  return new Date().toISOString();
}

function createToken(size = 24) {
  return randomBytes(size).toString("hex");
}

function normalizeSubscriber(raw: RawSubscriber): SubscriberRecord | null {
  if (typeof raw === "string") {
    return {
      email: raw.toLowerCase(),
      confirmed: true,
      createdAt: nowIso(),
      confirmedAt: nowIso(),
      unsubscribeToken: createToken(),
    };
  }

  if (!raw || typeof raw.email !== "string") {
    return null;
  }

  const email = raw.email.toLowerCase();
  if (!email) {
    return null;
  }

  return {
    email,
    confirmed: Boolean(raw.confirmed),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : nowIso(),
    confirmedAt: typeof raw.confirmedAt === "string" ? raw.confirmedAt : undefined,
    confirmToken: typeof raw.confirmToken === "string" ? raw.confirmToken : undefined,
    confirmExpiresAt: typeof raw.confirmExpiresAt === "string" ? raw.confirmExpiresAt : undefined,
    unsubscribeToken:
      typeof raw.unsubscribeToken === "string" && raw.unsubscribeToken
        ? raw.unsubscribeToken
        : createToken(),
  };
}

function dedupeByEmail(records: SubscriberRecord[]) {
  const map = new Map<string, SubscriberRecord>();
  for (const record of records) {
    map.set(record.email, record);
  }
  return Array.from(map.values());
}

export async function readSubscribers(): Promise<SubscriberRecord[]> {
  try {
    const raw = await fs.readFile(subscribersPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const normalized = parsed
      .map((entry) => normalizeSubscriber(entry as RawSubscriber))
      .filter((entry): entry is SubscriberRecord => Boolean(entry));
    return dedupeByEmail(normalized);
  } catch {
    return [];
  }
}

export async function writeSubscribers(records: SubscriberRecord[]) {
  await fs.mkdir(path.dirname(subscribersPath), { recursive: true });
  await fs.writeFile(subscribersPath, JSON.stringify(dedupeByEmail(records), null, 2), "utf8");
}

export function getSubscriberByEmail(records: SubscriberRecord[], email: string) {
  const safeEmail = email.toLowerCase();
  return records.find((record) => record.email === safeEmail);
}

export function getSubscriberByConfirmToken(records: SubscriberRecord[], token: string) {
  return records.find((record) => record.confirmToken === token);
}

export function getSubscriberByUnsubscribeToken(records: SubscriberRecord[], token: string) {
  return records.find((record) => record.unsubscribeToken === token);
}

export function createPendingSubscriber(email: string): SubscriberRecord {
  const createdAt = nowIso();
  const expires = new Date(Date.now() + CONFIRM_TOKEN_HOURS * 60 * 60 * 1000).toISOString();
  return {
    email: email.toLowerCase(),
    confirmed: false,
    createdAt,
    confirmToken: createToken(),
    confirmExpiresAt: expires,
    unsubscribeToken: createToken(),
  };
}

export function refreshConfirmToken(record: SubscriberRecord): SubscriberRecord {
  const expires = new Date(Date.now() + CONFIRM_TOKEN_HOURS * 60 * 60 * 1000).toISOString();
  return {
    ...record,
    confirmToken: createToken(),
    confirmExpiresAt: expires,
  };
}

export function confirmSubscriber(record: SubscriberRecord): SubscriberRecord {
  return {
    ...record,
    confirmed: true,
    confirmedAt: nowIso(),
    confirmToken: undefined,
    confirmExpiresAt: undefined,
  };
}

export function isConfirmTokenExpired(record: SubscriberRecord) {
  if (!record.confirmExpiresAt) {
    return true;
  }
  const expiry = Date.parse(record.confirmExpiresAt);
  if (Number.isNaN(expiry)) {
    return true;
  }
  return Date.now() > expiry;
}
