// Dashboard feature types
export interface MemberSummary {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: 'Admin' | 'Member';
  joinedAt: string;
}

export interface GroupCardDto {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  taskCount: number;
  lastActivity: string;
  admins: MemberSummary[];
  recentMembers: MemberSummary[];
  myRole: 'Admin' | 'Member';
}

export interface DashboardResponse {
  groups: GroupCardDto[];
  total: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}
