/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_detail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_list` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/


-- CreateTable
CREATE TABLE `transaksi` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_stan` INTEGER NOT NULL DEFAULT 0,
    `id_siswa` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('belum_dimasak', 'dimasak', 'diantar', 'sampai') NOT NULL DEFAULT 'belum_dimasak',

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_siswa` VARCHAR(191) NOT NULL DEFAULT '',
    `alamat` VARCHAR(191) NOT NULL DEFAULT '',
    `telp` VARCHAR(191) NOT NULL DEFAULT '',
    `id_user` INTEGER NOT NULL DEFAULT 0,
    `foto` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stan` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_stan` VARCHAR(191) NOT NULL DEFAULT '',
    `nama_pemilik` VARCHAR(191) NOT NULL DEFAULT '',
    `Telp` VARCHAR(191) NOT NULL DEFAULT '',
    `id_user` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaksi` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL DEFAULT 0,
    `id_menu` INTEGER NOT NULL DEFAULT 0,
    `qty` INTEGER NOT NULL DEFAULT 0,
    `harga_beli` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_makanan` VARCHAR(191) NOT NULL DEFAULT '',
    `harga` DOUBLE NOT NULL DEFAULT 0,
    `jenis` ENUM('makanan', 'minuman') NOT NULL DEFAULT 'makanan',
    `foto` VARCHAR(191) NOT NULL DEFAULT '',
    `deskripsi` VARCHAR(191) NOT NULL DEFAULT '',
    `id_stan` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL DEFAULT '',
    `role` ENUM('admin_stan', 'siswa') NOT NULL DEFAULT 'siswa',

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(191) NOT NULL DEFAULT '',
    `persentase_diskon` DOUBLE NOT NULL DEFAULT 0,
    `tanggal_awal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_akhir` DATETIME(3) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_diskon` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_menu` INTEGER NOT NULL DEFAULT 0,
    `id_diskon` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stan` ADD CONSTRAINT `stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE;
