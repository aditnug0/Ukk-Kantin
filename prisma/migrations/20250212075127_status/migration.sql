/*
  Warnings:

  - You are about to drop the column `statuss` on the `transaksi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `transaksi` DROP COLUMN `statuss`,
    ADD COLUMN `status` ENUM('belum_dimasak', 'dimasak', 'diantar', 'sampai') NOT NULL DEFAULT 'belum_dimasak';
