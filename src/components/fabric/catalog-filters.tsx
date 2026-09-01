'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function CatalogFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [cert, setCert] = useState(searchParams.get('certification') || '');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setStatus(searchParams.get('status') || '');
    setCert(searchParams.get('certification') || '');
  }, [searchParams]);

  function apply() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (cert) params.set('certification', cert);
    router.push(`/catalog?${params.toString()}`);
  }
  function clear() {
    setSearch(''); setStatus(''); setCert('');
    router.push('/catalog');
  }

  const hasActive = search || status || cert;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Search fabric</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <Input
                placeholder="e.g. Organic Cotton"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && apply()}
                className="pl-9 h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Availability</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">All stock types</option>
              <option value="READY_STOCK">Ready Stock</option>
              <option value="RUNNING_PRODUCTION">Running Production</option>
              <option value="MADE_TO_ORDER">Made to Order</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Certification</label>
            <select
              value={cert}
              onChange={e => setCert(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Any certification</option>
              <option value="GOTS">GOTS</option>
              <option value="OEKO-TEX 100">OEKO-TEX 100</option>
              <option value="BCI">BCI</option>
              <option value="GRS">GRS</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 lg:pb-0">
          <Button onClick={apply} className="h-10 px-6">Apply filters</Button>
          <Button variant="outline" onClick={clear} disabled={!hasActive} className="h-10">Clear</Button>
        </div>
      </div>
      {hasActive && (
        <p className="text-xs text-slate-500 mt-3">
          Active: {[search && `"${search}"`, status && status.replace('_',' '), cert && cert].filter(Boolean).join(' • ')}
        </p>
      )}
    </div>
  );
}
