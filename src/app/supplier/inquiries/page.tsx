import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function SupplierInquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if ((session.user as any).role !== 'SUPPLIER') redirect('/login?error=Forbidden');

  const inquiries = await prisma.inquiry.findMany({
    include: { fabric: true, buyer: true, quotes: true, order: true },
    orderBy: { createdAt: 'desc' },
  });

  if (inquiries.length === 0) {
    return <div className="text-center py-16 bg-white rounded-xl border"><p className="text-slate-500">No inquiries yet. Buyer inquiries will appear here.</p></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Supplier Inquiries</h1>
      <div className="space-y-4">
        {inquiries.map((inq) => (
          <Card key={inq.id}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-base">{inq.fabric.name} · {inq.type.replace('_', ' ')}</CardTitle>
                <Badge variant={inq.status === 'PENDING_QUOTE' ? 'warning' : inq.status === 'QUOTED' ? 'secondary' : 'success'}>{inq.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">Buyer: {inq.buyer.name} · Qty {inq.quantity}m · Target ₹{inq.targetPrice ?? '-'} · Delivery {inq.deliveryLocation}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 line-clamp-1">{inq.remarks || 'No remarks'}</p>
              <Link href={`/supplier/inquiries/${inq.id}`} className="mt-3 inline-block text-sm bg-slate-900 text-white px-3 py-1.5 rounded-md">Open Detail</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
