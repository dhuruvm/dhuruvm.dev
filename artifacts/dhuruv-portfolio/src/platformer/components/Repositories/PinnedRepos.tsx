import type { GitHubRepo } from '../../services/githubService';

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Vue: '#41b883',
  'Jupyter Notebook': '#DA5B0B',
};

const getLangColor = (lang: string | null) => (lang && LANG_COLORS[lang]) || '#8b949e';

const RepoCard = ({ repo }: { repo: GitHubRepo }) => (
  <div
    className="repo-card"
    data-platform-id={`repo-${repo.id}`}
    data-platform-action="open-link"
    data-platform-label={`Open ${repo.name} on GitHub`}
    data-platform-url={repo.html_url}
  >
    <div className="repo-header">
      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
        {repo.name}
      </a>
      <span className="badge">{repo.visibility || (repo.private ? 'Private' : 'Public')}</span>
    </div>

    <p className="repo-desc">
      {repo.description ? repo.description : <i>No description provided.</i>}
    </p>

    <div className="repo-meta">
      {repo.language && (
        <span className="lang">
          <span
            className="lang-color"
            style={{ backgroundColor: getLangColor(repo.language) }}
          ></span>
          {repo.language}
        </span>
      )}

      {repo.stargazers_count > 0 && (
        <span style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#656d76">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          {repo.stargazers_count}
        </span>
      )}
    </div>
  </div>
);

interface PinnedReposProps {
  repos: GitHubRepo[];
}

export const PinnedRepos = ({ repos }: PinnedReposProps) => {
  if (!repos || repos.length === 0) {
    return <div className="pinned-section">No repositories found.</div>;
  }

  return (
    <div className="pinned-section">
      <div className="section-title">
        <h2>Popular repositories</h2>
        <span className="link">Customize your pins</span>
      </div>
      <div className="pinned-grid">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
};
