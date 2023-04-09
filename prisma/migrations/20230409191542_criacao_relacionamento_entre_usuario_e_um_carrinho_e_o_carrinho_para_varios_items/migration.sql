/*
  Warnings:

  - You are about to drop the column `shoppingCartItemsId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `shopping_cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `shopping_cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `shoppingCartItemsId` on the `users` table. All the data in the column will be lost.
  - Added the required column `productId` to the `shopping_cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shoppingCartId` to the `shopping_cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_shoppingCartItemsId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_shoppingCartItemsId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `shoppingCartItemsId`;

-- AlterTable
ALTER TABLE `shopping_cart_items` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `productId` VARCHAR(191) NOT NULL,
    ADD COLUMN `shoppingCartId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `shoppingCartItemsId`;

-- CreateTable
CREATE TABLE `shopping_cart` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `shopping_cart_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shopping_cart_items` ADD CONSTRAINT `shopping_cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopping_cart_items` ADD CONSTRAINT `shopping_cart_items_shoppingCartId_fkey` FOREIGN KEY (`shoppingCartId`) REFERENCES `shopping_cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopping_cart` ADD CONSTRAINT `shopping_cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
