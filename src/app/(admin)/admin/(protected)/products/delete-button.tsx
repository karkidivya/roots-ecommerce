'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProduct } from './actions';
import { toast } from 'sonner';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();

  const handleClick = () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => {
      try {
        await deleteProduct(id);
        toast.success('Product deleted');
      } catch (err) {
        toast.error('Failed to delete product');
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
