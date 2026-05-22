'use client';

import { useEffect, useRef } from 'react';
import type { EsewaFormData } from '@/lib/payments/esewa';

export function EsewaAutoSubmit({ formData }: { formData: EsewaFormData }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const t = setTimeout(() => formRef.current?.submit(), 500);
    return () => clearTimeout(t);
  }, []);

  const { gatewayUrl, ...fields } = formData;

  return (
    <form ref={formRef} action={gatewayUrl} method="POST">
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Click here if not redirected automatically
      </button>
    </form>
  );
}
