import type { GitHubProfile } from '../../services/githubService';

interface ProfileSidebarProps {
  profile: GitHubProfile | null;
  jigglingPlatform?: string | null;
}

export const ProfileSidebar = ({ profile, jigglingPlatform }: ProfileSidebarProps) => {
  if (!profile) return null;

  return (
    <aside
      className={`sidebar${jigglingPlatform === 'platform-sidebar' ? ' platform-jiggle' : ''}`}
      data-platform-id="platform-sidebar"
      data-platform-action="info"
      data-platform-label={`View ${profile.name ?? profile.login}'s profile`}
      data-platform-info={profile.bio ?? 'No bio provided.'}
    >
      <div
        className={`profile-image-container${jigglingPlatform === 'platform-pfp' ? ' platform-jiggle' : ''}`}
        data-platform-id="platform-pfp"
        data-platform-action="info"
        data-platform-label={`${profile.name ?? profile.login}'s avatar`}
        data-platform-info={`${profile.name ?? profile.login} · ${profile.followers} followers`}
      >
        <img src={profile.avatar_url} alt={profile.login} className="profile-img" />
        <div className="status-icon">🎯</div>
      </div>

      <h1 className="vcard-names">
        <span className="p-name">{profile.name}</span>
        <span className="p-nickname">{profile.login}</span>
      </h1>

      <div className="bio">{profile.bio}</div>
      <button className="btn-edit-profile">Edit profile</button>

      <div className="profile-details">
        <div className="detail-item">
          <span>
            <b>{profile.followers}</b> followers
          </span>{' '}
          ·{' '}
          <span>
            <b>{profile.following}</b> following
          </span>
        </div>
        {profile.company && <div className="detail-item">{profile.company}</div>}
        {profile.location && <div className="detail-item">{profile.location}</div>}
        {profile.blog && (
          <div className="detail-item">
            <a href={profile.blog}>{profile.blog}</a>
          </div>
        )}
      </div>
    </aside>
  );
};
