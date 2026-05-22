import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogoutButton } from '../../logout-button';
import { isAdminAuthenticated } from '@/lib/auth';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-muted/30 p-4 shrink-0">
        <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-md px-3 py-2 hover:bg-accent">
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block rounded-md px-3 py-2 hover:bg-accent"
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className="block rounded-md px-3 py-2 hover:bg-accent"
          >
            Categories
          </Link>
          <Link
            href="/admin/sections"
            className="block rounded-md px-3 py-2 hover:bg-accent"
          >
            Homepage Content
          </Link>
          <Link
            href="/admin/orders"
            className="block rounded-md px-3 py-2 hover:bg-accent"
          >
            Orders
          </Link>
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
      <main className="flex-1 p-6 overflow-x-auto">{children}</main>
    </div>
  );
}
