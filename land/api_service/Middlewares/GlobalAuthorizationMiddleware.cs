using ApiService.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace ApiService.Middlewares
{
    public class GlobalAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalAuthorizationMiddleware> _logger;

        public GlobalAuthorizationMiddleware(RequestDelegate next, ILogger<GlobalAuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            _logger.LogInformation($"Processing request for path: {context.Request.Path}");

            if (endpoint == null)
            {
                _logger.LogWarning("No endpoint found for request");
                await _next(context);
                return;
            }

            var allowAnonymous = endpoint.Metadata?.GetMetadata<IAllowAnonymous>();
            _logger.LogInformation($"AllowAnonymous attribute: {(allowAnonymous != null ? "Present" : "Not present")}");

            if (allowAnonymous != null)
            {
                _logger.LogInformation("Allowing anonymous access");
                await _next(context);
                return;
            }

            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                _logger.LogWarning("User is not authenticated");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "請先登入系統"
                });
                return;
            }

            await _next(context);
        }
    }

    public static class GlobalAuthorizationMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalAuthorization(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<GlobalAuthorizationMiddleware>();
        }
    }
}
