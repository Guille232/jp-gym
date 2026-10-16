using JpGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using JpGym.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using JpGym.Domain.Enums;

namespace JpGym.Infrastructure.Persistence;

public class JpGymDbContext : IdentityDbContext<UsuarioAplicacion>
{
    public JpGymDbContext(DbContextOptions<JpGymDbContext> options)
        : base(options)
    {
    }

    public DbSet<Miembro> Miembros => Set<Miembro>();
    public DbSet<PlanMembresia> PlanesMembresia =>
    Set<PlanMembresia>();

    public DbSet<Membresia> Membresias => Set<Membresia>();

    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<EntradaDiaria> EntradasDiarias
    => Set<EntradaDiaria>();
    public DbSet<Asistencia> Asistencias => Set<Asistencia>();

    public DbSet<Gasto> Gastos => Set<Gasto>();

    public DbSet<ComprobanteMembresia> ComprobantesMembresia
    => Set<ComprobanteMembresia>();

    public DbSet<Entrenador> Entrenadores => Set<Entrenador>();

    public DbSet<ClaseGym> ClasesGym => Set<ClaseGym>();

    public DbSet<CorteDiario> CortesDiarios => Set<CorteDiario>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Numeración automática para los códigos de miembros.
        // Iniciamos en 1 únicamente para desarrollo.
        modelBuilder.HasSequence<long>("NumeroMiembro", "dbo")
            .StartsAt(1)
            .IncrementsBy(1);

        modelBuilder.Entity<UsuarioAplicacion>(entity =>
        {
            entity.Property(usuario => usuario.NombreCompleto)
                .HasMaxLength(150)
                .IsRequired();
        });

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
                .IsRequired(false);

            entity.Property(miembro => miembro.Direccion)
                .HasMaxLength(250)
                .IsRequired(false);

            entity.ToTable(t => t.HasCheckConstraint(
                "CK_Miembros_Edad",
                "[EdadAlRegistrarse] BETWEEN 0 AND 120"));

            entity.Property(miembro => miembro.IdSistemaAnterior)
                .HasMaxLength(50)
                .IsRequired(false);

            entity.HasIndex(miembro => miembro.IdSistemaAnterior)
                .IsUnique()
                .HasFilter("[IdSistemaAnterior] IS NOT NULL");

            entity.Property(miembro => miembro.Email)
                .HasMaxLength(254)
                .IsRequired(false);

            entity.Property(miembro => miembro.Notas)
                .HasMaxLength(1000)
                .IsRequired(false);
        });

        modelBuilder.Entity<PlanMembresia>(entity =>
        {
            entity.ToTable("PlanesMembresia", tabla =>
            {
                tabla.HasCheckConstraint(
                    "CK_PlanesMembresia_Precio",
                    "[Precio] > 0");

                tabla.HasCheckConstraint(
                    "CK_PlanesMembresia_Duracion",
                    "[Duracion] > 0");

                tabla.HasCheckConstraint(
                    "CK_PlanesMembresia_UnidadDuracion",
                    "[UnidadDuracion] IN (1, 2)");
            });

            entity.HasKey(plan => plan.Id);

            entity.Property(plan => plan.Nombre)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(plan => plan.Precio)
                .HasPrecision(18, 2);

            entity.Property(plan => plan.UnidadDuracion)
                .HasConversion<int>();
        });

        modelBuilder.Entity<Membresia>(entity =>
        {
            entity.ToTable("Membresias", table =>
            {
                table.HasCheckConstraint(
                    "CK_Membresias_PrecioContratado",
                    "[PrecioContratado] > 0");

                table.HasCheckConstraint(
                    "CK_Membresias_DuracionContratada",
                    "[DuracionContratada] > 0");

                table.HasCheckConstraint(
                    "CK_Membresias_UnidadDuracion",
                    "[UnidadDuracionContratada] IN (1, 2)");

                table.HasCheckConstraint(
                    "CK_Membresias_Fechas",
                    "[FechaFinExclusiva] > [FechaInicio]");

                table.HasCheckConstraint(
                   "CK_Membresias_Origen",
                   "[Origen] IN (1, 2)");

            });


            entity.Property(membresia => membresia.PrecioOriginalPlan)
    .HasPrecision(18, 2);

            entity.Property(membresia => membresia.MotivoCambioPrecio)
                .HasMaxLength(250);

            entity.HasKey(membresia => membresia.Id);

            entity.Property(membresia => membresia.NombrePlan)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(membresia => membresia.PrecioContratado)
                .HasPrecision(18, 2);

            entity.Property(membresia => membresia.UnidadDuracionContratada)
                .HasConversion<int>();

            entity.Property(membresia => membresia.FechaInicio)
                .HasColumnType("date");

            entity.Property(membresia => membresia.FechaFinExclusiva)
                .HasColumnType("date");

            entity.HasIndex(membresia => new
            {
                membresia.MiembroId,
                membresia.FechaFinExclusiva
            });

            entity.HasOne(membresia => membresia.Miembro)
                .WithMany()
                .HasForeignKey(membresia => membresia.MiembroId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(membresia => membresia.PlanMembresia)
                .WithMany()
                .HasForeignKey(membresia => membresia.PlanMembresiaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(membresia => membresia.Origen)
                    .HasConversion<int>()
                    .HasDefaultValue(JpGym.Domain.Enums.OrigenMembresia.Sistema);

        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.ToTable("Pagos", table =>
            {
                table.HasCheckConstraint(
                    "CK_Pagos_Monto",
                    "[Monto] > 0");

                table.HasCheckConstraint(
                    "CK_Pagos_Metodo",
                    "[Metodo] IN (1, 2, 3)");
            });

            entity.HasKey(pago => pago.Id);

            entity.Property(pago => pago.Monto)
                .HasPrecision(18, 2);

            entity.Property(pago => pago.Metodo)
                .HasConversion<int>();

            entity.Property(pago => pago.RegistradoPorUsuarioId)
                .HasMaxLength(450)
                .IsRequired();

            entity.HasOne(pago => pago.Membresia)
                .WithOne(membresia => membresia.Pago)
                .HasForeignKey<Pago>(pago => pago.MembresiaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<UsuarioAplicacion>()
                .WithMany()
                .HasForeignKey(pago => pago.RegistradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(pago => pago.FechaRegistro);
        });

        modelBuilder.Entity<EntradaDiaria>(entity =>
        {
            entity.ToTable("EntradasDiarias", table =>
            {
                table.HasCheckConstraint(
                    "CK_EntradasDiarias_Monto",
                    "[Monto] > 0");

                table.HasCheckConstraint(
                    "CK_EntradasDiarias_Metodo",
                    "[Metodo] IN (1, 2, 3)");
            });

            entity.HasKey(entrada => entrada.Id);

            entity.Property(entrada => entrada.Monto)
                .HasPrecision(18, 2);

            entity.Property(entrada => entrada.Metodo)
                .HasConversion<int>();

            entity.Property(entrada => entrada.FechaOperacion)
                .HasColumnType("date");

            entity.Property(entrada => entrada.RegistradoPorUsuarioId)
                .HasMaxLength(450)
                .IsRequired();

            entity.Property(entrada => entrada.Observacion)
                .HasMaxLength(250);

            entity.HasOne<UsuarioAplicacion>()
                .WithMany()
                .HasForeignKey(entrada => entrada.RegistradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(entrada => new
            {
                entrada.FechaOperacion,
                entrada.Metodo
            });
        });

        modelBuilder.Entity<Asistencia>(entity =>
        {
            entity.ToTable("Asistencias");

            entity.HasKey(asistencia => asistencia.Id);

            entity.Property(asistencia => asistencia.FechaOperacion)
                .HasColumnType("date");

            entity.Property(asistencia => asistencia.RegistradoPorUsuarioId)
                .HasMaxLength(450)
                .IsRequired();

            entity.HasOne(asistencia => asistencia.Miembro)
                .WithMany()
                .HasForeignKey(asistencia => asistencia.MiembroId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(asistencia => asistencia.Membresia)
                .WithMany()
                .HasForeignKey(asistencia => asistencia.MembresiaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<UsuarioAplicacion>()
                .WithMany()
                .HasForeignKey(asistencia => asistencia.RegistradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(asistencia => new
            {
                asistencia.MiembroId,
                asistencia.FechaOperacion
            });

            entity.HasIndex(asistencia => new
            {
                asistencia.FechaOperacion,
                asistencia.FechaRegistro
            });
        });

        modelBuilder.Entity<Gasto>(entity =>
        {
            entity.ToTable("Gastos", table =>
            {
                table.HasCheckConstraint(
                    "CK_Gastos_Monto",
                    "[Monto] > 0");

                table.HasCheckConstraint(
                    "CK_Gastos_Metodo",
                    "[Metodo] IN (1, 2, 3)");

                table.HasCheckConstraint(
                    "CK_Gastos_SaleDeCaja",
                    "[SaleDeCaja] = 0 OR [Metodo] = 1");
            });

            entity.HasKey(gasto => gasto.Id);

            entity.Property(gasto => gasto.Concepto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(gasto => gasto.Monto)
                .HasPrecision(18, 2);

            entity.Property(gasto => gasto.Metodo)
                .HasConversion<int>();

            entity.Property(gasto => gasto.FechaOperacion)
                .HasColumnType("date");

            entity.Property(gasto => gasto.RegistradoPorUsuarioId)
                .HasMaxLength(450)
                .IsRequired();

            entity.Property(gasto => gasto.Observacion)
                .HasMaxLength(250);

            entity.HasOne<UsuarioAplicacion>()
                .WithMany()
                .HasForeignKey(gasto => gasto.RegistradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(gasto => new
            {
                gasto.FechaOperacion,
                gasto.Metodo
            });
        });


        modelBuilder.Entity<ComprobanteMembresia>(entity =>
        {
            entity.ToTable("ComprobantesMembresia", table =>
            {
                table.HasCheckConstraint(
                    "CK_ComprobantesMembresia_Monto",
                    "[MontoPagado] > 0");

                table.HasCheckConstraint(
                    "CK_ComprobantesMembresia_Metodo",
                    "[Metodo] IN (1, 2, 3)");

                table.HasCheckConstraint(
                    "CK_ComprobantesMembresia_Fechas",
                    "[FechaFinExclusiva] > [FechaInicio]");
            });

            entity.HasKey(comprobante => comprobante.Id);

            entity.Property(comprobante => comprobante.Numero)
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(comprobante => comprobante.Numero)
                .IsUnique();

            entity.Property(comprobante => comprobante.NombreGym)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(comprobante => comprobante.NombreMiembro)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(comprobante => comprobante.CodigoMiembro)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(comprobante => comprobante.NombrePlan)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(comprobante => comprobante.NombreUsuarioCobro)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(comprobante => comprobante.FechaInicio)
                .HasColumnType("date");

            entity.Property(comprobante => comprobante.FechaFinExclusiva)
                .HasColumnType("date");

            entity.Property(comprobante => comprobante.MontoPagado)
                .HasPrecision(18, 2);

            entity.Property(comprobante => comprobante.Metodo)
                .HasConversion<int>();

            entity.HasOne(comprobante => comprobante.Pago)
                .WithOne()
                .HasForeignKey<ComprobanteMembresia>(
                    comprobante => comprobante.PagoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CorteDiario>(entity =>
        {
            entity.ToTable("CortesDiarios", tabla =>
            {
                tabla.HasCheckConstraint(
                    "CK_CortesDiarios_Montos",
                    "[FondoInicial] >= 0 "
                    + "AND [IngresosMembresias] >= 0 "
                    + "AND [IngresosEntradasDiarias] >= 0 "
                    + "AND [CobrosEfectivo] >= 0 "
                    + "AND [CobrosTarjeta] >= 0 "
                    + "AND [CobrosTransferencia] >= 0 "
                    + "AND [GastosEfectivo] >= 0 "
                    + "AND [GastosTarjeta] >= 0 "
                    + "AND [GastosTransferencia] >= 0 "
                    + "AND [SalidasDeCaja] >= 0 "
                    + "AND [EfectivoContado] >= 0");

                tabla.HasCheckConstraint(
                    "CK_CortesDiarios_Salidas",
                    "[SalidasDeCaja] <= [GastosEfectivo]");

                tabla.HasCheckConstraint(
                    "CK_CortesDiarios_EfectivoEsperado",
                    "[EfectivoEsperado] = "
                    + "[FondoInicial] + [CobrosEfectivo] - [SalidasDeCaja]");

                tabla.HasCheckConstraint(
                    "CK_CortesDiarios_Diferencia",
                    "[Diferencia] = [EfectivoContado] - [EfectivoEsperado]");
            });

            entity.HasKey(corte => corte.Id);

            entity.Property(corte => corte.FechaOperacion)
                .HasColumnType("date");

            entity.HasIndex(corte => corte.FechaOperacion)
                .IsUnique();

            entity.Property(corte => corte.FondoInicial)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.IngresosMembresias)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.IngresosEntradasDiarias)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.CobrosEfectivo)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.CobrosTarjeta)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.CobrosTransferencia)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.GastosEfectivo)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.GastosTarjeta)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.GastosTransferencia)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.SalidasDeCaja)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.EfectivoEsperado)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.EfectivoContado)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.Diferencia)
                .HasPrecision(18, 2);

            entity.Property(corte => corte.CerradoPorUsuarioId)
                .HasMaxLength(450)
                .IsRequired();

            entity.Property(corte => corte.Observacion)
                .HasMaxLength(1000)
                .IsRequired(false);

            entity.HasOne<UsuarioAplicacion>()
                .WithMany()
                .HasForeignKey(corte => corte.CerradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });



        modelBuilder.Entity<Entrenador>(entity =>
        {
            entity.ToTable("Entrenadores");

            entity.HasKey(entrenador => entrenador.Id);

            entity.Property(entrenador => entrenador.NombreCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(entrenador => entrenador.Telefono)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(entrenador => entrenador.Especialidad)
                .HasMaxLength(150)
                .IsRequired();

            entity.HasIndex(entrenador => entrenador.NombreCompleto);
        });

        modelBuilder.Entity<ClaseGym>(entity =>
        {
            entity.ToTable("ClasesGym", tabla =>
            {
                tabla.HasCheckConstraint(
                    "CK_ClasesGym_Cupo",
                    "[Cupo] > 0");

                tabla.HasCheckConstraint(
                    "CK_ClasesGym_DiaSemana",
                    "[DiaSemana] BETWEEN 0 AND 6");
            });

            entity.HasKey(clase => clase.Id);

            entity.Property(clase => clase.Nombre)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(clase => clase.DiaSemana)
                .HasConversion<int>();

            entity.Property(clase => clase.HoraInicio)
                .HasColumnType("time");

            entity.HasOne(clase => clase.Entrenador)
                .WithMany()
                .HasForeignKey(clase => clase.EntrenadorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(clase => new
            {
                clase.DiaSemana,
                clase.HoraInicio
            });
        });
    }



}
