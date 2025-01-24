using System;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace ApiService.Services
{
    public class PasswordHasher
    {
        private const int MemorySize = 65536; 
        private const int Iterations = 4;
        private const int Parallelism = 4;
        private const int HashLength = 32;

        public (string hash, string salt) HashPassword(string password)
        {
            byte[] salt = GenerateSalt();
            byte[] hash = HashPassword(password, salt);

            return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
        }

        public bool VerifyPassword(string password, string hash, string salt)
        {
            byte[] hashBytes = Convert.FromBase64String(hash);
            byte[] saltBytes = Convert.FromBase64String(salt);
            byte[] newHash = HashPassword(password, saltBytes);

            return hashBytes.SequenceEqual(newHash);
        }

        private byte[] GenerateSalt()
        {
            byte[] salt = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            return salt;
        }

        private byte[] HashPassword(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = Parallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            return argon2.GetBytes(HashLength);
        }
    }
}
