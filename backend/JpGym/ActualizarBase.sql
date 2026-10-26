IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929184333_Inicial'
)
BEGIN
    CREATE TABLE [Miembros] (
        [Id] uniqueidentifier NOT NULL,
        [CodigoBarras] nvarchar(30) NOT NULL,
        [NombreCompleto] nvarchar(150) NOT NULL,
        [Telefono] nvarchar(30) NOT NULL,
        [NumeroDocumento] nvarchar(30) NOT NULL,
        [EdadAlRegistrarse] int NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        [Activo] bit NOT NULL,
        CONSTRAINT [PK_Miembros] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Miembros_Edad] CHECK ([EdadAlRegistrarse] BETWEEN 0 AND 120)
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929184333_Inicial'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Miembros_CodigoBarras] ON [Miembros] ([CodigoBarras]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929184333_Inicial'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260929184333_Inicial', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929194258_AgregarSecuenciaMiembros'
)
BEGIN
    CREATE SEQUENCE [dbo].[NumeroMiembro] START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE NO CYCLE;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929194258_AgregarSecuenciaMiembros'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260929194258_AgregarSecuenciaMiembros', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260930235912_DocumentoOpcionalMenores'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Miembros]') AND [c].[name] = N'NumeroDocumento');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Miembros] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [Miembros] ALTER COLUMN [NumeroDocumento] nvarchar(30) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260930235912_DocumentoOpcionalMenores'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260930235912_DocumentoOpcionalMenores', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001020250_AgregarPlanesMembresia'
)
BEGIN
    CREATE TABLE [PlanesMembresia] (
        [Id] uniqueidentifier NOT NULL,
        [Nombre] nvarchar(100) NOT NULL,
        [Precio] decimal(18,2) NOT NULL,
        [Duracion] int NOT NULL,
        [UnidadDuracion] int NOT NULL,
        [Activo] bit NOT NULL,
        [FechaCreacion] datetimeoffset NOT NULL,
        CONSTRAINT [PK_PlanesMembresia] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_PlanesMembresia_Duracion] CHECK ([Duracion] > 0),
        CONSTRAINT [CK_PlanesMembresia_Precio] CHECK ([Precio] > 0),
        CONSTRAINT [CK_PlanesMembresia_UnidadDuracion] CHECK ([UnidadDuracion] IN (1, 2))
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001020250_AgregarPlanesMembresia'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261001020250_AgregarPlanesMembresia', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [NombreCompleto] nvarchar(150) NOT NULL,
        [Activo] bit NOT NULL,
        [FechaCreacion] datetimeoffset NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001023401_AgregarIdentity'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261001023401_AgregarIdentity', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001230409_AgregarDireccionMiembro'
)
BEGIN
    ALTER TABLE [Miembros] ADD [Direccion] nvarchar(250) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001230409_AgregarDireccionMiembro'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261001230409_AgregarDireccionMiembro', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE TABLE [Membresias] (
        [Id] uniqueidentifier NOT NULL,
        [MiembroId] uniqueidentifier NOT NULL,
        [PlanMembresiaId] uniqueidentifier NOT NULL,
        [NombrePlan] nvarchar(100) NOT NULL,
        [PrecioContratado] decimal(18,2) NOT NULL,
        [DuracionContratada] int NOT NULL,
        [UnidadDuracionContratada] int NOT NULL,
        [FechaInicio] date NOT NULL,
        [FechaFinExclusiva] date NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Membresias] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Membresias_DuracionContratada] CHECK ([DuracionContratada] > 0),
        CONSTRAINT [CK_Membresias_Fechas] CHECK ([FechaFinExclusiva] > [FechaInicio]),
        CONSTRAINT [CK_Membresias_PrecioContratado] CHECK ([PrecioContratado] > 0),
        CONSTRAINT [CK_Membresias_UnidadDuracion] CHECK ([UnidadDuracionContratada] IN (1, 2)),
        CONSTRAINT [FK_Membresias_Miembros_MiembroId] FOREIGN KEY ([MiembroId]) REFERENCES [Miembros] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Membresias_PlanesMembresia_PlanMembresiaId] FOREIGN KEY ([PlanMembresiaId]) REFERENCES [PlanesMembresia] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE TABLE [Pagos] (
        [Id] uniqueidentifier NOT NULL,
        [MembresiaId] uniqueidentifier NOT NULL,
        [Monto] decimal(18,2) NOT NULL,
        [Metodo] int NOT NULL,
        [RegistradoPorUsuarioId] nvarchar(450) NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Pagos] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Pagos_Metodo] CHECK ([Metodo] IN (1, 2, 3)),
        CONSTRAINT [CK_Pagos_Monto] CHECK ([Monto] > 0),
        CONSTRAINT [FK_Pagos_AspNetUsers_RegistradoPorUsuarioId] FOREIGN KEY ([RegistradoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Pagos_Membresias_MembresiaId] FOREIGN KEY ([MembresiaId]) REFERENCES [Membresias] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE INDEX [IX_Membresias_MiembroId_FechaFinExclusiva] ON [Membresias] ([MiembroId], [FechaFinExclusiva]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE INDEX [IX_Membresias_PlanMembresiaId] ON [Membresias] ([PlanMembresiaId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE INDEX [IX_Pagos_FechaRegistro] ON [Pagos] ([FechaRegistro]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Pagos_MembresiaId] ON [Pagos] ([MembresiaId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    CREATE INDEX [IX_Pagos_RegistradoPorUsuarioId] ON [Pagos] ([RegistradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002133111_AgregarMembresiasYPagos'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002133111_AgregarMembresiasYPagos', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    ALTER TABLE [Membresias] ADD [MotivoCambioPrecio] nvarchar(250) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    ALTER TABLE [Membresias] ADD [PrecioOriginalPlan] decimal(18,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    CREATE TABLE [EntradasDiarias] (
        [Id] uniqueidentifier NOT NULL,
        [Monto] decimal(18,2) NOT NULL,
        [Metodo] int NOT NULL,
        [FechaOperacion] date NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        [RegistradoPorUsuarioId] nvarchar(450) NOT NULL,
        [Observacion] nvarchar(250) NULL,
        CONSTRAINT [PK_EntradasDiarias] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_EntradasDiarias_Metodo] CHECK ([Metodo] IN (1, 2, 3)),
        CONSTRAINT [CK_EntradasDiarias_Monto] CHECK ([Monto] > 0),
        CONSTRAINT [FK_EntradasDiarias_AspNetUsers_RegistradoPorUsuarioId] FOREIGN KEY ([RegistradoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    CREATE INDEX [IX_EntradasDiarias_FechaOperacion_Metodo] ON [EntradasDiarias] ([FechaOperacion], [Metodo]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    CREATE INDEX [IX_EntradasDiarias_RegistradoPorUsuarioId] ON [EntradasDiarias] ([RegistradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002150142_AgregarEntradasDiariasYPrecioOriginal'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002150142_AgregarEntradasDiariasYPrecioOriginal', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    CREATE TABLE [Asistencias] (
        [Id] uniqueidentifier NOT NULL,
        [MiembroId] uniqueidentifier NOT NULL,
        [MembresiaId] uniqueidentifier NOT NULL,
        [FechaOperacion] date NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        [RegistradoPorUsuarioId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_Asistencias] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Asistencias_AspNetUsers_RegistradoPorUsuarioId] FOREIGN KEY ([RegistradoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Asistencias_Membresias_MembresiaId] FOREIGN KEY ([MembresiaId]) REFERENCES [Membresias] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Asistencias_Miembros_MiembroId] FOREIGN KEY ([MiembroId]) REFERENCES [Miembros] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    CREATE INDEX [IX_Asistencias_FechaOperacion_FechaRegistro] ON [Asistencias] ([FechaOperacion], [FechaRegistro]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    CREATE INDEX [IX_Asistencias_MembresiaId] ON [Asistencias] ([MembresiaId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    CREATE INDEX [IX_Asistencias_MiembroId_FechaOperacion] ON [Asistencias] ([MiembroId], [FechaOperacion]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    CREATE INDEX [IX_Asistencias_RegistradoPorUsuarioId] ON [Asistencias] ([RegistradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005144924_AgregarAsistencias'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261005144924_AgregarAsistencias', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261006171703_AgregarGastos'
)
BEGIN
    CREATE TABLE [Gastos] (
        [Id] uniqueidentifier NOT NULL,
        [Concepto] nvarchar(150) NOT NULL,
        [Monto] decimal(18,2) NOT NULL,
        [Metodo] int NOT NULL,
        [SaleDeCaja] bit NOT NULL,
        [FechaOperacion] date NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        [RegistradoPorUsuarioId] nvarchar(450) NOT NULL,
        [Observacion] nvarchar(250) NULL,
        CONSTRAINT [PK_Gastos] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Gastos_Metodo] CHECK ([Metodo] IN (1, 2, 3)),
        CONSTRAINT [CK_Gastos_Monto] CHECK ([Monto] > 0),
        CONSTRAINT [CK_Gastos_SaleDeCaja] CHECK ([SaleDeCaja] = 0 OR [Metodo] = 1),
        CONSTRAINT [FK_Gastos_AspNetUsers_RegistradoPorUsuarioId] FOREIGN KEY ([RegistradoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261006171703_AgregarGastos'
)
BEGIN
    CREATE INDEX [IX_Gastos_FechaOperacion_Metodo] ON [Gastos] ([FechaOperacion], [Metodo]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261006171703_AgregarGastos'
)
BEGIN
    CREATE INDEX [IX_Gastos_RegistradoPorUsuarioId] ON [Gastos] ([RegistradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261006171703_AgregarGastos'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261006171703_AgregarGastos', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007211148_AgregarComprobantesMembresia'
)
BEGIN
    CREATE TABLE [ComprobantesMembresia] (
        [Id] uniqueidentifier NOT NULL,
        [PagoId] uniqueidentifier NOT NULL,
        [Numero] nvarchar(50) NOT NULL,
        [FechaEmision] datetimeoffset NOT NULL,
        [FechaPago] datetimeoffset NOT NULL,
        [NombreGym] nvarchar(150) NOT NULL,
        [NombreMiembro] nvarchar(150) NOT NULL,
        [CodigoMiembro] nvarchar(30) NOT NULL,
        [NombrePlan] nvarchar(100) NOT NULL,
        [FechaInicio] date NOT NULL,
        [FechaFinExclusiva] date NOT NULL,
        [MontoPagado] decimal(18,2) NOT NULL,
        [Metodo] int NOT NULL,
        [NombreUsuarioCobro] nvarchar(150) NOT NULL,
        CONSTRAINT [PK_ComprobantesMembresia] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ComprobantesMembresia_Fechas] CHECK ([FechaFinExclusiva] > [FechaInicio]),
        CONSTRAINT [CK_ComprobantesMembresia_Metodo] CHECK ([Metodo] IN (1, 2, 3)),
        CONSTRAINT [CK_ComprobantesMembresia_Monto] CHECK ([MontoPagado] > 0),
        CONSTRAINT [FK_ComprobantesMembresia_Pagos_PagoId] FOREIGN KEY ([PagoId]) REFERENCES [Pagos] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007211148_AgregarComprobantesMembresia'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ComprobantesMembresia_Numero] ON [ComprobantesMembresia] ([Numero]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007211148_AgregarComprobantesMembresia'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ComprobantesMembresia_PagoId] ON [ComprobantesMembresia] ([PagoId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261007211148_AgregarComprobantesMembresia'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261007211148_AgregarComprobantesMembresia', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    CREATE TABLE [Entrenadores] (
        [Id] uniqueidentifier NOT NULL,
        [NombreCompleto] nvarchar(150) NOT NULL,
        [Telefono] nvarchar(30) NOT NULL,
        [Especialidad] nvarchar(150) NOT NULL,
        [Activo] bit NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Entrenadores] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    CREATE TABLE [ClasesGym] (
        [Id] uniqueidentifier NOT NULL,
        [Nombre] nvarchar(150) NOT NULL,
        [EntrenadorId] uniqueidentifier NOT NULL,
        [DiaSemana] int NOT NULL,
        [HoraInicio] time NOT NULL,
        [Cupo] int NOT NULL,
        [Activo] bit NOT NULL,
        [FechaRegistro] datetimeoffset NOT NULL,
        CONSTRAINT [PK_ClasesGym] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ClasesGym_Cupo] CHECK ([Cupo] > 0),
        CONSTRAINT [CK_ClasesGym_DiaSemana] CHECK ([DiaSemana] BETWEEN 0 AND 6),
        CONSTRAINT [FK_ClasesGym_Entrenadores_EntrenadorId] FOREIGN KEY ([EntrenadorId]) REFERENCES [Entrenadores] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    CREATE INDEX [IX_ClasesGym_DiaSemana_HoraInicio] ON [ClasesGym] ([DiaSemana], [HoraInicio]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    CREATE INDEX [IX_ClasesGym_EntrenadorId] ON [ClasesGym] ([EntrenadorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    CREATE INDEX [IX_Entrenadores_NombreCompleto] ON [Entrenadores] ([NombreCompleto]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261009124049_AgregarEntrenadoresYClases'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261009124049_AgregarEntrenadoresYClases', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013200140_PrepararImportacionMiembros'
)
BEGIN
    ALTER TABLE [Miembros] ADD [IdSistemaAnterior] nvarchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013200140_PrepararImportacionMiembros'
)
BEGIN
    ALTER TABLE [Membresias] ADD [Origen] int NOT NULL DEFAULT 1;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013200140_PrepararImportacionMiembros'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Miembros_IdSistemaAnterior] ON [Miembros] ([IdSistemaAnterior]) WHERE [IdSistemaAnterior] IS NOT NULL');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013200140_PrepararImportacionMiembros'
)
BEGIN
    EXEC(N'ALTER TABLE [Membresias] ADD CONSTRAINT [CK_Membresias_Origen] CHECK ([Origen] IN (1, 2))');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261013200140_PrepararImportacionMiembros'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261013200140_PrepararImportacionMiembros', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014000914_AgregarEmailYNotasMiembros'
)
BEGIN
    ALTER TABLE [Miembros] ADD [Email] nvarchar(254) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014000914_AgregarEmailYNotasMiembros'
)
BEGIN
    ALTER TABLE [Miembros] ADD [Notas] nvarchar(1000) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014000914_AgregarEmailYNotasMiembros'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261014000914_AgregarEmailYNotasMiembros', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014221923_AgregarCortesDiarios'
)
BEGIN
    CREATE TABLE [CortesDiarios] (
        [Id] uniqueidentifier NOT NULL,
        [FechaOperacion] date NOT NULL,
        [FondoInicial] decimal(18,2) NOT NULL,
        [IngresosMembresias] decimal(18,2) NOT NULL,
        [IngresosEntradasDiarias] decimal(18,2) NOT NULL,
        [CobrosEfectivo] decimal(18,2) NOT NULL,
        [CobrosTarjeta] decimal(18,2) NOT NULL,
        [CobrosTransferencia] decimal(18,2) NOT NULL,
        [GastosEfectivo] decimal(18,2) NOT NULL,
        [GastosTarjeta] decimal(18,2) NOT NULL,
        [GastosTransferencia] decimal(18,2) NOT NULL,
        [SalidasDeCaja] decimal(18,2) NOT NULL,
        [EfectivoEsperado] decimal(18,2) NOT NULL,
        [EfectivoContado] decimal(18,2) NOT NULL,
        [Diferencia] decimal(18,2) NOT NULL,
        [CerradoPorUsuarioId] nvarchar(450) NOT NULL,
        [FechaCierre] datetimeoffset NOT NULL,
        [Observacion] nvarchar(1000) NULL,
        CONSTRAINT [PK_CortesDiarios] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_CortesDiarios_Diferencia] CHECK ([Diferencia] = [EfectivoContado] - [EfectivoEsperado]),
        CONSTRAINT [CK_CortesDiarios_EfectivoEsperado] CHECK ([EfectivoEsperado] = [FondoInicial] + [CobrosEfectivo] - [SalidasDeCaja]),
        CONSTRAINT [CK_CortesDiarios_Montos] CHECK ([FondoInicial] >= 0 AND [IngresosMembresias] >= 0 AND [IngresosEntradasDiarias] >= 0 AND [CobrosEfectivo] >= 0 AND [CobrosTarjeta] >= 0 AND [CobrosTransferencia] >= 0 AND [GastosEfectivo] >= 0 AND [GastosTarjeta] >= 0 AND [GastosTransferencia] >= 0 AND [SalidasDeCaja] >= 0 AND [EfectivoContado] >= 0),
        CONSTRAINT [CK_CortesDiarios_Salidas] CHECK ([SalidasDeCaja] <= [GastosEfectivo]),
        CONSTRAINT [FK_CortesDiarios_AspNetUsers_CerradoPorUsuarioId] FOREIGN KEY ([CerradoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014221923_AgregarCortesDiarios'
)
BEGIN
    CREATE INDEX [IX_CortesDiarios_CerradoPorUsuarioId] ON [CortesDiarios] ([CerradoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014221923_AgregarCortesDiarios'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CortesDiarios_FechaOperacion] ON [CortesDiarios] ([FechaOperacion]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261014221923_AgregarCortesDiarios'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261014221923_AgregarCortesDiarios', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    DROP INDEX [IX_CortesDiarios_FechaOperacion] ON [CortesDiarios];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    ALTER TABLE [CortesDiarios] ADD [FechaReapertura] datetimeoffset NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    ALTER TABLE [CortesDiarios] ADD [MotivoReapertura] nvarchar(1000) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    ALTER TABLE [CortesDiarios] ADD [Reabierto] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    ALTER TABLE [CortesDiarios] ADD [ReabiertoPorUsuarioId] nvarchar(450) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_CortesDiarios_FechaOperacion] ON [CortesDiarios] ([FechaOperacion]) WHERE [Reabierto] = 0');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    CREATE INDEX [IX_CortesDiarios_ReabiertoPorUsuarioId] ON [CortesDiarios] ([ReabiertoPorUsuarioId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    EXEC(N'ALTER TABLE [CortesDiarios] ADD CONSTRAINT [CK_CortesDiarios_Reapertura] CHECK (([Reabierto] = 0 AND [ReabiertoPorUsuarioId] IS NULL AND [FechaReapertura] IS NULL AND [MotivoReapertura] IS NULL) OR ([Reabierto] = 1 AND [ReabiertoPorUsuarioId] IS NOT NULL AND [FechaReapertura] IS NOT NULL AND [FechaReapertura] >= [FechaCierre] AND [MotivoReapertura] IS NOT NULL AND LEN(LTRIM(RTRIM([MotivoReapertura]))) > 0))');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    ALTER TABLE [CortesDiarios] ADD CONSTRAINT [FK_CortesDiarios_AspNetUsers_ReabiertoPorUsuarioId] FOREIGN KEY ([ReabiertoPorUsuarioId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261021173501_AgregarReaperturaCortesDiarios'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261021173501_AgregarReaperturaCortesDiarios', N'8.0.0');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023184631_PermitirEdadNoInformada'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Miembros]') AND [c].[name] = N'EdadAlRegistrarse');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Miembros] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Miembros] ALTER COLUMN [EdadAlRegistrarse] int NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023184631_PermitirEdadNoInformada'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261023184631_PermitirEdadNoInformada', N'8.0.0');
END;
GO

COMMIT;
GO

