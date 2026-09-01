import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="py-10">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold">B2B Textile Sourcing & RFQ Marketplace</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Browse curated fabrics, request samples or bulk quotes, and track orders from RFQ to dispatch — all in one place.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/catalog"><Button size="lg">Browse Catalog</Button></Link>
          <Link href="/login"><Button variant="outline" size="lg">Login as Buyer / Supplier</Button></Link>
        </div>
      </section>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold">For Buyers</h3><p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Search fabrics, submit RFQs with MOQ validation, compare quotes and track lifecycle.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold">For Suppliers</h3><p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Receive inquiries, build quotes, and manage order fulfillment with forward-only transitions.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold">Trusted Workflow</h3><p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Server-enforced RBAC and business rules ensure safety at every step.</p>
        </div>
      </div>
    </div>
  );
}
