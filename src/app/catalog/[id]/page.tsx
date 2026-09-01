import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import InquiryForm from '@/components/inquiry/inquiry-form';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

const fabricImages: Record<string, string> = {
  'Organic Cotton Poplin 40s': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop',
  'Indigo Yarn-Dyed Check Shirting': 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&h=600&fit=crop',
  'Bamboo Lyocell Blend Satin': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop',
  'Heavyweight Canvas Greige': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop',
};

const statusStyles: Record<string, string> = {
  READY_STOCK: 'bg-emerald-500 text-white border-emerald-600',
  RUNNING_PRODUCTION: 'bg-amber-500 text-white border-amber-600',
  MADE_TO_ORDER: 'bg-slate-700 text-white border-slate-800 dark:bg-slate-600',
};

export default async function FabricDetail({ params }: { params: { id: string } }) {
  const fabric = await prisma.fabric.findUnique({ where: { id: params.id } });
  if (!fabric) return notFound();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const image = fabricImages[fabric.name] || fabric.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Back to Catalog
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="relative h-64 overflow-hidden">
            <img src={image} alt={fabric.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide border shadow-sm ${statusStyles[fabric.productionStatus]}`}>
                {fabric.productionStatus.replace('_', ' ')}
              </span>
              <span className="bg-white/95 dark:bg-slate-900/90 backdrop-blur text-slate-900 dark:text-white text-xs font-semibold px-3 py-1 rounded-full border shadow-sm">
                {fabric.gsm} GSM
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-xl font-bold text-white drop-shadow-sm">{fabric.name}</h1>
              <p className="text-xs text-white/80 mt-1">{fabric.composition} • {fabric.weave} • {fabric.width}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{fabric.description}</p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {[
                { label: 'Composition', value: fabric.composition },
                { label: 'Weave', value: fabric.weave },
                { label: 'Width', value: fabric.width },
                { label: 'MOQ', value: `${fabric.moq} meters` },
                { label: 'Dispatch', value: `${fabric.dispatchMinDays}–${fabric.dispatchMaxDays} days` },
                { label: 'Certifications', value: fabric.certifications.join(' • ') },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5">
                  <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">{item.label}</p>
                  <p className="text-sm font-medium mt-1 leading-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {role === 'BUYER' || !session ? (
            <InquiryForm fabric={fabric} />
          ) : (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-6">
              <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Supplier view</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">Supplier accounts can&apos;t create inquiries. Log in as a buyer to request a quote.</p>
              <Link href="/login" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">Switch to Buyer</Link>
            </div>
          )}
          {!session && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 text-center">
              Already have an account? <Link href="/login" className="font-semibold underline underline-offset-4">Log in as Buyer</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}