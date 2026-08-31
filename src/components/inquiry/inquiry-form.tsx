'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { createInquiry } from '@/lib/actions';
import { useToast } from '@/components/ui/toast';

export default function InquiryForm({ fabric, isLoggedIn, role }: { fabric: any; isLoggedIn: boolean; role?: string }) {
  const [type, setType] = useState<'SAMPLE_REQUEST' | 'BULK_RFQ'>('BULK_RFQ');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setMsg('');
    const fd = new FormData(e.currentTarget);
    fd.set('type', type);
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

  if (!isLoggedIn) return <div className="bg-white border rounded-xl p-6 text-sm">Login to submit RFQ.</div>;

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-3">Create Inquiry</h3>
      <div className="flex gap-2 mb-4">
        <Button variant={type === 'BULK_RFQ' ? 'default' : 'outline'} size="sm" onClick={() => setType('BULK_RFQ')}>Bulk RFQ</Button>
        <Button variant={type === 'SAMPLE_REQUEST' ? 'default' : 'outline'} size="sm" onClick={() => setType('SAMPLE_REQUEST')}>Sample Request</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="fabricId" value={fabric.id} />
        <div>
          <Label>Quantity (meters) — MOQ {fabric.moq}m *</Label>
          <Input name="quantity" type="number" required placeholder={type === 'SAMPLE_REQUEST' ? 'e.g., 5' : 'e.g., 5000'} />
        </div>
        <div>
          <Label>Required Dispatch Date</Label>
          <Input name="requiredDispatchDate" type="date" />
        </div>
        <div>
          <Label>Delivery Location *</Label>
          <Input name="deliveryLocation" required placeholder="Mumbai" />
        </div>
        <div>
          <Label>Target Price per meter (₹)</Label>
          <Input name="targetPrice" type="number" step="0.01" placeholder="230" />
        </div>
        <div>
          <Label>Remarks</Label>
          <Textarea name="remarks" placeholder="Any specific requirements" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        <Button type="submit" className="w-full">{type === 'BULK_RFQ' ? 'Request Bulk Quote' : 'Request Sample'}</Button>
      </form>
    </div>
  );
}
