'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { useState, useEffect } from 'react';

export function Header({ categories }: { categories: { name: string; slug: string }[] }) {
  const { toggleCart, getItemCount } = useCartStore();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => setCount(getItemCount()), [getItemCount]);
  useEffect(() => {
    const unsub = useCartStore.subscribe((s) =>
      setCount(s.items.reduce((sum, i) => sum + i.quantity, 0))
    );
    return unsub;
  }, []);

  const brand = process.env.NEXT_PUBLIC_APP_NAME || 'Nepal Shop';

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto flex h-[68px] items-center gap-6 px-6">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden -ml-1 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Left wordmark */}
        <Link href="/" className="font-serif text-[22px] tracking-tight whitespace-nowrap">
          {brand}
        </Link>

        {/* Desktop nav, beside wordmark */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] ml-4">
          <Link href="/products" className="hover:text-muted-foreground transition-colors">
            Shop
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="hover:text-muted-foreground transition-colors"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/contact" className="hover:text-muted-foreground transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3 text-[13px]">
          {/* Desktop search input */}
          <form
            onSubmit={submitSearch}
            className="hidden md:flex relative items-center"
          >
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-9 w-44 lg:w-56 rounded-sm border border-input bg-background pl-9 pr-3 text-sm focus:w-64 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-[width]"
            />
          </form>

          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden p-2 hover:text-muted-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 hover:text-muted-foreground transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart{count > 0 ? ` (${count})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Mobile search drawer */}
      {searchOpen && (
        <div className="md:hidden border-t bg-background">
          <form onSubmit={submitSearch} className="container mx-auto px-6 py-3 flex gap-2">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 h-10 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="rounded-sm bg-foreground px-4 text-sm font-medium text-background"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t lg:hidden bg-background">
          <div className="container mx-auto flex flex-col px-6 py-4">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm border-b border-border/60"
            >
              Shop
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm border-b border-border/60"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm"
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
