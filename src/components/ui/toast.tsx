'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' };
const Ctx = createContext<{ toast: (msg: string, type?: Toast['type']) => void } | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast outside provider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-xl shadow-lg text-sm border ${t.type === 'error' ? 'bg-red-600 dark:bg-red-500 text-white border-red-700 dark:border-red-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
