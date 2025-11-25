import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import type { Query, PolicyArea } from './types';

// Add a new query to the user's history
export async function addQueryToHistory(
  userId: string,
  question: string,
  answer: string,
  policyArea: PolicyArea,
  sources: string | string[],
  debateFlow?: {
    itExpertResponse?: string;
    hrExpertResponse?: string;
    itContext?: string[];
    hrContext?: string[];
  }
): Promise<string> {
  try {
    const docData: any = {
      userId,
      question,
      answer,
      policyArea,
      sources: Array.isArray(sources) ? sources : (sources ? [sources] : []),
      createdAt: Timestamp.now(),
    };
    
    // Add debate flow data if provided
    if (debateFlow) {
      if (debateFlow.itExpertResponse) docData.itExpertResponse = debateFlow.itExpertResponse;
      if (debateFlow.hrExpertResponse) docData.hrExpertResponse = debateFlow.hrExpertResponse;
      if (debateFlow.itContext) docData.itContext = debateFlow.itContext;
      if (debateFlow.hrContext) docData.hrContext = debateFlow.hrContext;
    }
    
    const docRef = await addDoc(collection(db, 'queries'), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw new Error('Failed to save query to history.');
  }
}

// Get all queries for a specific user, ordered by most recent
export async function getUserQueryHistory(userId: string): Promise<Query[]> {
  try {
    // Query without orderBy to avoid requiring a composite index
    // We'll sort in memory instead
    const q = query(
      collection(db, 'queries'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const history: Query[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as Query);
    });
    
    // Sort by createdAt in descending order (most recent first)
    history.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime; // Descending order
    });
    
    return history;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw new Error('Failed to retrieve query history.');
  }
}
