import { useGetTasksQuery } from '../api/tasksApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

export default function MyTasksPage() {
  const userId = useSelector((s: RootState) => s.auth.user?.id);
  const groupId = useSelector((s: RootState) => s.group.currentGroupId);
  const { data, isLoading, error } = useGetTasksQuery({ assignedTo: userId ?? undefined, groupId: groupId ?? undefined, pageSize: 20 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error loading tasks</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Tasks</h1>
      <ul className="space-y-2">
        {data?.items.map((t) => (
          <li key={t.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-600">Due: {new Date(t.dueAt).toLocaleString()}</div>
            </div>
            {t.isOverdue && <span className="text-red-600 text-sm">Overdue</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
