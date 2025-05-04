-- AlterTable
ALTER TABLE `diskon` ADD COLUMN `id_stan` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `diskon` ADD CONSTRAINT `diskon_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;
