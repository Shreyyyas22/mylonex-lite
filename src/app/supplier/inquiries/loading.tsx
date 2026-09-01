export default function Loading() {
  return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />)}</div>;
}
