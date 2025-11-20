import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
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
  sources: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'queries'), {
      userId,
      question,
      answer,
      policyArea,
      sources,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw new Error('Failed to save query to history.');
  }
}

// Get all queries for a specific user, ordered by most recent
export async function getUserQueryHistory(userId: string): Promise<Query[]> {
  try {
    const q = query(
      collection(db, 'queries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history: Query[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as Query);
    });
    return history;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw new Error('Failed to retrieve query history.');
  }
}
