/*
  Warnings:

  - You are about to drop the column `status` on the `transaksi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `transaksi` DROP COLUMN `status`,
    ADD COLUMN `statuss` ENUM('belum_dimasak', 'dimasak', 'diantar', 'sampai') NOT NULL DEFAULT 'belum_dimasak';
