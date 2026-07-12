export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  company: string | null;
  location: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name?: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  visibility?: string;
  private: boolean;
  updated_at: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level?: number;
}

export interface ContributionData {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

export interface StarredRepo {
  starred_at: string;
  repo: GitHubRepo;
}

const BASE_URL_USER = 'https://api.github.com/users';
const BASE_URL_CONTRIB = 'https://github-contributions-api.jogruber.de/v4';

const fetchJson = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await fetch(url, headers ? { headers } : undefined);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

export const githubService = {
  fetchUserProfile: (username: string) => fetchJson<GitHubProfile>(`${BASE_URL_USER}/${username}`),

  fetchUserRepos: (username: string) =>
    fetchJson<GitHubRepo[]>(`${BASE_URL_USER}/${username}/repos?sort=pushed&per_page=6`),

  fetchContributions: (username: string) =>
    fetchJson<ContributionData>(`${BASE_URL_CONTRIB}/${username}?y=last`),

  fetchStarredRepos: (username: string) =>
    fetchJson<StarredRepo[]>(`${BASE_URL_USER}/${username}/starred?per_page=30&sort=created`, {
      Accept: 'application/vnd.github.star+json',
    }),
};
