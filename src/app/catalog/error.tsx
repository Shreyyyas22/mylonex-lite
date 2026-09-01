'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-6 rounded-2xl text-center">
      <p className="font-medium text-red-800 dark:text-red-300">Failed to load catalog</p>
      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
      <button onClick={() => reset()} className="mt-3 bg-red-600 dark:bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Try again</button>
    </div>
  );
}
