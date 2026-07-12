import { EmptyState } from './EmptyState';

interface ProjectsProps {
  username: string;
}

export const Projects = ({ username }: ProjectsProps) => (
  <EmptyState
    icon={
      <svg aria-hidden="true" height="32" viewBox="0 0 16 16" width="32" fill="#656d76">
        <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25ZM3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5ZM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8Zm.5 3a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Z" />
      </svg>
    }
    title={`${username} doesn't have any public projects`}
    description="Projects are GitHub's boards for planning and tracking work. This profile hasn't shared any publicly."
    action={
      <a
        href={`https://github.com/${username}?tab=projects`}
        target="_blank"
        rel="noopener noreferrer"
        className="blankslate-link"
      >
        View on GitHub
      </a>
    }
  />
);
