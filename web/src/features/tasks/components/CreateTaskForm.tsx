import { useState } from 'react';
import { useCreateTaskMutation } from '../api/tasksApi';

interface Props {
  groupId: string;
  onCreated?: (id: string) => void;
}

export default function CreateTaskForm({ groupId, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [assignedUserId, setAssignedUserId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [frequency, setFrequency] = useState<'OneTime' | 'Daily' | 'Weekly' | 'Monthly'>('OneTime');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const groupMissing = !groupId?.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (groupMissing) return setError('Please select a group first');
    if (!name.trim()) return setError('Name is required');
    if (!assignedUserId) return setError('Assignee is required');
    if (!dueAt) return setError('Due date/time is required');
    if (difficulty < 1 || difficulty > 10) return setError('Difficulty must be 1-10');

    try {
      const res = await createTask({
        groupId,
        assignedUserId,
        name,
        description: description || undefined,
        difficulty,
        dueAt,
        frequency,
      }).unwrap();
      onCreated?.(res.id);
      setName('');
      setDescription('');
      setDifficulty(5);
      setAssignedUserId('');
      setDueAt('');
      setFrequency('OneTime');
      setDaysOfWeek([]);
    } catch (err: any) {
      setError(err?.data?.error?.message ?? 'Failed to create task');
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {groupMissing && (
        <div className="text-sm text-gray-600">Please select a group to enable task creation.</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input className="mt-1 input" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea className="mt-1 input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty (1-10)</label>
          <input type="number" min={1} max={10} className="mt-1 input" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date/Time</label>
          <input type="datetime-local" className="mt-1 input" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Frequency</label>
        <select className="mt-1 input" value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
          <option value="OneTime">One-time</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>
      {frequency === 'Weekly' && (
        <div>
          <label className="block text-sm font-medium">Days of Week</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
              <label key={d} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={daysOfWeek.includes(d)} onChange={(e) => {
                  setDaysOfWeek((prev) => e.target.checked ? [...prev, d] : prev.filter(x => x !== d));
                }} />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assignee</label>
        <input className="mt-1 input" value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} placeholder="Select group member" />
        {/* TODO: replace with AssigneeSelector component (US-003) */}
      </div>
      <button type="submit" disabled={isLoading || groupMissing} className="btn btn-primary">
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
