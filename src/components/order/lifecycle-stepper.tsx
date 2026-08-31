type Step = { label: string; done: boolean; current?: boolean };

export function LifecycleStepper({ inquiryStatus, orderStatus }: { inquiryStatus: string; orderStatus?: string }) {
  // 5 stages: RFQ Submitted, Quote Received, Order Confirmed, In Production, Dispatched
  const stages: Step[] = [
    { label: 'RFQ Submitted', done: true },
    { label: 'Quote Received', done: ['QUOTED', 'ORDER_CONFIRMED', 'IN_PRODUCTION', 'DISPATCHED'].includes(inquiryStatus) },
    { label: 'Order Confirmed', done: ['ORDER_CONFIRMED', 'IN_PRODUCTION', 'DISPATCHED'].includes(orderStatus || inquiryStatus) },
    { label: 'In Production', done: (orderStatus as string) === 'IN_PRODUCTION' || (orderStatus as string) === 'DISPATCHED' || inquiryStatus === 'IN_PRODUCTION' || inquiryStatus === 'DISPATCHED' },
    { label: 'Dispatched', done: (orderStatus as string) === 'DISPATCHED' || inquiryStatus === 'DISPATCHED' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${s.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`mt-2 text-xs font-medium text-center ${s.done ? 'text-emerald-700' : 'text-slate-500'}`}>{s.label}</span>
            </div>
            {i < stages.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${stages[i + 1].done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}
