'use client';

import { LogOut } from 'lucide-react';
import { logout } from './logout-action';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </form>
  );
}
