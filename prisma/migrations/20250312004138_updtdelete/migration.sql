-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `siswa_id_user_fkey`;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
