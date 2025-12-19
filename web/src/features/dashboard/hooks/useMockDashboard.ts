import { useMemo } from 'react';
import type { GroupCardDto, DashboardResponse } from '@/types/dashboard';

// Mock data generator for testing UI without backend
export function useMockDashboard(_userId?: string): {
  data: DashboardResponse | undefined;
  isLoading: boolean;
  error: null;
  refetch: () => void;
} {
  const mockData = useMemo((): DashboardResponse => {
    const mockGroups: GroupCardDto[] = [
      {
        id: '1',
        name: 'Family Tasks',
        description: 'Household chores and errands for the family',
        avatarUrl: null,
        category: 'home',
        memberCount: 8,
        taskCount: 15,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        admins: [
          {
            userId: '1',
            firstName: 'John',
            lastName: 'Doe',
            avatarUrl: null,
            role: 'Admin',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        recentMembers: [
          {
            userId: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            userId: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            userId: '4',
            firstName: 'Sarah',
            lastName: 'Williams',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        myRole: 'Admin',
      },
      {
        id: '2',
        name: 'Work Team - Q1 Projects',
        avatarUrl: null,
        category: 'work',
        description: 'Quarterly planning and execution tasks',
        memberCount: 12,
        taskCount: 23,
        lastActivity: new Date().toISOString(), // Active now
        admins: [
          {
            userId: '5',
            firstName: 'Alice',
            lastName: 'Brown',
            avatarUrl: null,
            role: 'Admin',
            joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            userId: '6',
            firstName: 'Bob',
            lastName: 'Wilson',
            avatarUrl: null,
            role: 'Admin',
            joinedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        recentMembers: [
          {
            userId: '7',
            firstName: 'Carol',
            lastName: 'Davis',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            userId: '8',
            firstName: 'David',
            lastName: 'Miller',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        myRole: 'Member',
      },
      {
        id: '3',
        name: 'Book Club',
        description: 'Monthly reading discussions and recommendations',
        avatarUrl: null,
        category: 'hobbies',
        memberCount: 5,
        taskCount: 3,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        admins: [
          {
            userId: '9',
            firstName: 'Emma',
            lastName: 'Garcia',
            avatarUrl: null,
            role: 'Admin',
            joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        recentMembers: [
          {
            userId: '10',
            firstName: 'Frank',
            lastName: 'Martinez',
            avatarUrl: null,
            role: 'Member',
            joinedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        myRole: 'Admin',
      },
    ];

    return {
      groups: mockGroups,
      total: mockGroups.length,
      currentPage: 1,
      pageSize: 12,
      hasMore: false,
    };
  }, []);

  return {
    data: mockData,
    isLoading: false,
    error: null,
    refetch: () => {
      // Mock refetch - does nothing in mock mode
    },
  };
}
