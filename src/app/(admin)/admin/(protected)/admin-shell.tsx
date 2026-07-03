'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { LogoutButton } from '../../logout-button';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/sections', label: 'Homepage Content' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/shipping', label: 'Delivery Charges' },
  { href: '/admin/payment-methods', label: 'Payment Methods' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes (mobile navigation)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="font-serif text-lg">Admin</p>
        <Link
          href="/"
          className="text-xs text-muted-foreground"
        >
          Store →
        </Link>
      </header>

      {/* Backdrop (mobile only, while drawer open) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — off-canvas on mobile, pinned on lg+ */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0
          border-r bg-muted/40 lg:bg-muted/30 p-4
          transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 -mr-1 rounded-md hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-md px-3 py-2 transition-colors ${
                isActive(n.href)
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t">
          <LogoutButton />
        </div>
        <div className="mt-4">
          <Link href="/" className="text-xs text-muted-foreground hover:underline">
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
