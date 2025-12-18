/**
 * Invitation-related types for FR-026 Code-Based Invitation System
 * 
 * This module defines types for the code-based invitation system where admins
 * can generate shareable codes (8-char alphanumeric) with optional email restrictions.
 */

/**
 * Invitation status enum
 */
export type InviteStatus = 'pending' | 'approved';

/**
 * Core Invite entity returned from API
 */
export interface Invite {
  /** Unique identifier */
  id: string;
  
  /** ID of the group this invitation belongs to */
  groupId: string;
  
  /** 8-character alphanumeric invitation code (e.g., "A7B9C2XZ") */
  code: string;
  
  /** Target email address (null for "any user" invitations) */
  email: string | null;
  
  /** User ID who created the invitation */
  invitedBy: string;
  
  /** Display name of the user who created the invitation */
  invitedByName: string;
  
  /** Current status of the invitation */
  status: InviteStatus;
  
  /** User ID who redeemed the invitation (null if not redeemed) */
  usedBy: string | null;
  
  /** ISO date string when invitation was created */
  createdAt: string;
  
  /** ISO date string when invitation was redeemed (null if not redeemed) */
  usedAt: string | null;
}

/**
 * Request body for creating a new invitation
 */
export interface CreateInviteRequest {
  /** Target email address (omit or null for "any user" invitation) */
  email?: string;
}

/**
 * Response from creating an invitation
 */
export interface InviteResponse {
  /** Generated invitation code */
  code: string;
  
  /** Target email (null for "any user") */
  email: string | null;
  
  /** Group ID */
  groupId: string;
  
  /** ISO date string when created */
  createdAt: string;
}

/**
 * Response containing list of invitations
 */
export interface InvitesListResponse {
  /** Array of invitation records */
  invites: Invite[];
  
  /** Total count of invitations */
  total: number;
}

/**
 * Request body for redeeming an invitation code
 */
export interface RedeemInviteRequest {
  /** 8-character invitation code */
  code: string;
}

/**
 * Response from redeeming an invitation
 */
export interface RedeemInviteResponse {
  /** ID of the group joined */
  groupId: string;
  
  /** Name of the group joined */
  groupName: string;
  
  /** Success message */
  message: string;
}

/**
 * Props for invitation-related components
 */
export interface InvitationsTabProps {
  /** Group ID */
  groupId: string;
  
  /** Whether current user is admin */
  isAdmin: boolean;
}

export interface CreateInviteFormProps {
  /** Group ID */
  groupId: string;
  
  /** Callback on successful invitation creation */
  onSuccess?: (code: string) => void;
}

export interface InvitationsRecordsListProps {
  /** Group ID */
  groupId: string;
}

export interface InvitationRecordCardProps {
  /** Invitation record */
  invite: Invite;
}

export interface RedeemInviteModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  
  /** Callback to close modal */
  onClose: () => void;
}
