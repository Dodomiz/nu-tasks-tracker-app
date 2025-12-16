import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGenerateDistributionMutation } from '../api/distributionApi';

export default function DistributionWizardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generateDistribution] = useGenerateDistributionMutation();

  const canSubmit = !!groupId && !!startDate && !!endDate && !isSubmitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      toast.error('Missing group id');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await generateDistribution({
        groupId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }).unwrap();

      const previewId = res.data.previewId;
      toast.success('Distribution generation started');
      navigate(`/distribution/preview/${previewId}`);
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Failed to start distribution';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Task Distribution</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start date</label>
          <input
            type="date"
            className="input w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End date</label>
          <input
            type="date"
            className="input w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Starting…' : 'Generate Preview'}
          </button>
        </div>
      </form>
    </div>
  );
}
