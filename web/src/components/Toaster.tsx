import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { removeToast } from '@/app/slices/notificationsSlice';
// Removed framer-motion to avoid dependency; using simple transitions

export default function Toaster() {
  const toasts = useAppSelector((s) => s.notifications.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(removeToast(t.id)), 3000)
    );
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, dispatch]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            `rounded-lg px-4 py-3 shadow-lg text-white transition transform duration-200 ` +
            (t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-indigo-600')
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
