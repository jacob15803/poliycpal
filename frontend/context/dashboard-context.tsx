'use client';

import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

interface DashboardContextType {
  currentQuestion: string;
  setCurrentQuestion: Dispatch<SetStateAction<string>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentQuestion, setCurrentQuestion] = useState('');

  return (
    <DashboardContext.Provider value={{ currentQuestion, setCurrentQuestion }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
