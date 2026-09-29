using JpGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JpGym.Infrastructure.Persistence;

public class JpGymDbContext : DbContext
{
    public JpGymDbContext(DbContextOptions<JpGymDbContext> options)
        : base(options)
    {
    }

    public DbSet<Miembro> Miembros => Set<Miembro>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Miembro>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.Property(m => m.CodigoBarras)
                .HasMaxLength(30)
                .IsRequired();

            entity.HasIndex(m => m.CodigoBarras)
                .IsUnique();

            entity.Property(m => m.NombreCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(m => m.Telefono)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(m => m.NumeroDocumento)
                .HasMaxLength(30)
                .IsRequired();

            entity.ToTable(t => t.HasCheckConstraint(
                "CK_Miembros_Edad",
                "[EdadAlRegistrarse] BETWEEN 0 AND 120"));
        });
    }
}
