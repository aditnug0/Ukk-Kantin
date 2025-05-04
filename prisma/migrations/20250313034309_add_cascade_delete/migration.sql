-- DropForeignKey
ALTER TABLE `stan` DROP FOREIGN KEY `stan_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_stan_fkey`;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stan` ADD CONSTRAINT `stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
