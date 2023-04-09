/*
  Warnings:

  - You are about to drop the column `productId` on the `shopping_cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `shopping_cart_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `shopping_cart_items` DROP FOREIGN KEY `shopping_cart_items_productId_fkey`;

-- DropForeignKey
ALTER TABLE `shopping_cart_items` DROP FOREIGN KEY `shopping_cart_items_userId_fkey`;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `shoppingCartItemsId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `shopping_cart_items` DROP COLUMN `productId`,
    DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `shoppingCartItemsId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_shoppingCartItemsId_fkey` FOREIGN KEY (`shoppingCartItemsId`) REFERENCES `shopping_cart_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_shoppingCartItemsId_fkey` FOREIGN KEY (`shoppingCartItemsId`) REFERENCES `shopping_cart_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
