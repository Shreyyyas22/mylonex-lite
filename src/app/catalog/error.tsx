'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
      <p className="font-medium text-red-800">Failed to load catalog</p>
      <p className="text-sm text-red-600 mt-1">{error.message}</p>
      <button onClick={() => reset()} className="mt-3 bg-red-600 text-white px-4 py-1.5 rounded text-sm">Try again</button>
    </div>
  );
}
