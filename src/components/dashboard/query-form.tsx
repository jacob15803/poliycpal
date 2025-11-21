'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleQuery, type QueryFormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnswerDisplay } from './answer-display';
import { useEffect, useRef } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { useAuth } from '@/context/auth-context';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} aria-disabled={pending}>
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      <span className="sr-only">Send</span>
    </Button>
  );
}

export function QueryForm() {
  const { user } = useAuth();
  const initialState: QueryFormState = { result: null, error: null };
  const [state, dispatch] = useActionState(handleQuery, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { currentQuestion, setCurrentQuestion } = useDashboard();

  useEffect(() => {
    if (state.result) {
      setCurrentQuestion('');
    }
  }, [state.result, setCurrentQuestion]);

  return (
    <div className="space-y-4">
      <div className="flex-grow p-6 overflow-y-auto max-h-[calc(100vh-20rem)]">
        <AnswerDisplay result={state.result} />
      </div>
      <div className="px-6 pb-6 border-t pt-6 bg-background">
        <form
          ref={formRef}
          action={dispatch}
          className="relative w-full max-w-2xl mx-auto"
        >
          <input type="hidden" name="userId" value={user?.uid || ''} />
          <Textarea
            name="question"
            placeholder="e.g., What is our policy on remote work?"
            className="pr-14 min-h-[52px] resize-none"
            rows={1}
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
        {state.error && (
            <Alert variant="destructive" className="mt-4 max-w-2xl mx-auto">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
      </div>
    </div>
  );
}
