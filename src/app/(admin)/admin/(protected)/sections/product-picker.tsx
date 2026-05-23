'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, GripVertical } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PickerProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string | null;
}

interface Props {
  name: string;
  initial?: string[];
  products: PickerProduct[];
  /** Hint shown when no products are selected — describes the fallback behavior. */
  fallbackHint?: string;
}

export function SectionProductPicker({ name, initial = [], products, fallbackHint }: Props) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [search, setSearch] = useState('');

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= selected.length) return;
    const next = [...selected];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSelected(next);
  };

  return (
    <div className="space-y-5">
      {/* Hidden input — server action reads comma-separated UUIDs */}
      <input type="hidden" name={name} value={selected.join(',')} />

      {/* Selected list — ordered, with reorder & remove */}
      <div>
        <p className="text-sm font-medium mb-2">
          Selected products ({selected.length})
        </p>
        {selected.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
            No products selected.{' '}
            {fallbackHint ?? 'The section will use its default automatic behavior.'}
          </div>
        ) : (
          <ol className="space-y-2">
            {selected.map((id, i) => {
              const p = productMap.get(id);
              if (!p) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
                >
                  <span className="text-xs font-mono text-muted-foreground w-5">
                    {i + 1}
                  </span>
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-muted shrink-0">
                    {p.images?.[0] && (
                      <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(p.price)}
                      {!p.isActive && ' · inactive'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="rounded px-2 py-1 text-xs text-destructive hover:bg-muted"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Picker */}
      <div>
        <p className="text-sm font-medium mb-2">Available products</p>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category…"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="max-h-[360px] overflow-y-auto rounded-md border bg-card divide-y">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No products match.
            </p>
          ) : (
            filtered.map((p) => {
              const isSelected = selected.includes(p.id);
              return (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4"
                  />
                  <div className="relative h-9 w-9 overflow-hidden rounded bg-muted shrink-0">
                    {p.images?.[0] && (
                      <Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.categoryName || '—'} · {formatPrice(p.price)}
                      {p.isFeatured && ' · ★'}
                      {!p.isActive && ' · inactive'}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
