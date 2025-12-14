using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Auth.Models;
using TasksTracker.Api.Features.Auth.Services;

namespace TasksTracker.Api.Features.Auth.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService authService,
    ILogger<AuthController> logger) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly ILogger<AuthController> _logger = logger;

    /// <summary>
    /// Register a new user account
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email) || 
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FirstName) ||
            string.IsNullOrWhiteSpace(request.LastName))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Email, password, first name, and last name are required"));
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Password must be at least 8 characters"));
        }

        if (!IsValidEmail(request.Email))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Invalid email format"));
        }

        try
        {
            var response = await _authService.RegisterAsync(request);
            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            
            return CreatedAtAction(
                nameof(Register), 
                ApiResponse<AuthResponse>.SuccessResponse(response));
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Email already exists"))
        {
            return Conflict(ApiResponse<object>.ErrorResponse(
                "EMAIL_EXISTS", 
                "Email already exists"));
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Email and password are required"));
        }

        try
        {
            var response = await _authService.LoginAsync(request);
            _logger.LogInformation("User logged in successfully: {Email}", request.Email);
            
            return Ok(ApiResponse<AuthResponse>.SuccessResponse(response));
        }
        catch (UnauthorizedAccessException ex) when (ex.Message.Contains("Account locked"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, 
                ApiResponse<object>.ErrorResponse("ACCOUNT_LOCKED", ex.Message));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "INVALID_CREDENTIALS", 
                "Invalid email or password"));
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Refresh token is required"));
        }

        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            _logger.LogInformation("Token refreshed successfully");
            
            return Ok(ApiResponse<AuthResponse>.SuccessResponse(response));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "INVALID_REFRESH_TOKEN", 
                ex.Message));
        }
    }

    /// <summary>
    /// Logout and invalidate refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(
                "UNAUTHORIZED", 
                "User not authenticated"));
        }

        try
        {
            await _authService.LogoutAsync(userId);
            _logger.LogInformation("User logged out successfully: {UserId}", userId);
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Logged out successfully" }));
        }
        catch (InvalidOperationException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "USER_NOT_FOUND", 
                "User not found"));
        }
    }

    /// <summary>
    /// Verify email address
    /// </summary>
    [HttpGet("verify-email")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Verification token is required"));
        }

        var isVerified = await _authService.VerifyEmailAsync(token);
        
        if (!isVerified)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVALID_TOKEN", 
                "Invalid or expired verification token"));
        }

        _logger.LogInformation("Email verified successfully");
        return Ok(ApiResponse<object>.SuccessResponse(new { message = "Email verified successfully" }));
    }

    /// <summary>
    /// Request password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Email is required"));
        }

        await _authService.ForgotPasswordAsync(request.Email);
        
        // Always return success (don't reveal if email exists)
        return Ok(ApiResponse<object>.SuccessResponse(new 
        { 
            message = "If your email exists in our system, you will receive a password reset link" 
        }));
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Token and new password are required"));
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR", 
                "Password must be at least 8 characters"));
        }

        try
        {
            await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            _logger.LogInformation("Password reset successfully");
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Password reset successfully" }));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVALID_TOKEN", 
                ex.Message));
        }
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
