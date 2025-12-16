using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using TasksTracker.Api.Core.Interfaces;

namespace TasksTracker.Api.Core.Attributes;

/// <summary>
/// Authorization filter that ensures the user is an admin of the specified group.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public class RequireGroupAdminAttribute : TypeFilterAttribute
{
    public RequireGroupAdminAttribute(string groupIdParam = "id") 
        : base(typeof(GroupAdminAuthorizationFilter))
    {
        Arguments = new object[] { groupIdParam };
    }
}

internal class GroupAdminAuthorizationFilter(
    IGroupRepository groupRepository,
    string groupIdParam,
    ILogger<GroupAdminAuthorizationFilter> logger) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Extract user ID from claims
        var userId = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                error = "UNAUTHORIZED",
                message = "User not authenticated"
            });
            return;
        }

        // Extract group ID from route parameters
        if (!context.ActionArguments.TryGetValue(groupIdParam, out var groupIdObj) 
            || groupIdObj is not string groupId 
            || string.IsNullOrEmpty(groupId))
        {
            context.Result = new BadRequestObjectResult(new
            {
                error = "INVALID_REQUEST",
                message = "Group ID not provided"
            });
            return;
        }

        // Check if user is an admin of the group
        var group = await groupRepository.GetByIdAsync(groupId);
        if (group == null)
        {
            context.Result = new NotFoundObjectResult(new
            {
                error = "GROUP_NOT_FOUND",
                message = $"Group {groupId} not found"
            });
            return;
        }

        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            logger.LogWarning("User {UserId} attempted to access group {GroupId} without membership", userId, groupId);
            context.Result = new ObjectResult(new
            {
                error = "NOT_MEMBER",
                message = "You are not a member of this group"
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        if (member.Role != "Admin")
        {
            logger.LogWarning("User {UserId} attempted admin action on group {GroupId} without admin role", userId, groupId);
            context.Result = new ObjectResult(new
            {
                error = "NOT_ADMIN",
                message = "Only group admins can perform this action"
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        // Store group and member info in HttpContext.Items for use in the controller
        context.HttpContext.Items["Group"] = group;
        context.HttpContext.Items["UserId"] = userId;
        context.HttpContext.Items["IsAdmin"] = true;

        await next();
    }
}
