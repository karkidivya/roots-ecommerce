'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ChevronDown, Instagram, Facebook } from 'lucide-react';
import { TiktokIcon } from './tiktok-icon';
import { useCartStore } from '@/lib/cart/store';
import { useState, useEffect, useRef } from 'react';

const LOGO_URL =
  'https://res.cloudinary.com/dlk4mtgle/image/upload/w_120,h_120,c_fill/v1779509310/692749951_122102590203303257_7552527138558933451_n_njp3qz.jpg';

interface HeaderCategory {
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
}

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { toggleCart, getItemCount } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const shopActive = pathname === '/products' || pathname.startsWith('/category');
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openImmediate = (key: string) => {
    cancelClose();
    setOpenMenu(key);
  };

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

        {/* Logo + wordmark on left */}
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
            <Image
              src={LOGO_URL}
              alt={brand}
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="font-serif text-[22px] tracking-tight">{brand}</span>
        </Link>

        {/* Desktop nav with dropdowns */}
        <div
          ref={navRef}
          className="hidden lg:flex items-center gap-7 text-[13px] ml-4"
        >
          {/* Shop mega-menu */}
          <div
            className="relative"
            onMouseEnter={() => openImmediate('shop')}
            onMouseLeave={scheduleClose}
          >
            <Link
              href="/products"
              onClick={() => setOpenMenu(null)}
              className={`flex items-center gap-1 transition-colors underline-offset-4 hover:underline ${
                shopActive || openMenu === 'shop'
                  ? 'text-foreground font-medium'
                  : 'hover:text-muted-foreground'
              }`}
            >
              Shop <ChevronDown className="h-3 w-3" />
            </Link>
            {openMenu === 'shop' && (
              <ShopMegaMenu
                categories={categories}
                onSelect={() => setOpenMenu(null)}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              />
            )}
          </div>

          {/* About dropdown */}
          <div
            className="relative"
            onMouseEnter={() => openImmediate('about')}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => (openMenu === 'about' ? setOpenMenu(null) : openImmediate('about'))}
              className="flex items-center gap-1 hover:text-muted-foreground transition-colors"
            >
              About <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === 'about' && (
              <DropdownPanel onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
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
          <Link href="/track" className="hover:text-muted-foreground transition-colors">
            Track
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
            <Link href="/track" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              Track order
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2 text-sm">
              Contact
            </Link>

            <div className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2">
              <a
                href="https://www.instagram.com/grainrootsfood/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center h-9 w-9 rounded-full border"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/grainrootsfood"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid place-items-center h-9 w-9 rounded-full border"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@grainrootsfood"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid place-items-center h-9 w-9 rounded-full border"
              >
                <TiktokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function DropdownPanel({
  children,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      className="absolute left-0 top-full pt-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="min-w-[200px] rounded-sm border border-border bg-card py-2 shadow-soft">
        {children}
      </div>
    </div>
  );
}

function ShopMegaMenu({
  categories,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: {
  categories: HeaderCategory[];
  onSelect: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  // Size the panel to the number of categories (max 4 across) so it doesn't
  // leave empty columns when only a couple are active.
  const cols = Math.min(Math.max(categories.length, 1), 4);

  return (
    <div
      className="absolute left-0 top-full pt-2 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="rounded-sm border border-border bg-card shadow-lift overflow-hidden w-max max-w-[560px]">
        {/* Header row */}
        <div className="flex items-center justify-between gap-8 px-4 py-2.5 border-b border-border/70">
          <p className="eyebrow">Browse</p>
          <Link
            href="/products"
            onClick={onSelect}
            className="text-xs font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            All products →
          </Link>
        </div>

        {/* Category cards grid — sized to fit the active categories */}
        <div
          className="grid gap-3 p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 8rem)` }}
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              onClick={onSelect}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden bg-muted rounded-sm">
                {c.imageUrl && (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="130px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="pt-2">
                <h3 className="font-serif text-[13px] leading-tight">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
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

