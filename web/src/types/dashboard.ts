// Dashboard feature types
import {Role} from "@/types/group.ts";

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
  avatarUrl: string | null;
  category: string;
  memberCount: number;
  taskCount: number;
  lastActivity: string;
  admins: MemberSummary[];
  recentMembers: MemberSummary[];
  myRole: Role;
}

export interface DashboardResponse {
  groups: GroupCardDto[];
  total: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}
