import Link from 'next/link';
import { LogoutButton } from './logout-button';

// Note: this layout wraps BOTH the login page and the protected admin pages.
// Auth gating is handled by middleware.ts (redirects non-authed users to /admin/login).
// The login page uses its own minimal layout via the (admin) group root layout below.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
