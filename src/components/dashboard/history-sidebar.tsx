'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarGroupLabel,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';
import { getUserQueryHistory } from '@/lib/db';
import type { Query } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useDashboard } from '@/context/dashboard-context';

export function HistorySidebar() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { setCurrentQuestion } = useDashboard();

  useEffect(() => {
    if (user?.uid) {
      startTransition(async () => {
        setIsLoading(true);
        const userHistory = await getUserQueryHistory(user.uid);
        setHistory(userHistory);
        setIsLoading(false);
      });
    }
  }, [user?.uid]);

  const skeletonCount = 5;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Query History</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            {isLoading || isPending ? (
              Array.from({ length: skeletonCount }).map((_, index) => (
                <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon={false}/>
                </SidebarMenuItem>
              ))
            ) : history.length === 0 ? (
                <SidebarMenuItem>
                    <div className="p-2 text-sm text-muted-foreground">No queries yet.</div>
                </SidebarMenuItem>
            ) : (
              history.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    variant="ghost"
                    size="lg"
                    className="h-auto whitespace-normal"
                    onClick={() => setCurrentQuestion(item.question)}
                  >
                    <div className="flex flex-col items-start gap-1 w-full text-left">
                      <span className="truncate max-w-full">{item.question}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
