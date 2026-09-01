'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('buyer@mylonex.demo');
  const [password, setPassword] = useState('buyer123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid credentials — check demo accounts');
    else router.push('/catalog');
  }

  function fillBuyer() { setEmail('buyer@mylonex.demo'); setPassword('buyer123'); }
  function fillSupplier() { setEmail('supplier@mylonex.demo'); setPassword('supplier123'); }
  const isBuyer = email === 'buyer@mylonex.demo';
  const isSupplier = email === 'supplier@mylonex.demo';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg shadow-md">M</div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Sign in to continue to MyloNex Lite</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={fillBuyer}
                className={`h-10 rounded-xl border text-sm font-medium transition-colors ${isBuyer ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
              >
                Continue as Buyer
              </button>
              <button
                onClick={fillSupplier}
                className={`h-10 rounded-xl border text-sm font-medium transition-colors ${isSupplier ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
              >
                Continue as Supplier
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  </span>
                  <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="pl-9 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                  </span>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                </div>
              </div>

              {error && <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm px-3 py-2">{error}</div>}

              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-sm font-semibold">
                {loading ? 'Signing in…' : 'Login'}
              </Button>
            </form>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-4">
            <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Demo credentials</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                <div className="text-xs">
                  <p className="font-semibold">Buyer — Arjun Mehta</p>
                  <p className="text-slate-500 font-mono text-[11px]">buyer@mylonex.demo / buyer123</p>
                </div>
                <span className="text-[10px] font-bold tracking-wide bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 px-2 py-1 rounded-full">BUYER</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                <div className="text-xs">
                  <p className="font-semibold">Supplier — Kyal Textile Mills</p>
                  <p className="text-slate-500 font-mono text-[11px]">supplier@mylonex.demo / supplier123</p>
                </div>
                <span className="text-[10px] font-bold tracking-wide bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2 py-1 rounded-full">SUPPLIER</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Use the buttons above to autofill, then Login.</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Role is enforced server-side — buyers can’t access <span className="font-mono">/supplier/*</span> and vice-versa.
        </p>
      </div>
    </div>
  );
}
