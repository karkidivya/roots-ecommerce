'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProduct } from './actions';
import { toast } from 'sonner';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
        router.refresh();
      } catch (err) {
        console.error(err);
        const msg =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to delete product';
        toast.error(msg);
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      size="sm"
      variant="outline"
      className="text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
