import { useGetTasksQuery } from '../api/tasksApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

export default function CalendarPage() {
  const groupId = useSelector((s: RootState) => s.group.currentGroupId);
  const { data } = useGetTasksQuery({ groupId: groupId ?? undefined, pageSize: 100 });
  const items = data?.items ?? [];

  // Simple calendar-like grouped by date
  const byDate = items.reduce<Record<string, typeof items>>( (acc, t) => {
    const key = new Date(t.dueAt).toDateString();
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Upcoming Tasks (30 days)</h1>
      <div className="space-y-4">
        {Object.entries(byDate).map(([day, tasks]) => (
          <div key={day}>
            <div className="font-medium mb-2">{day}</div>
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li key={t.id} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <span>{t.name}</span>
                    <span className="text-xs text-gray-600">{new Date(t.dueAt).toLocaleTimeString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
