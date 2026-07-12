import { EmptyState } from './EmptyState';

interface PackagesProps {
  username: string;
}

export const Packages = ({ username }: PackagesProps) => (
  <EmptyState
    icon={
      <svg aria-hidden="true" height="32" viewBox="0 0 16 16" width="32" fill="#656d76">
        <path d="M8.878.392a1.75 1.75 0 0 0-1.756 0l-5.25 3.045A1.75 1.75 0 0 0 1 4.951v6.098c0 .624.332 1.2.872 1.514l5.25 3.045a1.75 1.75 0 0 0 1.756 0l5.25-3.045c.54-.313.872-.89.872-1.514V4.951c0-.624-.332-1.2-.872-1.514ZM7.875 1.69a.25.25 0 0 1 .25 0l4.63 2.685L8 6.884 3.245 4.375ZM2.5 5.677l4.75 2.75v5.696l-4.5-2.607a.25.25 0 0 1-.25-.216ZM8.75 14.123V8.427l4.75-2.75v5.673a.25.25 0 0 1-.125.216Z" />
      </svg>
    }
    title={`${username} hasn't published any packages`}
    description="Packages let developers share reusable code. This profile hasn't published any publicly."
    action={
      <a
        href={`https://github.com/${username}?tab=packages`}
        target="_blank"
        rel="noopener noreferrer"
        className="blankslate-link"
      >
        View on GitHub
      </a>
    }
  />
);
