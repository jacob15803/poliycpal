import { Laptop, Users, FileText, LucideProps } from 'lucide-react';
import type { PolicyArea } from '@/lib/types';

export const Logo = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22V2" />
    <path d="M5 10.5c3.5-1 3.5-2 7-2s3.5 1 7 2" />
    <path d="M5 19.5c3.5-1 3.5-2 7-2s3.5 1 7 2" />
  </svg>
);

export const PolicyAreaIcon = ({
  area,
  ...props
}: { area: PolicyArea } & LucideProps) => {
  switch (area) {
    case 'IT':
      return <Laptop {...props} />;
    case 'HR':
      return <Users {...props} />;
    case 'General':
      return <FileText {...props} />;
    default:
      return <FileText {...props} />;
  }
};
