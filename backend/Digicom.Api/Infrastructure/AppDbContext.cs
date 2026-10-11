using Digicom.Api.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Digicom.Api.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<CommunicationEvent> CommunicationEvents => Set<CommunicationEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CommunicationEvent>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Direction).HasConversion<string>().HasMaxLength(20);

            entity.Property(e => e.Channel).HasConversion<string>().HasMaxLength(20);

            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

            entity.Property(e => e.CustomerId).HasMaxLength(50).IsRequired();

            entity.Property(e => e.Department).HasMaxLength(100).IsRequired();

            entity.Property(e => e.Agent).HasMaxLength(50).IsRequired();

            entity.Property(e => e.CallerNumber).HasMaxLength(30).IsRequired();

            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.Department);
            entity.HasIndex(e => e.Status);
        });
    }
}
