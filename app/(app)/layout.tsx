import { headers } from 'next/headers';
import { Sidebar } from '@/components/shell/Sidebar';
import { getUserById } from '@/lib/supabase/users-repo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const userId = h.get('x-user-id') ?? '';
  const role = (h.get('x-user-role') ?? 'admin') as 'admin' | 'user';

  let userName = 'tagtig';
  let userEmail = '';

  if (userId && userId !== 'legacy-admin') {
    const user = await getUserById(userId).catch(() => null);
    if (user) {
      userName = user.name || user.email;
      userEmail = user.email;
    }
  } else if (userId === 'legacy-admin') {
    userName = 'Admin';
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <Sidebar user={userName} email={userEmail} role={role} />
      <main className="min-w-0 overflow-y-auto px-12 py-8">{children}</main>
    </div>
  );
}
