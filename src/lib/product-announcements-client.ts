import { SITE_ANNOUNCEMENTS, type SiteAnnouncement } from "@/lib/announcements";

const SEEN_KEY = "aidevref-site-announcements-seen-v1";

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

export function getUnseenSiteAnnouncements(): SiteAnnouncement[] {
  const seen = readSeenIds();
  return SITE_ANNOUNCEMENTS.filter((entry) => !seen.has(entry.id));
}

export function markSiteAnnouncementSeen(id: string) {
  const seen = readSeenIds();
  seen.add(id);
  writeSeenIds(seen);
}

export function markAllSiteAnnouncementsSeen(ids: string[]) {
  const seen = readSeenIds();
  for (const id of ids) {
    seen.add(id);
  }
  writeSeenIds(seen);
}

export function isSiteAnnouncementUnseen(id: string) {
  return !readSeenIds().has(id);
}
