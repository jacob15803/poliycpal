import type { Timestamp } from 'firebase/firestore';

export type PolicyArea = 'IT' | 'HR' | 'General';

export interface Query {
  id: string;
  userId: string;
  question: string;
  answer: string;
  policyArea: PolicyArea;
  sources: string;
  createdAt: Timestamp;
}
