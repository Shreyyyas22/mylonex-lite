export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
