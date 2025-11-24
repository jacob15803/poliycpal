'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, Code, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getUserQueryHistory } from '@/lib/db';
import type { Query } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { PolicyAreaIcon } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuery() {
      if (!user?.uid || !params.id) return;

      try {
        const history = await getUserQueryHistory(user.uid);
        const foundQuery = history.find((q) => q.id === params.id);
        setQuery(foundQuery || null);
      } catch (error) {
        console.error('Failed to load query:', error);
      } finally {
        setLoading(false);
      }
    }

    loadQuery();
  }, [user?.uid, params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Query not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasDebateFlow = !!(query.itExpertResponse || query.hrExpertResponse);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{query.question}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <PolicyAreaIcon area={query.policyArea} className="h-4 w-4" />
                <span>{query.policyArea} Policy</span>
                <span>•</span>
                <span>{formatDistanceToNow(query.createdAt.toDate(), { addSuffix: true })}</span>
              </CardDescription>
            </div>
            <Badge variant="outline">{query.policyArea}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Final Answer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Final Synthesized Answer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground/90">{query.answer}</p>
        </CardContent>
      </Card>

      {/* Multi-Agent Debate Flow */}
      {hasDebateFlow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Multi-Agent Debate Flow
            </CardTitle>
            <CardDescription>
              Explore how the IT and HR policy experts analyzed your question and how their perspectives were synthesized.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* IT Expert Analysis */}
              {query.itExpertResponse && (
                <AccordionItem value="it-expert">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    <span>IT Policy Expert Analysis</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md whitespace-pre-wrap">
                        {query.itExpertResponse}
                      </p>
                      {query.itContext && query.itContext.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">IT Policy Context Used:</p>
                          <div className="space-y-2">
                            {query.itContext.map((context, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-muted p-2 rounded border-l-2 border-blue-500"
                              >
                                {context.substring(0, 200)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* HR Expert Analysis */}
              {query.hrExpertResponse && (
                <AccordionItem value="hr-expert">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>HR Policy Expert Analysis</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded-md whitespace-pre-wrap">
                        {query.hrExpertResponse}
                      </p>
                      {query.hrContext && query.hrContext.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">HR Policy Context Used:</p>
                          <div className="space-y-2">
                            {query.hrContext.map((context, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-muted p-2 rounded border-l-2 border-green-500"
                              >
                                {context.substring(0, 200)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Information Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(query.sources) && query.sources.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {query.sources.map((source, idx) => (
                <li key={idx} className="text-sm">{source}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {typeof query.sources === 'string' ? query.sources : 'No sources available'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

