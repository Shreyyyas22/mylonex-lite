'use client';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">MyloNex Lite</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/catalog" className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">Catalog</Link>
          {role === 'BUYER' && <Link href="/buyer/inquiries" className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">My Inquiries</Link>}
          {role === 'SUPPLIER' && <Link href="/supplier/inquiries" className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">Inquiries</Link>}
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">{(session.user as any).role} · {session.user?.name}</span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>Logout</Button>
            </div>
          ) : (
            <Link href="/login"><Button size="sm">Login</Button></Link>
          )}
        </div>
      </div>
    </nav>
  );
}
