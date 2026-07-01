import { NextResponse } from "next/server";
import { getBroadcastStateStored } from "@/lib/subscribers";

export const runtime = "nodejs";

type GithubRelease = {
  id?: number;
  tag_name?: string;
  name?: string;
  body?: string;
  html_url?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
};

type ReleaseEntry = {
  id: string;
  source: "github" | "feed";
  type: "new" | "change" | "fix";
  title: string;
  text: string;
  url?: string;
  publishedAt?: string;
};

const GITHUB_RELEASES_URL = "https://api.github.com/repos/nuthan-murarysetty/ai-dev-ref/releases";

function toTextLines(body?: string) {
  if (!body) return [] as string[];
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

async function readGithubReleases(): Promise<ReleaseEntry[]> {
  try {
    const res = await fetch(GITHUB_RELEASES_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ai-dev-reference",
      },
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as GithubRelease[];

    return json
      .filter((r) => !r.draft)
      .slice(0, 6)
      .map((r, index) => {
        const title = r.name?.trim() || r.tag_name?.trim() || `Release ${index + 1}`;
        const lines = toTextLines(r.body);
        const text = lines.length
          ? lines.join(" • ")
          : "Published release notes from GitHub.";

        return {
          id: `gh-${r.id || r.tag_name || index}`,
          source: "github" as const,
          type: r.prerelease ? "change" : "new",
          title,
          text,
          url: r.html_url,
          publishedAt: r.published_at,
        };
      });
  } catch {
    return [];
  }
}

export async function GET() {
  const [githubEntries, broadcastState] = await Promise.all([
    readGithubReleases(),
    getBroadcastStateStored().catch(() => undefined),
  ]);

  const feed = {
    totalNewEntries: 0,
    byTool: {
      claude: 0,
      cursor: 0,
      copilot: 0,
    },
    hasNewEntries: false,
    signature: "static-catalog-mode",
    lastSentAt: broadcastState?.lastSentAt || null,
  };

  const entries: ReleaseEntry[] = [
    {
      id: "catalog-static-mode",
      source: "feed",
      type: "change",
      title: "Catalog mode",
      text: "Catalog data for commands, skills, agents, and hooks is now served from a static local source.",
    },
    ...githubEntries,
  ];
  const latestVersion = githubEntries[0]?.title || "static-catalog";

  return NextResponse.json(
    {
      ok: true,
      version: latestVersion,
      feed,
      entries,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
