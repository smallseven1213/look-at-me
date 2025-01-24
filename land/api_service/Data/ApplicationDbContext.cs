using Microsoft.EntityFrameworkCore;
using ApiService.Models;

namespace ApiService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Bulletin> Bulletins { get; set; }
        public DbSet<Land> Lands { get; set; }
        public DbSet<LandHistory> LandHistories { get; set; }
        public DbSet<LandOwnership> LandOwnerships { get; set; }
        public DbSet<Case> Cases { get; set; }
        public DbSet<CaseHistory> CaseHistories { get; set; }
        public DbSet<CaseMember> CaseMembers { get; set; } = null!;
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<ApprovalParticipant> ApprovalParticipants { get; set; } = null!;
        public DbSet<Log> Logs { get; set; }
        public DbSet<ImportHistory> ImportHistories { get; set; }
        public DbSet<LandCrawl> LandCrawls { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 設置表名為小寫（PostgreSQL慣例）
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetTableName(entity.GetTableName()?.ToLower());
            }
        }
    }
}
