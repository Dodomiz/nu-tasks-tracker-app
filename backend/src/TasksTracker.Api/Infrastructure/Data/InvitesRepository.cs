using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;

namespace TasksTracker.Api.Infrastructure.Data;

public class InvitesRepository : IInvitesRepository
{
    private readonly IMongoCollection<Invite> _invites;
    private readonly ILogger<InvitesRepository> _logger;

    public InvitesRepository(
        IOptions<MongoDbSettings> mongoSettings,
        ILogger<InvitesRepository> logger)
    {
        var client = new MongoClient(mongoSettings.Value.ConnectionString);
        var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
        _invites = database.GetCollection<Invite>("invites");
        _logger = logger;

        // Ensure indexes are created
        CreateIndexes().GetAwaiter().GetResult();
    }

    private async Task CreateIndexes()
    {
        try
        {
            // Compound index for listing and filtering: { groupId: 1, status: 1, invitedAt: -1 }
            var compoundIndexKeys = Builders<Invite>.IndexKeys
                .Ascending(i => i.GroupId)
                .Ascending(i => i.Status)
                .Descending(i => i.InvitedAt);
            var compoundIndexModel = new CreateIndexModel<Invite>(compoundIndexKeys);

            // Unique partial index for preventing duplicate pending invites: { email: 1, groupId: 1 }
            var uniqueIndexKeys = Builders<Invite>.IndexKeys
                .Ascending(i => i.Email)
                .Ascending(i => i.GroupId);
            var uniqueIndexOptions = new CreateIndexOptions<Invite>
            {
                Unique = true,
                PartialFilterExpression = Builders<Invite>.Filter.Eq(i => i.Status, InviteStatus.Pending)
            };
            var uniqueIndexModel = new CreateIndexModel<Invite>(uniqueIndexKeys, uniqueIndexOptions);

            // Token index for join validation: { token: 1 }
            var tokenIndexKeys = Builders<Invite>.IndexKeys.Ascending(i => i.Token);
            var tokenIndexModel = new CreateIndexModel<Invite>(tokenIndexKeys);

            await _invites.Indexes.CreateManyAsync(new[]
            {
                compoundIndexModel,
                uniqueIndexModel,
                tokenIndexModel
            });

            _logger.LogInformation("Invites collection indexes created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error creating invites indexes (may already exist)");
        }
    }

    public async Task<Invite> CreateAsync(Invite invite)
    {
        try
        {
            await _invites.InsertOneAsync(invite);
            _logger.LogInformation("Invite {InviteId} created for group {GroupId}", invite.Id, invite.GroupId);
            return invite;
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            _logger.LogWarning("Duplicate pending invite for email {Email} in group {GroupId}", invite.Email, invite.GroupId);
            throw new InvalidOperationException($"A pending invite for {invite.Email} already exists in this group");
        }
    }

    public async Task<Invite?> GetByIdAsync(string id)
    {
        return await _invites.Find(i => i.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Invite?> GetByTokenAsync(string token)
    {
        return await _invites.Find(i => i.Token == token).FirstOrDefaultAsync();
    }

    public async Task<List<Invite>> GetByGroupIdAsync(string groupId, InviteStatus? status = null)
    {
        var filter = Builders<Invite>.Filter.Eq(i => i.GroupId, groupId);

        if (status.HasValue)
        {
            filter &= Builders<Invite>.Filter.Eq(i => i.Status, status.Value);
        }

        return await _invites.Find(filter)
            .SortByDescending(i => i.InvitedAt)
            .ToListAsync();
    }

    public async Task<Invite?> GetPendingInviteAsync(string groupId, string email)
    {
        var filter = Builders<Invite>.Filter.And(
            Builders<Invite>.Filter.Eq(i => i.GroupId, groupId),
            Builders<Invite>.Filter.Eq(i => i.Email, email),
            Builders<Invite>.Filter.Eq(i => i.Status, InviteStatus.Pending)
        );

        return await _invites.Find(filter).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(string id, Invite invite)
    {
        invite.Id = id;
        await _invites.ReplaceOneAsync(i => i.Id == id, invite);
        _logger.LogInformation("Invite {InviteId} updated", id);
    }

    public async Task DeleteAsync(string id)
    {
        await _invites.DeleteOneAsync(i => i.Id == id);
        _logger.LogInformation("Invite {InviteId} deleted", id);
    }
}
