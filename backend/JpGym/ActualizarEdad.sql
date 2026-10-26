BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261023184631_PermitirEdadNoInformada'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Miembros]') AND [c].[name] = N'EdadAlRegistrarse');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Miembros] DROP CONSTRAINT [' + @var0 + '];');
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

