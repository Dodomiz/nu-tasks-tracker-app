using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Dashboard.Models;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Features.Dashboard.Services;

/// <summary>
/// Optimized dashboard service using MongoDB aggregation pipeline
/// for improved performance with large datasets (Sprint 2 - FR-024)
/// </summary>
public class DashboardServiceOptimized(
    MongoDbContext context,
    IUserRepository userRepository) : IDashboardService
{
    private readonly IMongoCollection<Group> _groupsCollection = context.Database.GetCollection<Group>("groups");

    public async Task<DashboardResponse> GetDashboardAsync(string userId, int page, int pageSize, CancellationToken ct)
    {
        // Use aggregation pipeline for efficient querying
        var pipelineStages = new List<BsonDocument>
        {
            // Stage 1: Match groups where user is a member
            new("$match", new BsonDocument("members.userId", userId)),
            
            // Stage 2: Add computed fields
            new("$addFields", new BsonDocument
            {
                { "memberCount", new BsonDocument("$size", "$members") },
                { "myRole", new BsonDocument("$let", new BsonDocument
                    {
                        { "vars", new BsonDocument
                            {
                                { "member", new BsonDocument("$arrayElemAt", new BsonArray
                                    {
                                        new BsonDocument("$filter", new BsonDocument
                                        {
                                            { "input", "$members" },
                                            { "as", "m" },
                                            { "cond", new BsonDocument("$eq", new BsonArray { "$$m.userId", userId }) }
                                        }),
                                        0
                                    })
                                }
                            }
                        },
                        { "in", "$$member.role" }
                    })
                }
            }),
            
            // Stage 3: Sort by last activity (most recent first)
            new("$sort", new BsonDocument("lastActivity", -1)),
            
            // Stage 4: Get total count before pagination
            new("$facet", new BsonDocument
            {
                { "metadata", new BsonArray { new BsonDocument("$count", "total") } },
                { "data", new BsonArray
                    {
                        new BsonDocument("$skip", Math.Max(0, (page - 1) * pageSize)),
                        new BsonDocument("$limit", pageSize)
                    }
                }
            }),
            
            // Stage 5: Unwind metadata
            new("$project", new BsonDocument
            {
                { "total", new BsonDocument("$arrayElemAt", new BsonArray { "$metadata.total", 0 }) },
                { "data", 1 }
            })
        };

        var pipeline = PipelineDefinition<Group, BsonDocument>.Create(pipelineStages);
        var results = await _groupsCollection.Aggregate(pipeline).FirstOrDefaultAsync(ct);
        
        if (results == null || !results.Contains("data") || results["data"].IsBsonNull)
        {
            return new DashboardResponse
            {
                Groups = new List<GroupCardDto>(),
                Total = 0,
                CurrentPage = page,
                PageSize = pageSize,
                HasMore = false
            };
        }

        var total = results.Contains("total") && !results["total"].IsBsonNull ? results["total"].ToInt64() : 0;
        var groupDocs = results["data"].AsBsonArray;

        // Collect user IDs for hydration
        var userIds = new HashSet<string>();
        var groupsData = new List<(Group group, List<GroupMember> admins, List<GroupMember> recentMembers, string myRole)>();

        foreach (var doc in groupDocs)
        {
            var docObj = doc.AsBsonDocument;
            var group = BsonSerializer.Deserialize<Group>(docObj);
            var myRole = docObj.Contains("myRole") && !docObj["myRole"].IsBsonNull ? docObj["myRole"].AsString : "Member";

            var admins = group.Members
                .Where(m => m.Role == GroupRole.Admin)
                .OrderBy(m => m.JoinedAt)
                .Take(3)
                .ToList();

            var recentMembers = group.Members
                .Where(m => m.Role != GroupRole.Admin)
                .OrderByDescending(m => m.JoinedAt)
                .Take(7)
                .ToList();

            foreach (var m in admins) userIds.Add(m.UserId);
            foreach (var m in recentMembers) userIds.Add(m.UserId);

            groupsData.Add((group, admins, recentMembers, myRole ?? "Member"));
        }

        // Hydrate user info in a single batch query
        var users = userIds.Count > 0
            ? await userRepository.GetByIdsAsync(userIds.ToList(), ct)
            : new List<User>();

        var byId = users.ToDictionary(u => u.Id, u => u);

        // Build response DTOs
        var groupsDto = new List<GroupCardDto>();
        foreach (var (group, admins, recentMembers, myRole) in groupsData)
        {
            var adminsDto = admins.Select(m => new MemberSummaryDto
            {
                UserId = m.UserId,
                FirstName = byId.TryGetValue(m.UserId, out var u1) ? u1.FirstName : string.Empty,
                LastName = byId.TryGetValue(m.UserId, out var u2) ? u2.LastName : string.Empty,
                AvatarUrl = byId.TryGetValue(m.UserId, out var u3) ? u3.ProfilePhotoUrl : null,
                Role = "Admin",
                JoinedAt = m.JoinedAt
            }).ToList();

            var membersDto = recentMembers.Select(m => new MemberSummaryDto
            {
                UserId = m.UserId,
                FirstName = byId.TryGetValue(m.UserId, out var u1) ? u1.FirstName : string.Empty,
                LastName = byId.TryGetValue(m.UserId, out var u2) ? u2.LastName : string.Empty,
                AvatarUrl = byId.TryGetValue(m.UserId, out var u3) ? u3.ProfilePhotoUrl : null,
                Role = "Member",
                JoinedAt = m.JoinedAt
            }).ToList();

            groupsDto.Add(new GroupCardDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                MemberCount = group.Members.Count,
                TaskCount = group.TaskCount,
                LastActivity = group.LastActivity,
                Admins = adminsDto,
                RecentMembers = membersDto,
                MyRole = myRole
            });
        }

        var skip = Math.Max(0, (page - 1) * pageSize);
        return new DashboardResponse
        {
            Groups = groupsDto,
            Total = total,
            CurrentPage = page,
            PageSize = pageSize,
            HasMore = skip + groupsDto.Count < total
        };
    }
}
