'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { WaitlistSource } from '@/lib/waitlist/schema';

type WaitlistState = {
  isOpen: boolean;
  source: WaitlistSource;
  /** Increments on every open, so the form starts fresh each time. */
  session: number;
  open: (source: WaitlistSource) => void;
  close: () => void;
};

const WaitlistContext = createContext<WaitlistState | null>(null);

/** One waitlist modal for the page; any order button can open it and records where it came from. */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<WaitlistSource>('header-cta');
  const [session, setSession] = useState(0);
  const open = useCallback((from: WaitlistSource) => {
    setSource(from);
    setSession((count) => count + 1);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, source, session, open, close }), [isOpen, source, session, open, close]);
  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>;
}

export function useWaitlist(): WaitlistState {
  const context = useContext(WaitlistContext);
  if (!context) throw new Error('useWaitlist must be used inside <WaitlistProvider>');
  return context;
}
