import { useEffect, useState } from 'react';
import {
  githubService,
  type ContributionData,
  type GitHubProfile,
  type GitHubRepo,
} from '../services/githubService';

interface UseGitHubDataResult {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  contributions: ContributionData | null;
  loading: boolean;
  error: string | null;
}

export const useGitHubData = (username: string | undefined): UseGitHubDataResult => {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [contributions, setContributions] = useState<ContributionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userData, repoData, contribData] = await Promise.all([
          githubService.fetchUserProfile(username),
          githubService.fetchUserRepos(username),
          githubService.fetchContributions(username),
        ]);

        if (cancelled) return;

        setProfile(userData);
        setRepos(repoData);
        setContributions(contribData);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { profile, repos, contributions, loading, error };
};
