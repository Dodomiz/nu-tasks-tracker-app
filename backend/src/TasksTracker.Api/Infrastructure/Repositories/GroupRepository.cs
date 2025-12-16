using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class GroupRepository(MongoDbContext context) : BaseRepository<Group>(context, "groups"), IGroupRepository
{
    public async Task<Group?> GetByInvitationCodeAsync(string invitationCode)
    {
        var filter = Builders<Group>.Filter.Eq(g => g.InvitationCode, invitationCode);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<List<Group>> GetUserGroupsAsync(string userId)
    {
        var filter = Builders<Group>.Filter.ElemMatch(
            g => g.Members,
            m => m.UserId == userId
        );
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<List<GroupMember>> GetMembersAsync(string groupId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Group>.Filter.Eq(g => g.Id, groupId);
        var group = await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        return group?.Members ?? new List<GroupMember>();
    }

    public async Task<Group> UpdateAsync(Group group)
    {
        group.UpdatedAt = DateTime.UtcNow;
        var filter = Builders<Group>.Filter.Eq(g => g.Id, group.Id);
        await _collection.ReplaceOneAsync(filter, group);
        return group;
    }

    public async Task<bool> EnsureIndexesAsync()
    {
        try
        {
            // Unique index on invitation code
            var invitationCodeIndex = new CreateIndexModel<Group>(
                Builders<Group>.IndexKeys.Ascending(g => g.InvitationCode),
                new CreateIndexOptions { Unique = true }
            );

            // Multikey index on members.userId for efficient user group lookups
            var membersUserIdIndex = new CreateIndexModel<Group>(
                Builders<Group>.IndexKeys.Ascending("members.userId")
            );

            // Index on createdBy for creator queries
            var createdByIndex = new CreateIndexModel<Group>(
                Builders<Group>.IndexKeys.Ascending(g => g.CreatedBy)
            );

            await _collection.Indexes.CreateManyAsync(new[]
            {
                invitationCodeIndex,
                membersUserIdIndex,
                createdByIndex
            });

            return true;
        }
        catch
        {
            return false;
        }
    }
}
