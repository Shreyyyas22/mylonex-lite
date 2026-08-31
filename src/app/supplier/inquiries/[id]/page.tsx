import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { LifecycleStepper } from '@/components/order/lifecycle-stepper';
import { createQuote, updateOrderStatus } from '@/lib/actions';

export default async function SupplierInquiryDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if ((session.user as any).role !== 'SUPPLIER') redirect('/login?error=Forbidden');

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: params.id },
    include: { fabric: true, buyer: true, quotes: true, order: true },
  });
  if (!inquiry) return notFound();

  const existingQuote = inquiry.quotes[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{inquiry.fabric.name} — Inquiry Detail</CardTitle>
          <Badge variant="secondary">{inquiry.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Buyer:</span> {inquiry.buyer.name} ({inquiry.buyer.email})</p>
          <p><span className="font-medium">Type:</span> {inquiry.type} · Qty {inquiry.quantity}m (MOQ {inquiry.fabric.moq}m)</p>
          <p><span className="font-medium">Fabric:</span> {inquiry.fabric.composition}, {inquiry.fabric.weave}, {inquiry.fabric.gsm} GSM</p>
          <p><span className="font-medium">Delivery:</span> {inquiry.deliveryLocation} {inquiry.requiredDispatchDate ? `· ${new Date(inquiry.requiredDispatchDate).toLocaleDateString()}` : ''}</p>
          <p><span className="font-medium">Target Price:</span> {inquiry.targetPrice ? `₹${inquiry.targetPrice}/m` : '-'}</p>
          <p><span className="font-medium">Remarks:</span> {inquiry.remarks || '-'}</p>
          <div className="pt-4">
            <LifecycleStepper inquiryStatus={inquiry.status} orderStatus={inquiry.order?.status} />
          </div>
        </CardContent>
      </Card>

      {!existingQuote && inquiry.status === 'PENDING_QUOTE' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Quote</CardTitle></CardHeader>
          <CardContent>
            <form action={createQuote as any} className="space-y-3">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <div>
                <Label>Price per meter (₹) *</Label>
                <Input name="pricePerMeter" type="number" step="0.01" required placeholder="245" />
              </div>
              <div>
                <Label>Estimated Dispatch Timeline *</Label>
                <Input name="estimatedDispatchTimeline" required placeholder="15-20 days" />
              </div>
              <div>
                <Label>Payment Terms *</Label>
                <Input name="paymentTerms" required placeholder="50% advance, 50% before dispatch" />
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea name="remarks" placeholder="Additional notes" />
              </div>
              <Button type="submit" className="w-full">Submit Quote → QUOTED</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {existingQuote && (
        <Card>
          <CardHeader><CardTitle className="text-base">Submitted Quote</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="font-medium">Price:</span> ₹{existingQuote.pricePerMeter}/m</p>
            <p><span className="font-medium">Timeline:</span> {existingQuote.estimatedDispatchTimeline}</p>
            <p><span className="font-medium">Payment:</span> {existingQuote.paymentTerms}</p>
            <p><span className="font-medium">Remarks:</span> {existingQuote.remarks || '-'}</p>
          </CardContent>
        </Card>
      )}

      {inquiry.order && (
        <Card>
          <CardHeader><CardTitle className="text-base">Order Lifecycle — {inquiry.order.status}</CardTitle></CardHeader>
          <CardContent>
            <LifecycleStepper inquiryStatus={inquiry.status} orderStatus={inquiry.order.status} />
            <div className="flex gap-2 mt-4">
              {inquiry.order.status === 'ORDER_CONFIRMED' && (
                <form action={updateOrderStatus as any}>
                  <input type="hidden" name="orderId" value={inquiry.order.id} />
                  <input type="hidden" name="status" value="IN_PRODUCTION" />
                  <Button type="submit">Start Production → IN_PRODUCTION</Button>
                </form>
              )}
              {inquiry.order.status === 'IN_PRODUCTION' && (
                <form action={updateOrderStatus as any}>
                  <input type="hidden" name="orderId" value={inquiry.order.id} />
                  <input type="hidden" name="status" value="DISPATCHED" />
                  <Button type="submit">Mark Dispatched → DISPATCHED</Button>
                </form>
              )}
              {inquiry.order.status === 'DISPATCHED' && <p className="text-sm text-emerald-700">All 5 stages complete.</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
