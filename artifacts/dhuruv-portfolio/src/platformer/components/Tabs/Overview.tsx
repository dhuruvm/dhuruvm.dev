import { PinnedRepos } from '../Repositories/PinnedRepos';
import { ContributionHeatmap } from '../Stats/ContributionHeatmap';
import type { ContributionData, GitHubRepo } from '../../services/githubService';

interface OverviewProps {
  repos: GitHubRepo[];
  contributions: ContributionData | null;
}

export const Overview = ({ repos, contributions }: OverviewProps) => {
  return (
    <>
      <PinnedRepos repos={repos} />
      <ContributionHeatmap data={contributions} />
    </>
  );
};
