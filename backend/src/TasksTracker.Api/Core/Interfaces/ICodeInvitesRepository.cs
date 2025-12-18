using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

/// <summary>
/// Repository interface for code-based invitations (FR-026)
/// </summary>
public interface ICodeInvitesRepository
{
    /// <summary>
    /// Creates a new code invitation
    /// </summary>
    Task<CodeInvite> CreateAsync(CodeInvite invite, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an invitation by its code (case-insensitive)
    /// </summary>
    Task<CodeInvite?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all invitations for a group, optionally filtered by status
    /// </summary>
    Task<List<CodeInvite>> GetByGroupIdAsync(string groupId, CodeInviteStatus? status = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing invitation
    /// </summary>
    Task<CodeInvite> UpdateAsync(CodeInvite invite, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a code already exists (for uniqueness validation)
    /// </summary>
    Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Ensures database indexes are created
    /// </summary>
    Task<bool> EnsureIndexesAsync();
}
