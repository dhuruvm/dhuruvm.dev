import type { ReactElement } from 'react';
import type { GitHubProfile } from '../../services/githubService';

interface Tab {
  name: string;
  key: string | undefined;
  icon: ReactElement;
  path: string;
  count?: number;
}

interface NavbarProps {
  username: string;
  activeTab: string | undefined;
  profile: GitHubProfile | null;
  repoCount: number;
  onTabChange: (tabKey: string | undefined) => void;
}

export const Navbar = ({ username, activeTab, profile, repoCount, onTabChange }: NavbarProps) => {
  const tabs: Tab[] = [
    {
      name: 'Overview',
      key: undefined,
      icon: (
        <path d="M1.5 1.75c0-.69.56-1.25 1.25-1.25h10.5c.69 0 1.25.56 1.25 1.25v12.5c0 .69-.56 1.25-1.25 1.25H2.75c-.69 0-1.25-.56-1.25-1.25V1.75Zm1.25-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H2.75Z" />
      ),
      path: `/${username}`,
    },
    {
      name: 'Repositories',
      key: 'repos',
      icon: (
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8ZM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25Z" />
      ),
      path: `/${username}/repos`,
      count: repoCount,
    },
    {
      name: 'Projects',
      key: 'projects',
      icon: (
        <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5ZM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8Zm.5 3a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Z" />
      ),
      path: `/${username}/projects`,
    },
    {
      name: 'Packages',
      key: 'packages',
      icon: (
        <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5ZM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8Zm.5 3a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Z" />
      ),
      path: `/${username}/packages`,
    },
    {
      name: 'Stars',
      key: 'stars',
      icon: (
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
      ),
      path: `/${username}/stars`,
    },
  ];

  return (
    <header className="gh-header-container">
      <div className="gh-navbar-top">
        <div className="gh-nav-left">
          <button className="gh-menu-btn" aria-label="Global navigation menu">
            <svg height="24" viewBox="0 0 24 24" width="24" fill="#1F2328">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>
          <a href="/" className="gh-logo" aria-label="Homepage">
            <svg height="32" viewBox="0 0 16 16" width="32" fill="#1F2328">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <span className="gh-username">{username}</span>
        </div>

        <div className="gh-nav-right">
          <div className="gh-search-bar">
            <div className="gh-search-wrapper">
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                fill="#57606a"
                className="gh-search-icon"
              >
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.98 6 6 0 0 1 8.98 7.92l3.19 3.19a.75.75 0 0 1-1.06 1.06l-3.189-3.19zm-4.328-.84a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
              </svg>
              <input type="text" placeholder="Type / to search" className="gh-search-input" />
              <span className="gh-search-key">/</span>
            </div>
          </div>

          <div className="gh-divider"></div>

          <nav className="gh-icon-nav">
            <div className="gh-nav-item">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#1F2328">
                <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
              </svg>
              <span className="dropdown-caret">▼</span>
            </div>
            <div className="gh-nav-item">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#1F2328">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
              </svg>
            </div>
            <div className="gh-nav-item">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#1F2328">
                <path d="M7.177 3.073L9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-2.25.75a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Zm4.053 5.424c.003.088.006.175.009.263a.75.75 0 1 1-1.499.047c-.004-.13-.008-.263-.011-.401-.004-.15-.008-.31-.013-.48-.02-.66-.056-1.547-.197-2.435-.138-.868-.445-1.742-1.12-2.345C2.062 2.76 1 2.876 1 4.5c0 1.624 1.062 1.74 1.722 1.83.675.093.982.967 1.12 1.835.14.888.177 1.775.197 2.435.005.17.009.33.013.48.003.138.007.271.01.402.003.125.007.247.01.365.04.996.388 1.986 1.168 2.658 1.353 1.164 3.76.604 3.76-1.5a2.25 2.25 0 0 0-4.25-1Zm5.053 2.076a.75.75 0 1 1-1.492.148 3.75 3.75 0 0 1 7.382 0 .75.75 0 0 1-1.492-.148 2.25 2.25 0 0 0-4.398 0Z" />
              </svg>
            </div>
            <div className="gh-nav-item gh-notification-container">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="#1F2328">
                <path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 0 0 8 16ZM3 5a5 5 0 0 1 10 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.519 1.519 0 0 1 13.482 13H2.518a1.516 1.516 0 0 1-1.263-2.36l1.703-2.554A.255.255 0 0 0 3 7.947V5Z" />
              </svg>
              <span className="gh-notification-dot"></span>
            </div>
          </nav>

          <div className="gh-nav-item">
            <img
              src={profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=identicon'}
              alt="Profile"
              className="gh-avatar-small"
            />
            <span className="dropdown-caret">▼</span>
          </div>
        </div>
      </div>

      <nav className="gh-navbar-bottom">
        <div className="gh-tab-container">
          {tabs.map((tab) => (
            <a
              key={tab.name}
              href={tab.path}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.key);
              }}
              className={`gh-tab-item ${activeTab === tab.key ? 'active' : ''}`}
              data-platform-id={`tab-${tab.name.toLowerCase()}`}
              data-platform-action="switch-tab"
              data-platform-label={`Open ${tab.name}`}
              data-platform-tabkey={tab.key ?? ''}
            >
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                fill="#656d76"
                style={{ marginRight: '8px' }}
              >
                {tab.icon}
              </svg>
              {tab.name}
              {!!tab.count && <span className="gh-tab-badge">{tab.count}</span>}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};
