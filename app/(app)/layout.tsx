import { Sidebar } from '@/components/shell/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <Sidebar user="tagtig" />
      <main className="min-w-0 overflow-y-auto px-12 py-8">{children}</main>
    </div>
  );
}
