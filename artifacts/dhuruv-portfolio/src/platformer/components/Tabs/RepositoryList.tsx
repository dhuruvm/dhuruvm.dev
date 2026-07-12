import type { GitHubRepo } from '../../services/githubService';

const RepoListItem = ({ repo }: { repo: GitHubRepo }) => {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      style={{
        padding: '24px 0',
        borderBottom: '1px solid #d0d7de',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '20px', fontWeight: 600, color: '#0969da', textDecoration: 'none' }}
          >
            {repo.name}
          </a>
          <span
            style={{
              border: '1px solid #d0d7de',
              borderRadius: '24px',
              padding: '0 7px',
              fontSize: '12px',
              color: '#57606a',
              fontWeight: 500,
            }}
          >
            {repo.visibility || (repo.private ? 'Private' : 'Public')}
          </span>
        </div>
        <p style={{ color: '#57606a', fontSize: '14px', margin: '0 0 8px 0', maxWidth: '80%' }}>
          {repo.description}
        </p>
        <div
          style={{
            fontSize: '12px',
            color: '#57606a',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {repo.language && <span>{repo.language}</span>}
          <span>Updated on {updatedDate}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <button
          style={{
            backgroundColor: '#f6f8fa',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            padding: '3px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#24292f',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#57606a">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          Star
        </button>
      </div>
    </div>
  );
};

interface RepositoryListProps {
  repos: GitHubRepo[];
}

export const RepositoryList = ({ repos }: RepositoryListProps) => {
  if (!repos || repos.length === 0) return <div>No repositories found.</div>;

  return (
    <div className="repo-list-section">
      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingBottom: '16px',
          borderBottom: '1px solid #d0d7de',
          marginBottom: '8px',
        }}
      >
        <input
          type="text"
          placeholder="Find a repository..."
          style={{ flex: 1, padding: '5px 12px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '14px' }}
        />
        <button
          style={{
            backgroundColor: '#f6f8fa',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            padding: '5px 16px',
            fontWeight: 600,
            fontSize: '14px',
            color: '#24292f',
          }}
        >
          Type
        </button>
        <button
          style={{
            backgroundColor: '#f6f8fa',
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            padding: '5px 16px',
            fontWeight: 600,
            fontSize: '14px',
            color: '#24292f',
          }}
        >
          Language
        </button>
        <button
          style={{
            backgroundColor: '#30a14e',
            border: '1px solid rgba(27,31,36,0.15)',
            borderRadius: '6px',
            padding: '5px 16px',
            fontWeight: 600,
            fontSize: '14px',
            color: '#ffffff',
          }}
        >
          New
        </button>
      </div>

      {repos.map((repo) => (
        <RepoListItem key={repo.id} repo={repo} />
      ))}
    </div>
  );
};
