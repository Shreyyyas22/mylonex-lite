export default function Loading() {
  return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white border rounded-xl animate-pulse" />)}</div>;
}
