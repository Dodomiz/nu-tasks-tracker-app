import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import RedeemCodeInviteModal from '../components/RedeemCodeInviteModal';

/**
 * Page wrapper for the code redemption modal (FR-026)
 * Accessible via /groups/join route
 */
export default function RedeemCodePage() {
  const navigate = useNavigate();
  const [isOpen] = useState(true);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RedeemCodeInviteModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
