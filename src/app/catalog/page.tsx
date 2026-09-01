import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import CatalogFilters from '@/components/fabric/catalog-filters';

const fabricImages: Record<string, string> = {
  'Organic Cotton Poplin 40s': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',
  'Indigo Yarn-Dyed Check Shirting': 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600&h=400&fit=crop',
  'Bamboo Lyocell Blend Satin': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop',
  'Heavyweight Canvas Greige': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop',
};

const statusStyles: Record<string, string> = {
  READY_STOCK: 'bg-emerald-500 text-white border-emerald-600',
  RUNNING_PRODUCTION: 'bg-amber-500 text-white border-amber-600',
  MADE_TO_ORDER: 'bg-slate-700 text-white border-slate-800 dark:bg-slate-600',
};

export default async function CatalogPage({ searchParams }: { searchParams: { search?: string; status?: string; certification?: string } }) {
  const search = searchParams.search?.toLowerCase();
  const status = searchParams.status;
  const certification = searchParams.certification;

  const where: any = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (status) where.productionStatus = status;
  if (certification) where.certifications = { has: certification };

  const fabrics = await prisma.fabric.findMany({ where, orderBy: { createdAt: 'asc' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fabric Catalog</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Curated textiles for bulk sourcing — {fabrics.length} {fabrics.length === 1 ? 'fabric' : 'fabrics'} {search || status || certification ? 'matching filters' : 'available'}
        </p>
      </div>

      <CatalogFilters />

      {fabrics.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <p className="font-medium">No fabrics found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting search or clearing filters.</p>
          <Link href="/catalog" className="mt-4 inline-block text-sm font-medium text-slate-900 dark:text-white underline underline-offset-4">Clear all filters</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fabrics.map((f) => (
            <div key={f.id} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={fabricImages[f.name] || f.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop'}
                  alt={f.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide border shadow-sm ${statusStyles[f.productionStatus]}`}>
                    {f.productionStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/95 dark:bg-slate-900/90 backdrop-blur text-slate-900 dark:text-white text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm">
                    {f.gsm} GSM
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-xs">
                  <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-full">MOQ {f.moq}m</span>
                  <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-full">{f.dispatchMinDays}–{f.dispatchMaxDays} days</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-[15px] leading-tight line-clamp-1">{f.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{f.composition} • {f.weave} • {f.width}</p>

                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {f.certifications.map((c) => (
                    <span key={c} className="text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>

                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 flex-1">
                  {f.description}
                </p>

                <Link
                  href={`/catalog/${f.id}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 hover:bg-slate-800 active:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:active:bg-slate-200 text-white text-sm font-medium rounded-xl py-2.5 transition-colors shadow-sm hover:shadow"
                >
                  View detail
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
