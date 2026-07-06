import announcementsData from "@/data/announcements.json";

export type SiteAnnouncement = {
  id: string;
  kind: "site";
  title: string;
  summary: string;
  since: string;
  ctaLabel: string;
  ctaTarget: "shortcuts-modal" | string;
  bullets?: string[];
};

export const SITE_ANNOUNCEMENTS = announcementsData as SiteAnnouncement[];

export function getSiteAnnouncementById(id: string) {
  return SITE_ANNOUNCEMENTS.find((entry) => entry.id === id);
}
