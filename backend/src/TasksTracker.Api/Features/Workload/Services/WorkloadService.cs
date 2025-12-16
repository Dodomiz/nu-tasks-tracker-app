using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Workload.Models;

namespace TasksTracker.Api.Features.Workload.Services;

public class WorkloadService(ITaskRepository taskRepository, IGroupRepository groupRepository, IUserRepository userRepository) : IWorkloadService
{
    public async Task<WorkloadMetrics> GetGroupWorkloadAsync(string groupId, DifficultyRange range, CancellationToken ct)
    {
        var members = await groupRepository.GetMembersAsync(groupId, ct);
        var memberIds = members.Select(m => m.UserId).ToHashSet();
        var (tasks, _) = await taskRepository.FindAsync(groupId, null, null, null, 1, 1000, ct);
        var filtered = tasks.Where(t => t.Status is Core.Domain.TaskStatus.Pending or Core.Domain.TaskStatus.InProgress);

        filtered = range switch
        {
            DifficultyRange.Easy => filtered.Where(t => t.Difficulty is >= 1 and <= 3),
            DifficultyRange.Medium => filtered.Where(t => t.Difficulty is >= 4 and <= 6),
            DifficultyRange.Hard => filtered.Where(t => t.Difficulty is >= 7 and <= 10),
            _ => filtered
        };

        var dict = new Dictionary<string, (int count, int total)>();
        foreach (var id in memberIds)
            dict[id] = (0, 0);

        foreach (var t in filtered)
        {
            if (!memberIds.Contains(t.AssignedUserId)) continue;
            var entry = dict[t.AssignedUserId];
            dict[t.AssignedUserId] = (entry.count + 1, entry.total + t.Difficulty);
        }

        var totalDifficulty = dict.Values.Sum(v => v.total);
        var totalTasks = dict.Values.Sum(v => v.count);
        var avg = memberIds.Count() == 0 ? 0 : (double)totalDifficulty / memberIds.Count();
        var min = dict.Values.Select(v => v.total).DefaultIfEmpty(0).Min();
        var max = dict.Values.Select(v => v.total).DefaultIfEmpty(0).Max();
        var variancePercent = avg == 0 ? 0 : ((max - avg) / avg) * 100.0;
        var color = variancePercent < 10 ? "green" : variancePercent < 15 ? "yellow" : "red";

        var users = new List<UserWorkload>();
        var userInfos = await userRepository.GetByIdsAsync(memberIds.ToList(), ct);
        var nameById = userInfos.ToDictionary(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim());

        foreach (var kv in dict)
        {
            var percent = totalDifficulty == 0 ? 0 : (double)kv.Value.total / totalDifficulty * 100.0;
            users.Add(new UserWorkload
            {
                UserId = kv.Key,
                DisplayName = nameById.TryGetValue(kv.Key, out var dn) ? dn : string.Empty,
                TaskCount = kv.Value.count,
                TotalDifficulty = kv.Value.total,
                Percentage = Math.Round(percent, 2)
            });
        }

        return new WorkloadMetrics
        {
            GroupId = groupId,
            MemberCount = memberIds.Count,
            TotalTasks = totalTasks,
            TotalDifficulty = totalDifficulty,
            AverageDifficultyPerUser = Math.Round(avg, 2),
            MinDifficulty = min,
            MaxDifficulty = max,
            VariancePercent = Math.Round(variancePercent, 2),
            ThresholdColor = color,
            Users = users.OrderBy(u => u.DisplayName).ToList()
        };
    }

    public async Task<(WorkloadMetrics current, WorkloadMetrics preview)> GetPreviewAsync(string groupId, string assignedTo, int difficulty, CancellationToken ct)
    {
        var current = await GetGroupWorkloadAsync(groupId, DifficultyRange.All, ct);

        // Apply hypothetical assignment
        var users = current.Users.ToDictionary(u => u.UserId, u => (u.TaskCount, u.TotalDifficulty));
        if (!users.ContainsKey(assignedTo)) users[assignedTo] = (0, 0);
        var entry = users[assignedTo];
        users[assignedTo] = (entry.TaskCount + 1, entry.TotalDifficulty + difficulty);

        var totalDifficulty = users.Values.Sum(v => v.TotalDifficulty);
        var avg = current.MemberCount == 0 ? 0 : (double)totalDifficulty / current.MemberCount;
        var min = users.Values.Select(v => v.TotalDifficulty).DefaultIfEmpty(0).Min();
        var max = users.Values.Select(v => v.TotalDifficulty).DefaultIfEmpty(0).Max();
        var variancePercent = avg == 0 ? 0 : ((max - avg) / avg) * 100.0;
        var color = variancePercent < 10 ? "green" : variancePercent < 15 ? "yellow" : "red";

        var preview = new WorkloadMetrics
        {
            GroupId = groupId,
            MemberCount = current.MemberCount,
            TotalTasks = current.TotalTasks + 1,
            TotalDifficulty = totalDifficulty,
            AverageDifficultyPerUser = Math.Round(avg, 2),
            MinDifficulty = min,
            MaxDifficulty = max,
            VariancePercent = Math.Round(variancePercent, 2),
            ThresholdColor = color,
            Users = current.Users.Select(u => new UserWorkload
            {
                UserId = u.UserId,
                DisplayName = u.DisplayName,
                TaskCount = users[u.UserId].TaskCount,
                TotalDifficulty = users[u.UserId].TotalDifficulty,
                Percentage = totalDifficulty == 0 ? 0 : Math.Round((double)users[u.UserId].TotalDifficulty / totalDifficulty * 100.0, 2)
            }).ToList()
        };

        return (current, preview);
    }
}
