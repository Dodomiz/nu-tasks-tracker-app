using System.Security.Cryptography;

namespace TasksTracker.Api.Core.Services;

/// <summary>
/// Service for generating cryptographically secure invitation codes
/// </summary>
public class CodeGeneratorService
{
    private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int CodeLength = 8;

    /// <summary>
    /// Generates a random 8-character alphanumeric code
    /// </summary>
    /// <returns>Uppercase alphanumeric code (e.g., "A7B9C2XZ")</returns>
    public string GenerateCode()
    {
        var code = new char[CodeLength];
        var randomBytes = new byte[CodeLength];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        for (var i = 0; i < CodeLength; i++)
        {
            code[i] = Chars[randomBytes[i] % Chars.Length];
        }

        return new string(code);
    }
}
