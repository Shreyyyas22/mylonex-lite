'use client';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';

export function QuoteNotifier() {
  const { toast } = useToast();
  const lastCheck = useRef<string>(new Date().toISOString());
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/quotes?since=${encodeURIComponent(lastCheck.current)}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        for (const q of data.quotes || []) {
          if (seen.current.has(q.id)) continue;
          seen.current.add(q.id);
          toast(`New quote received: ${q.inquiry.fabric.name} — ₹${q.pricePerMeter}/m from ${q.supplier.name}`, 'success');
        }
        if (data.quotes?.length) {
          lastCheck.current = new Date().toISOString();
        }
      } catch {}
    }
    // initial delay then interval
    const id = setInterval(poll, 8000);
    // also poll once after 5s
    const t = setTimeout(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearTimeout(t);
    };
  }, [toast]);

  return null;
}
