import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LifecycleStepper } from '@/components/order/lifecycle-stepper';

export default async function BuyerInquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if ((session.user as any).role !== 'BUYER') redirect('/login?error=Forbidden');

  const buyerId = (session.user as any).id;
  const inquiries = await prisma.inquiry.findMany({
    where: { buyerId },
    include: { fabric: true, quotes: true, order: true },
    orderBy: { createdAt: 'desc' },
  });

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="font-medium">No inquiries yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Browse catalog and submit a Bulk RFQ or Sample Request.</p>
        <Link href="/catalog" className="mt-4 inline-block bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-100 active:bg-black dark:active:bg-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Inquiries</h1>
      <div className="space-y-4">
        {inquiries.map((inq) => (
          <Card key={inq.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{inq.fabric.name} · {inq.type.replace('_', ' ')}</CardTitle>
                <Badge variant={inq.status === 'PENDING_QUOTE' ? 'warning' : inq.status === 'QUOTED' ? 'secondary' : inq.status.includes('DISPATCHED') ? 'success' : 'default'}>{inq.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Qty {inq.quantity}m · {inq.fabric.gsm} GSM · Target ₹{inq.targetPrice ?? '-'} /m · {new Date(inq.createdAt).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <div className="py-2">
                <LifecycleStepper inquiryStatus={inq.status} orderStatus={inq.order?.status} />
              </div>
              <Link href={`/buyer/inquiries/${inq.id}`} className="mt-3 inline-block text-sm bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-100 active:bg-black dark:active:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow">View Detail</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
