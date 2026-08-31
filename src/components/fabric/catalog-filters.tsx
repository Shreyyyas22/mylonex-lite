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
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs font-medium">Search name</label>
        <Input placeholder="Cotton" value={search} onChange={e => setSearch(e.target.value)} className="w-40" />
      </div>
      <div>
        <label className="text-xs font-medium">Production Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-9 w-40 rounded-md border px-3 text-sm bg-white">
          <option value="">All</option>
          <option value="READY_STOCK">Ready Stock</option>
          <option value="RUNNING_PRODUCTION">Running Production</option>
          <option value="MADE_TO_ORDER">Made to Order</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Certification</label>
        <select value={cert} onChange={e => setCert(e.target.value)} className="h-9 w-40 rounded-md border px-3 text-sm bg-white">
          <option value="">All</option>
          <option value="GOTS">GOTS</option>
          <option value="OEKO-TEX">OEKO-TEX</option>
          <option value="BCI">BCI</option>
          <option value="WRAP">WRAP</option>
        </select>
      </div>
      <Button onClick={apply}>Apply</Button>
      <Button variant="outline" onClick={clear}>Clear</Button>
    </div>
  );
}
