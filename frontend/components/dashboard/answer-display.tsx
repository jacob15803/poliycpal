'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormStatus } from 'react-dom';
import type { QueryResult } from '@/lib/actions';
import { PolicyAreaIcon, Logo } from '@/components/icons';

const WelcomeMessage = () => (
    <div className="text-center flex flex-col items-center justify-center h-full">
        <Logo className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold font-headline text-foreground">Welcome to PolicyPal</h2>
        <p className="text-muted-foreground">
            Ask a question about IT, HR, or general company policies to get started.
        </p>
        <div className="mt-8 flex gap-4 text-sm">
            <div className="p-4 border rounded-lg bg-card max-w-xs">
                <p className="font-semibold">Example:</p>
                <p className="text-muted-foreground">"How much vacation time do I get?"</p>
            </div>
            <div className="p-4 border rounded-lg bg-card max-w-xs">
                <p className="font-semibold">Example:</p>
                <p className="text-muted-foreground">"How do I reset my password?"</p>
            </div>
        </div>
    </div>
);

const LoadingState = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

const ResultDisplay = ({ result }: { result: QueryResult }) => (
  <Card className="animate-in fade-in-50">
    <CardHeader>
      <CardTitle className="font-headline">{result.question}</CardTitle>
      <CardDescription className="flex items-center gap-2 pt-2">
        <PolicyAreaIcon area={result.policyArea} className="h-4 w-4" />
        <span>Detected Policy Area: {result.policyArea}</span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-foreground/90 whitespace-pre-wrap">{result.answer}</p>
      <Separator className="my-6" />
      <details>
        <summary className="text-sm font-medium cursor-pointer">
          View Information Sources
        </summary>
        <div className="mt-2 text-xs text-muted-foreground bg-secondary p-4 rounded-md">
          {Array.isArray(result.sources) ? (
            <ul className="list-disc list-inside space-y-1">
              {result.sources.map((source, idx) => (
                <li key={idx}>{source}</li>
              ))}
            </ul>
          ) : (
            <div className="whitespace-pre-wrap">{result.sources}</div>
          )}
        </div>
      </details>
    </CardContent>
  </Card>
);

export function AnswerDisplay({ result }: { result: QueryResult | null }) {
  const { pending } = useFormStatus();

  if (pending) {
    return <LoadingState />;
  }

  if (!result) {
    return <WelcomeMessage />;
  }
  
  return <ResultDisplay result={result} />;
}
