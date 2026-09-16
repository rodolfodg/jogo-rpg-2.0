/*
  Warnings:

  - You are about to drop the column `class` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `attack` on the `enemy` table. All the data in the column will be lost.
  - Added the required column `baseAttack` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseHp` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `characterClass` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attackPower` to the `Enemy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Enemy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `character` DROP COLUMN `class`,
    ADD COLUMN `avatarId` VARCHAR(191) NULL,
    ADD COLUMN `baseAttack` INTEGER NOT NULL,
    ADD COLUMN `baseHp` INTEGER NOT NULL,
    ADD COLUMN `characterClass` VARCHAR(191) NOT NULL,
    ALTER COLUMN `hp` DROP DEFAULT,
    ALTER COLUMN `maxHp` DROP DEFAULT,
    ALTER COLUMN `attack` DROP DEFAULT,
    MODIFY `defense` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `enemy` DROP COLUMN `attack`,
    ADD COLUMN `attackPower` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `defense` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Battle` (
    `id` VARCHAR(191) NOT NULL,
    `characterId` VARCHAR(191) NOT NULL,
    `enemyId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `diceRoll` INTEGER NOT NULL,
    `success` BOOLEAN NOT NULL,
    `damageToEnemy` INTEGER NOT NULL DEFAULT 0,
    `damageToCharacter` INTEGER NOT NULL DEFAULT 0,
    `characterHp` INTEGER NOT NULL,
    `enemyHp` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Battle_characterId_idx`(`characterId`),
    INDEX `Battle_enemyId_idx`(`enemyId`),
    INDEX `Battle_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Battle` ADD CONSTRAINT `Battle_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Battle` ADD CONSTRAINT `Battle_enemyId_fkey` FOREIGN KEY (`enemyId`) REFERENCES `Enemy`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Battle` ADD CONSTRAINT `Battle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
