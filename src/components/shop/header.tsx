'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { useState, useEffect, useRef } from 'react';

export function Header({ categories }: { categories: { name: string; slug: string }[] }) {
  const { toggleCart, getItemCount } = useCartStore();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => setCount(getItemCount()), [getItemCount]);
  useEffect(() => {
    const unsub = useCartStore.subscribe((s) =>
      setCount(s.items.reduce((sum, i) => sum + i.quantity, 0))
    );
    return unsub;
  }, []);

  // Click outside to close menus
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

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

        {/* Wordmark on left */}
        <Link href="/" className="font-serif text-[22px] tracking-tight whitespace-nowrap">
          {brand}
        </Link>

        {/* Desktop nav with dropdowns */}
        <div
          ref={navRef}
          className="hidden lg:flex items-center gap-7 text-[13px] ml-4"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {/* Shop dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu('shop')}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'shop' ? null : 'shop')}
              className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
            >
              Shop <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'shop' && (
              <DropdownPanel>
                <DropdownItem href="/products" onClick={() => setOpenMenu(null)}>
                  All products
                </DropdownItem>
                <DropdownDivider />
                {categories.map((c) => (
                  <DropdownItem
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpenMenu(null)}
                  >
                    {c.name}
                  </DropdownItem>
                ))}
              </DropdownPanel>
            )}
          </div>

          {/* About dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu('about')}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}
              className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
            >
              About <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'about' && (
              <DropdownPanel>
                <DropdownItem href="/about" onClick={() => setOpenMenu(null)}>
                  Our story
                </DropdownItem>
                <DropdownItem href="/about#sustainability" onClick={() => setOpenMenu(null)}>
                  Sustainability
                </DropdownItem>
                <DropdownItem href="/about#farmers" onClick={() => setOpenMenu(null)}>
                  Our farmers
                </DropdownItem>
              </DropdownPanel>
            )}
          </div>

          <Link href="/wholesale" className="hover:text-muted-foreground transition-colors">
            Wholesale
          </Link>
          <Link href="/contact" className="hover:text-muted-foreground transition-colors">
            Contact
          </Link>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3 text-[13px]">
          <form onSubmit={submitSearch} className="hidden md:flex relative items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-9 w-44 lg:w-56 rounded-sm border border-input bg-background pl-9 pr-3 text-sm focus:w-64 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-[width]"
            />
          </form>

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

      {/* Mobile search */}
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
            <button type="submit" className="rounded-sm bg-foreground px-4 text-sm font-medium text-background">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav (full list) */}
      {mobileOpen && (
        <nav className="border-t lg:hidden bg-background">
          <div className="container mx-auto flex flex-col px-6 py-4">
            <p className="eyebrow mt-2 mb-3">Shop</p>
            <Link href="/products" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              All products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
              >
                {c.name}
              </Link>
            ))}
            <p className="eyebrow mt-6 mb-3">About</p>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              Our story
            </Link>
            <Link href="/wholesale" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              Wholesale partners
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 top-full pt-3">
      <div className="min-w-[200px] rounded-sm border border-border bg-card py-2 shadow-soft">
        {children}
      </div>
    </div>
  );
}

function DropdownItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-[13px] text-foreground hover:bg-muted transition-colors"
    >
      {children}
    </Link>
  );
}

function DropdownDivider() {
  return <div className="my-1 border-t border-border/70" />;
}
