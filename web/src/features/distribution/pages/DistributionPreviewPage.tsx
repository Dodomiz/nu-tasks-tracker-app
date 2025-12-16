import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetPreviewQuery, useApplyDistributionMutation } from '../api/distributionApi';

export default function DistributionPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, error, isLoading, refetch } = useGetPreviewQuery(id || '', {
    skip: !id,
    pollingInterval: 2000,
  });

  const [applyDistribution, { isLoading: isApplying }] = useApplyDistributionMutation();

  useEffect(() => {
    if (error) {
      // @ts-ignore
      const msg = (error?.data?.error?.message as string) || 'Failed to load preview';
      toast.error(msg);
    }
  }, [error]);

  const preview = data?.data;

  const applyNow = async () => {
    if (!id) return;
    try {
      await applyDistribution({ id, body: { modifications: [] } }).unwrap();
      toast.success('Distribution applied');
      navigate('/');
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Failed to apply distribution';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Distribution Preview</h1>
        <div className="text-sm text-gray-500">ID: {id}</div>
      </div>

      {isLoading && <div>Loading preview…</div>}
      {!isLoading && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 rounded bg-gray-100 text-sm">Status: {preview.status}</span>
            <span className="px-2 py-1 rounded bg-gray-100 text-sm">Method: {preview.method}</span>
            {preview.error && (
              <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">{preview.error}</span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>Refresh</button>
          </div>

          {preview.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Total Tasks</div>
                <div className="text-lg font-semibold">{preview.stats.totalTasks}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Total Users</div>
                <div className="text-lg font-semibold">{preview.stats.totalUsers}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-xs text-gray-500">Workload Variance</div>
                <div className="text-lg font-semibold">{preview.stats.workloadVariance.toFixed(2)}%</div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Task</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Assigned To</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Confidence</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.assignments.map((a) => (
                  <tr key={a.taskId}>
                    <td className="px-3 py-2">{a.taskName}</td>
                    <td className="px-3 py-2">{a.assignedUserName}</td>
                    <td className="px-3 py-2">{Math.round(a.confidence * 100)}%</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{a.rationale || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={applyNow}
              disabled={isApplying || preview.status !== 'Completed'}
            >
              {isApplying ? 'Applying…' : 'Apply Distribution'}
            </button>
            <button className="btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
