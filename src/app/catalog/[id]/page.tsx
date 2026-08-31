import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import InquiryForm from '@/components/inquiry/inquiry-form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function FabricDetail({ params }: { params: { id: string } }) {
  const fabric = await prisma.fabric.findUnique({ where: { id: params.id } });
  if (!fabric) return notFound();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/catalog" className="text-sm text-slate-600 hover:underline">← Back to Catalog</Link>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="bg-white border rounded-xl p-6">
          <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Fabric Image</div>
          <h1 className="text-2xl font-bold mt-4">{fabric.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant={fabric.productionStatus === 'READY_STOCK' ? 'success' : fabric.productionStatus === 'RUNNING_PRODUCTION' ? 'warning' : 'secondary'}>{fabric.productionStatus}</Badge>
            <Badge variant="secondary">{fabric.gsm} GSM</Badge>
          </div>
          <p className="mt-4 text-sm text-slate-700">{fabric.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Composition:</span> {fabric.composition}</div>
            <div><span className="font-medium">Weave:</span> {fabric.weave}</div>
            <div><span className="font-medium">Width:</span> {fabric.width}</div>
            <div><span className="font-medium">MOQ:</span> {fabric.moq} meters</div>
            <div><span className="font-medium">Dispatch:</span> {fabric.dispatchMinDays}-{fabric.dispatchMaxDays} days</div>
            <div><span className="font-medium">Certifications:</span> {fabric.certifications.join(', ')}</div>
          </div>
        </div>
        <div>
          {role === 'BUYER' || !session ? (
            <InquiryForm fabric={fabric} isLoggedIn={!!session} role={role} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
              Supplier accounts cannot create inquiries. Please login as Buyer.
            </div>
          )}
          {!session && <p className="text-sm text-slate-600 mt-3">Please <Link href="/login" className="underline">login as Buyer</Link> to submit inquiries.</p>}
        </div>
      </div>
    </div>
  );
}
