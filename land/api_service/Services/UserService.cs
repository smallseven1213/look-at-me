using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApiService.Models;
using ApiService.Models.DTOs;
using ApiService.Models.Enums;
using ApiService.Repositories;

namespace ApiService.Services
{
    public interface IUserService
    {
        Task<UserListResponseDto> GetUserListAsync(UserListRequestDto request);
        Task<UserDetailResponseDto> GetUserDetailAsync(int id);
        Task<UserDetailResponseDto> CreateUserAsync(CreateUserRequestDto request);
        Task<UserDetailResponseDto> UpdateUserAsync(int id, UpdateUserRequestDto request);
        Task<UserDetailResponseDto> UpdateUserPermissionsAsync(int id, UpdateUserPermissionsRequestDto request);
        Task<UserDetailResponseDto> UpdateUserStatusAsync(int id, UpdateUserStatusRequestDto request);
        Task<List<UserDetailResponseDto>> BatchUpdateUserStatusAsync(BatchUpdateStatusRequestDto request);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher _passwordHasher;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            PasswordHasher passwordHasher,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        public async Task<UserListResponseDto> GetUserListAsync(UserListRequestDto request)
        {
            var (users, totalCount) = await _userRepository.GetUsersAsync(
                request.SearchKeyword,
                request.RoleFilter,
                request.Page,
                request.PageSize
            );

            return new UserListResponseDto
            {
                Items = users.Select(u => new UserItemDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Account = u.Account,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }

        public async Task<UserDetailResponseDto> GetUserDetailAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"找不到ID為 {id} 的使用者");

            return MapToUserDetailResponse(user);
        }

        public async Task<UserDetailResponseDto> CreateUserAsync(CreateUserRequestDto request)
        {
            var existingUser = await _userRepository.GetUserByAccountAsync(request.Account);
            if (existingUser != null)
                throw new InvalidOperationException("此帳號已存在");

            var (hashedPassword, salt) = _passwordHasher.HashPassword(request.Password);

            var user = new User
            {
                Name = request.Account,
                Account = request.Account,
                Password = hashedPassword,
                PasswordSalt = salt,
                Role = request.Role,
                Status = UserStatus.Pending,
            };

            var createdUser = await _userRepository.CreateUserAsync(user);
            return MapToUserDetailResponse(createdUser);
        }

        public async Task<UserDetailResponseDto> UpdateUserAsync(int id, UpdateUserRequestDto request)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"找不到ID為 {id} 的使用者");

            user.Name = request.Name;
            user.Role = request.Role;

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                var (hashedPassword, salt) = _passwordHasher.HashPassword(request.NewPassword);
                user.Password = hashedPassword;
                user.PasswordSalt = salt;
            }

            var updatedUser = await _userRepository.UpdateUserAsync(user);
            return MapToUserDetailResponse(updatedUser);
        }

        public async Task<UserDetailResponseDto> UpdateUserPermissionsAsync(int id, UpdateUserPermissionsRequestDto request)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"找不到ID為 {id} 的使用者");

            var updatedUser = await _userRepository.UpdateUserAsync(user);
            return MapToUserDetailResponse(updatedUser);
        }

        public async Task<UserDetailResponseDto> UpdateUserStatusAsync(int id, UpdateUserStatusRequestDto request)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"找不到ID為 {id} 的使用者");

            user.Status = request.Status;
            user.StatusReason = request.StatusReason;
            user.StatusChangedAt = DateTime.UtcNow;

            var updatedUser = await _userRepository.UpdateUserAsync(user);
            return MapToUserDetailResponse(updatedUser);
        }

        public async Task<List<UserDetailResponseDto>> BatchUpdateUserStatusAsync(BatchUpdateStatusRequestDto request)
        {
            var users = await _userRepository.UpdateUsersStatusAsync(request.UserIds, request.Status, request.StatusReason);
            return users.Select(MapToUserDetailResponse).ToList();
        }

        private UserDetailResponseDto MapToUserDetailResponse(User user)
        {
            return new UserDetailResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Account = user.Account,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}
