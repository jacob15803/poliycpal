'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { detectPolicyArea } from '@/ai/flows/intelligent-policy-area-detection';
import { generateConsolidatedAnswer } from '@/ai/flows/consolidated-answer-generation';
import { getPolicyDocument } from './policies';
import { addQueryToHistory } from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type AuthFormState = {
  error: string | null;
  success: boolean;
};

export async function signUpWithEmail(
  prevState: AuthFormState,
  data: FormData
): Promise<AuthFormState> {
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.', success: false };
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { error: null, success: true };
  } catch (e: any) {
    return { error: e.message, success: false };
  }
}

export async function loginWithEmail(
  prevState: AuthFormState,
  data: FormData
): Promise<AuthFormState> {
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.', success: false };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user) {
        return { error: 'Login failed. Please try again.', success: false };
    }
  } catch (e: any) {
    return { error: e.message, success: false };
  }

  return { error: null, success: true };
}

export interface QueryResult {
  question: string;
  answer: string;
  policyArea: 'IT' | 'HR' | 'General';
  sources: string;
}

export type QueryFormState = {
  result: QueryResult | null;
  error: string | null;
};

export async function handleQuery(
  prevState: QueryFormState,
  data: FormData
): Promise<QueryFormState> {
  const question = data.get('question') as string;
  const userId = auth.currentUser?.uid;

  if (!question) {
    return { result: null, error: 'Please enter a question.' };
  }
  if (!userId) {
    return { result: null, error: 'You must be logged in to ask a question.' };
  }

  try {
    // 1. Detect policy area
    const { policyArea } = await detectPolicyArea({ question });

    // 2. Retrieve relevant information
    const informationSources = getPolicyDocument(policyArea);

    // 3. Generate consolidated answer
    const { answer } = await generateConsolidatedAnswer({
      question,
      informationSources,
    });

    // 4. Store query in history
    await addQueryToHistory(userId, question, answer, policyArea, informationSources);
    
    revalidatePath('/dashboard');

    return {
      result: {
        question,
        answer,
        policyArea,
        sources: informationSources,
      },
      error: null,
    };
  } catch (e: any) {
    console.error(e);
    return {
      result: null,
      error: e.message || 'An unexpected error occurred.',
    };
  }
}