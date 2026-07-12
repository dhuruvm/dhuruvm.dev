import { useEffect, useState } from 'react';
import { githubService, type StarredRepo } from '../services/githubService';

interface UseStarredReposResult {
  starred: StarredRepo[];
  loading: boolean;
  error: string | null;
}

export const useStarredRepos = (username: string | undefined): UseStarredReposResult => {
  const [starred, setStarred] = useState<StarredRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await githubService.fetchStarredRepos(username);
        if (!cancelled) setStarred(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { starred, loading, error };
};
