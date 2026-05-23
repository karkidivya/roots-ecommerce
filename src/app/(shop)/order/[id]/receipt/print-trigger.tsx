'use client';

import { useEffect } from 'react';
import { Printer } from 'lucide-react';

export function PrintTrigger({ asButton }: { asButton?: boolean } = {}) {
  // Auto-print when query param ?autoprint=1 is present
  useEffect(() => {
    if (!asButton && typeof window !== 'undefined') {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [asButton]);

  if (!asButton) return null;

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-sm bg-foreground text-background px-4 h-9 text-sm font-medium hover:bg-foreground/85"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
