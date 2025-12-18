using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Infrastructure.Repositories;

/// <summary>
/// Repository for code-based invitations (FR-026)
/// </summary>
public class CodeInvitesRepository : BaseRepository<CodeInvite>, ICodeInvitesRepository
{
    private readonly ILogger<CodeInvitesRepository> _logger;

    public CodeInvitesRepository(
        MongoDbContext context,
        ILogger<CodeInvitesRepository> logger)
        : base(context, "codeInvites")
    {
        _logger = logger;
    }

    public async Task<CodeInvite> CreateAsync(CodeInvite invite, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(invite, cancellationToken: cancellationToken);
        return invite;
    }

    public async Task<CodeInvite?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        // Case-insensitive code search
        var filter = Builders<CodeInvite>.Filter.Regex(
            i => i.Code,
            new MongoDB.Bson.BsonRegularExpression($"^{code}$", "i"));

        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<CodeInvite>> GetByGroupIdAsync(
        string groupId,
        CodeInviteStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var filterBuilder = Builders<CodeInvite>.Filter;
        var filter = filterBuilder.Eq(i => i.GroupId, groupId);

        if (status.HasValue)
        {
            filter &= filterBuilder.Eq(i => i.Status, status.Value);
        }

        var sort = Builders<CodeInvite>.Sort.Descending(i => i.CreatedAt);
        return await _collection.Find(filter).Sort(sort).ToListAsync(cancellationToken);
    }

    public async Task<CodeInvite> UpdateAsync(CodeInvite invite, CancellationToken cancellationToken = default)
    {
        var filter = Builders<CodeInvite>.Filter.Eq(i => i.Id, invite.Id);
        await _collection.ReplaceOneAsync(filter, invite, cancellationToken: cancellationToken);
        return invite;
    }

    public async Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default)
    {
        // Case-insensitive code check
        var filter = Builders<CodeInvite>.Filter.Regex(
            i => i.Code,
            new MongoDB.Bson.BsonRegularExpression($"^{code}$", "i"));

        return await _collection.Find(filter).AnyAsync(cancellationToken);
    }

    public async Task<bool> EnsureIndexesAsync()
    {
        try
        {
            // Unique index on code (case-insensitive)
            var codeIndex = new CreateIndexModel<CodeInvite>(
                Builders<CodeInvite>.IndexKeys.Ascending(i => i.Code),
                new CreateIndexOptions { Unique = true });

            // Compound index for group queries with status filter
            var groupIdStatusIndex = new CreateIndexModel<CodeInvite>(
                Builders<CodeInvite>.IndexKeys
                    .Ascending(i => i.GroupId)
                    .Ascending(i => i.Status));

            // Index for sorted group queries
            var groupIdCreatedAtIndex = new CreateIndexModel<CodeInvite>(
                Builders<CodeInvite>.IndexKeys
                    .Ascending(i => i.GroupId)
                    .Descending(i => i.CreatedAt));

            await _collection.Indexes.CreateManyAsync(new[]
            {
                codeIndex,
                groupIdStatusIndex,
                groupIdCreatedAtIndex
            });

            _logger.LogInformation("Code invites collection indexes created successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create code invites indexes");
            return false;
        }
    }
}
