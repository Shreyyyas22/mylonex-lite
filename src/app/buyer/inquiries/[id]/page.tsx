import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifecycleStepper } from '@/components/order/lifecycle-stepper';
import { acceptQuote, rejectQuote } from '@/lib/actions';

export default async function BuyerInquiryDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if ((session.user as any).role !== 'BUYER') redirect('/login?error=Forbidden');

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: params.id },
    include: { fabric: true, quotes: true, order: true },
  });
  if (!inquiry) return notFound();
  if (inquiry.buyerId !== (session.user as any).id) redirect('/login?error=Forbidden');

  const quote = inquiry.quotes[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{inquiry.fabric.name}</CardTitle>
          <p className="text-sm text-slate-600">{inquiry.fabric.composition} · {inquiry.fabric.weave} · Qty {inquiry.quantity}m</p>
          <Badge variant="secondary" className="w-fit">{inquiry.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Type:</span> {inquiry.type}</p>
          <p><span className="font-medium">Delivery:</span> {inquiry.deliveryLocation} {inquiry.requiredDispatchDate ? `· ${new Date(inquiry.requiredDispatchDate).toLocaleDateString()}` : ''}</p>
          <p><span className="font-medium">Target Price:</span> {inquiry.targetPrice ? `₹${inquiry.targetPrice}/m` : '-'}</p>
          <p><span className="font-medium">Remarks:</span> {inquiry.remarks || '-'}</p>
          <div className="pt-4">
            <LifecycleStepper inquiryStatus={inquiry.status} orderStatus={inquiry.order?.status} />
          </div>
        </CardContent>
      </Card>

      {inquiry.status === 'PENDING_QUOTE' && <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">Awaiting supplier quote. Supplier will see this in their dashboard.</div>}

      {quote && (
        <Card>
          <CardHeader><CardTitle className="text-base">Quote Comparison</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Your Target</p>
                <p className="text-lg font-bold">{inquiry.targetPrice ? `₹${inquiry.targetPrice}/m` : '-'}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                <p className="text-xs text-slate-500">Supplier Price</p>
                <p className="text-lg font-bold">₹{quote.pricePerMeter}/m</p>
                {inquiry.targetPrice && <p className={`text-xs ${quote.pricePerMeter > inquiry.targetPrice ? 'text-red-600' : 'text-emerald-700'}`}>Delta {quote.pricePerMeter - inquiry.targetPrice! > 0 ? `+₹${(quote.pricePerMeter - inquiry.targetPrice!).toFixed(0)}/m` : `₹${(quote.pricePerMeter - inquiry.targetPrice!).toFixed(0)}/m`}</p>}
              </div>
            </div>
            <div className="mt-3 text-sm space-y-1">
              <p><span className="font-medium">Dispatch Timeline:</span> {quote.estimatedDispatchTimeline}</p>
              <p><span className="font-medium">Payment Terms:</span> {quote.paymentTerms}</p>
              <p><span className="font-medium">Remarks:</span> {quote.remarks || '-'}</p>
            </div>
            {inquiry.status === 'QUOTED' && (
              <div className="flex gap-2 mt-4">
                <form action={acceptQuote as any}>
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <input type="hidden" name="quoteId" value={quote.id} />
                  <Button type="submit">Accept → Create Order</Button>
                </form>
                <form action={rejectQuote as any}>
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <Button type="submit" variant="outline">Reject</Button>
                </form>
              </div>
            )}
            {inquiry.status === 'QUOTE_REJECTED' && <p className="text-sm text-red-600 mt-3">Quote rejected.</p>}
            {['ORDER_CONFIRMED', 'IN_PRODUCTION', 'DISPATCHED'].includes(inquiry.status) && <p className="text-sm text-emerald-700 mt-3">Order {inquiry.order?.status} — track stepper above.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
