import { redirect } from 'next/navigation';
import { isAdminAuthenticated, signAdminToken, setAdminCookie } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function loginAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') || '');
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=invalid');
  }
  const token = await signAdminToken();
  await setAdminCookie(token);
  redirect('/admin');
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your admin password to continue
        </p>
        <form action={loginAction} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error === 'invalid' && (
            <p className="text-sm text-destructive">Invalid password. Please try again.</p>
          )}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
