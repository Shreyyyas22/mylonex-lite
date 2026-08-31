import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CatalogFilters from '@/components/fabric/catalog-filters';

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Fabric Catalog</h1>
      <CatalogFilters />
      {fabrics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border mt-6">
          <p className="text-slate-500">No fabrics found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {fabrics.map((f) => (
            <Card key={f.id} className="overflow-hidden flex flex-col">
              <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">Fabric Image</div>
              <CardHeader>
                <CardTitle className="text-base">{f.name}</CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant={f.productionStatus === 'READY_STOCK' ? 'success' : f.productionStatus === 'RUNNING_PRODUCTION' ? 'warning' : 'secondary'}>
                    {f.productionStatus.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">{f.gsm} GSM</Badge>
                  <span className="text-xs text-slate-500">MOQ {f.moq}m · {f.dispatchMinDays}-{f.dispatchMaxDays} days</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {f.certifications.map((c) => (
                    <span key={c} className="text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-sm text-slate-600 line-clamp-2">{f.description}</p>
                <p className="text-xs text-slate-500 mt-2">{f.composition} · {f.weave} · {f.width}</p>
                <Link href={`/catalog/${f.id}`} className="mt-3 inline-block w-full text-center bg-slate-900 text-white rounded-md py-2 text-sm hover:bg-slate-800">View Detail</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
