using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ApiService.Models.DTOs;
using ApiService.Services;
using ApiService.Models;
using ApiService.Models.Enums;

namespace ApiService.Controllers
{
    [ApiController]
    [Route("api")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IUserService userService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(new ApiResponseDto<LoginResponseDto>
                {
                    Success = true,
                    Data = response
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new ApiResponseDto<LoginResponseDto>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed");
                return BadRequest(new ApiResponseDto<LoginResponseDto>
                {
                    Success = false,
                    Message = "登入失敗"
                });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponseDto<CreateUserRequestDto>>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                await _userService.CreateUserAsync(new CreateUserRequestDto
                {
                    Account = request.Account,
                    Email = request.Email,
                    Password = request.Password,
                    Role = UserRole.Staff,
                    Status = UserStatus.Pending
                });

                return Ok(new ApiResponseDto<object>
                {
                    Success = true,
                    Message = "註冊成功，請等待管理員審核"
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed");
                return BadRequest(new ApiResponseDto<object>
                {
                    Success = false,
                    Message = "註冊失敗"
                });
            }
        }
    }
}
