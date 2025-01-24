using ApiService.Models.DTOs;
using ApiService.Repositories;

namespace ApiService.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }

    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly PasswordHasher _passwordHasher;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IAuthRepository authRepository,
            PasswordHasher passwordHasher,
            JwtService jwtService,
            ILogger<AuthService> logger)
        {
            _authRepository = authRepository;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _authRepository.GetUserByAccountAsync(request.Account);
            if (user == null)
            {
                throw new UnauthorizedAccessException("帳號或密碼錯誤");
            }

            if (user.Status == Models.Enums.UserStatus.Pending)
            {
                throw new UnauthorizedAccessException("此帳號尚在審核中，請等待管理員審核");
            }

            if (!_passwordHasher.VerifyPassword(request.Password, user.Password, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("帳號或密碼錯誤");
            }

            var token = _jwtService.GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Name = user.Name,
                Role = user.Role,
                TokenExpiration = DateTime.UtcNow.AddHours(24) // 假設token有效期為24小時
            };
        }
    }
}
