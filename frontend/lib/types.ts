import type { Timestamp } from 'firebase/firestore';

export type PolicyArea = 'IT' | 'HR' | 'General';

export interface Query {
  id: string;
  userId: string;
  question: string;
  answer: string;
  policyArea: PolicyArea;
  sources: string | string[];
  createdAt: Timestamp;
  // Debate flow data (optional for backward compatibility)
  itExpertResponse?: string;
  hrExpertResponse?: string;
  itContext?: string[];
  hrContext?: string[];
}
