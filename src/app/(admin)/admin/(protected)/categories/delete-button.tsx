'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteCategory } from './actions';

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();

  const handleClick = () => {
    if (!confirm(`Delete category "${name}"?`)) return;
    start(async () => {
      try {
        await deleteCategory(id);
        toast.success('Category deleted');
      } catch {
        toast.error('Failed to delete');
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
