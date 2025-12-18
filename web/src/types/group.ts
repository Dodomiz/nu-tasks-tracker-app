export type Role = 'Admin' | 'RegularUser';

export interface Member {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
  joinedAt: string;
  invitedBy?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  category: string;
  invitationCode?: string; // Only visible to Admins
  memberCount: number;
  members?: Member[]; // Full list only for Admins
  myRole: Role;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  category: string;
}

export interface UpdateGroupRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  category: string;
}

export interface InviteMemberRequest {
  email: string;
}

export interface InviteResponse {
  message: string;
  invitationUrl: string;
}

export interface GroupsResponse {
  groups: Group[];
  total: number;
}

export interface PromoteMemberRequest {
  groupId: string;
  userId: string;
}

export interface DemoteMemberRequest {
  groupId: string;
  userId: string;
}

export interface RemoveMemberRequest {
  groupId: string;
  userId: string;
}

export interface InviteDto {
  id: string;
  groupId: string;
  email: string;
  status: 'Pending' | 'Joined' | 'Declined' | 'Canceled' | 'Expired';
  invitedBy: string;
  invitedByName: string;
  invitedAt: string;
  respondedAt?: string;
  sendCount: number;
}
