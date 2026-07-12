import { useStarredRepos } from '../../hooks/useStarredRepos';
import { EmptyState } from './EmptyState';

interface StarsProps {
  username: string;
}

const timeAgo = (dateString: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [30, 'day'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];

  let value = seconds;
  let unit = 'second';
  for (const [amount, name] of units) {
    if (value < amount) {
      unit = name;
      break;
    }
    value = Math.floor(value / amount);
    unit = name;
  }

  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
};

export const Stars = ({ username }: StarsProps) => {
  const { starred, loading, error } = useStarredRepos(username);

  if (loading) {
    return <div className="loading-graph">Loading starred repositories...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (starred.length === 0) {
    return (
      <EmptyState
        icon={
          <svg aria-hidden="true" height="32" viewBox="0 0 16 16" width="32" fill="#656d76">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
        }
        title={`${username} hasn't starred any repositories yet`}
        description="Repositories that catch this developer's eye will show up here."
      />
    );
  }

  return (
    <div className="repo-list-section">
      <div className="stars-header">
        <h2>{starred.length} repositories starred</h2>
      </div>
      {starred.map(({ repo, starred_at }) => (
        <div key={repo.id} className="star-list-item">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name" style={{ fontSize: '16px' }}>
                {repo.full_name || repo.name}
              </a>
              <span className="badge">{repo.visibility || (repo.private ? 'Private' : 'Public')}</span>
            </div>
            <p className="repo-desc" style={{ marginBottom: '8px' }}>
              {repo.description ? repo.description : <i>No description provided.</i>}
            </p>
            <div className="repo-meta" style={{ gap: '16px' }}>
              {repo.language && (
                <span className="lang">
                  <span className="lang-color" style={{ backgroundColor: '#8b949e' }}></span>
                  {repo.language}
                </span>
              )}
              <span>
                <svg aria-hidden="true" height="14" viewBox="0 0 16 16" width="14" fill="#656d76" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}>
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                </svg>
                {repo.stargazers_count}
              </span>
              <span>Starred {timeAgo(starred_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
