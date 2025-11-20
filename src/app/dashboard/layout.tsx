'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, FullScreenLoader } from '@/context/auth-context';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { HistorySidebar } from '@/components/dashboard/history-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { DashboardProvider } from '@/context/dashboard-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return <FullScreenLoader />;
  }

  return (
    <SidebarProvider>
      <DashboardProvider>
        <HistorySidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </SidebarInset>
      </DashboardProvider>
    </SidebarProvider>
  );
}
