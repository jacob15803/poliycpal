'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
// Removed Genkit imports - now using FastAPI backend
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
  sources: string[];
  it_context?: string[];
  hr_context?: string[];
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
  const userId = data.get('userId') as string;

  if (!question) {
    return { result: null, error: 'Please enter a question.' };
  }
  if (!userId) {
    return { result: null, error: 'You must be logged in to ask a question.' };
  }

  try {
    // Call FastAPI backend for agentic debate system
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'API request failed' }));
      throw new Error(errorData.detail || 'Failed to get answer from API');
    }

    const data = await response.json();
    
    // Determine primary policy area based on which context has more content
    const itContextLength = data.it_context?.length || 0;
    const hrContextLength = data.hr_context?.length || 0;
    let policyArea: 'IT' | 'HR' | 'General' = 'General';
    if (itContextLength > hrContextLength && itContextLength > 0) {
      policyArea = 'IT';
    } else if (hrContextLength > itContextLength && hrContextLength > 0) {
      policyArea = 'HR';
    }

    // Store query in history with debate flow
    await addQueryToHistory(
      userId,
      question,
      data.answer,
      policyArea,
      data.sources || [],
      {
        itExpertResponse: data.it_expert_response,
        hrExpertResponse: data.hr_expert_response,
        itContext: data.it_context,
        hrContext: data.hr_context,
      }
    );
    
    revalidatePath('/dashboard');

    return {
      result: {
        question,
        answer: data.answer,
        policyArea,
        sources: data.sources || [],
        it_context: data.it_context,
        hr_context: data.hr_context,
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
