'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function InquiryForm({ fabric }: { fabric: any }) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const role = (session?.user as any)?.role;
  const [type, setType] = useState<'SAMPLE_REQUEST' | 'BULK_RFQ'>('BULK_RFQ');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setMsg('');
    const fd = new FormData(e.currentTarget);
    fd.set('type', type);
    const { createInquiry } = await import('@/lib/actions');
    const res = await createInquiry(fd);
    if ((res as any).error) {
      setError((res as any).error);
      toast((res as any).error, 'error');
    } else {
      setMsg('Inquiry submitted — status PENDING_QUOTE');
      toast('Inquiry created successfully');
      (e.target as HTMLFormElement).reset();
    }
  }

  if (status === 'loading') {
    return <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500">Loading…</div>;
  }
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <p className="font-semibold mt-3 text-sm">Login to request a quote</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Buyers can create Sample or Bulk RFQs with MOQ validation.</p>
        <a href="/login" className="mt-4 inline-flex w-full justify-center bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold">Go to Login</a>
      </div>
    );
  }
  if (role === 'SUPPLIER') {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-6">
        <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Supplier view</p>
        <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">Supplier accounts can&apos;t create inquiries. Log in as a buyer to request a quote.</p>
        <a href="/login" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">Switch to Buyer</a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="font-semibold">Create Inquiry</h3>
        <p className="text-xs text-slate-500 mt-1">Choose type and fill dispatch details. Quantity is validated against MOQ.</p>

        <div className="mt-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex gap-1">
          {[
            { id: 'BULK_RFQ', label: 'Bulk RFQ' },
            { id: 'SAMPLE_REQUEST', label: 'Sample Request' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id as any)}
              className={`flex-1 h-8 rounded-lg text-sm font-medium transition-colors ${type === tab.id ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <input type="hidden" name="fabricId" value={fabric.id} />
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity (meters) — MOQ {fabric.moq}m *</Label>
            <Input id="quantity" name="quantity" type="number" required placeholder={type === 'SAMPLE_REQUEST' ? 'e.g., 5' : 'e.g., 5000'} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
            <p className="text-[11px] text-slate-500">Must be &ge; {fabric.moq}m. Server validates on submit.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Required date</Label>
              <Input id="date" name="requiredDispatchDate" type="date" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Target price (&pound;/m)</Label>
              <Input id="price" name="targetPrice" type="number" step="0.01" placeholder="230" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Delivery location *</Label>
            <Input id="location" name="deliveryLocation" required placeholder="Mumbai, Maharashtra" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" placeholder="Any specific requirements, finish or packaging notes" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
          </div>

          {error && <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm px-3 py-2">{error}</div>}
          {msg && <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-2">{msg}</div>}

          <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold">
            {type === 'BULK_RFQ' ? 'Request Bulk Quote' : 'Request Sample'}
          </Button>
          <p className="text-[11px] text-center text-slate-500">Creates an inquiry with status PENDING_QUOTE</p>
        </form>
      </div>
    </div>
  );
}