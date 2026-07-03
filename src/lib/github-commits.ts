type GithubCommit = {
  sha?: string;
  commit?: {
    message?: string;
  };
};

const GITHUB_COMMITS_URL =
  "https://api.github.com/repos/nuthan-murarysetty/ai-dev-ref/commits";

function firstLine(message: string) {
  return message.split(/\r?\n/)[0]?.trim() || message.trim();
}

export async function readRecentCommitLines(since?: string, limit = 8): Promise<string[]> {
  try {
    const url = new URL(GITHUB_COMMITS_URL);
    url.searchParams.set("per_page", String(Math.min(limit, 20)));
    if (since) {
      url.searchParams.set("since", since);
    }

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ai-dev-reference",
      },
    });

    if (!res.ok) {
      return [];
    }

    const json = (await res.json()) as GithubCommit[];

    return json
      .map((entry) => {
        const message = entry.commit?.message ? firstLine(entry.commit.message) : "";
        const sha = entry.sha?.slice(0, 7);
        if (!message) {
          return "";
        }
        return sha ? `Commit ${sha}: ${message}` : message;
      })
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}
