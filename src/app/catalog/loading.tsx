export default function Loading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-64 bg-white border rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
