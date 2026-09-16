import { Router } from 'express'

import { authMiddleware } from '../middleware/authMiddleware'

import {
  attackEnemy,
  createCharacter,
  createEnemy,
  deleteCharacter,
  getCharacter,
  listCharacters,
  listEnemies,
  updateCharacter
} from '../controllers/rpgController'

import { upload } from '../middleware/uploadMiddleware'
import { uploadAvatar } from '../controllers/uploadController'

const router = Router()

// PERSONAGENS
router.get(
  '/characters',
  authMiddleware,
  listCharacters
)

router.post(
  '/characters',
  authMiddleware,
  createCharacter
)

router.get(
  '/characters/:id',
  authMiddleware,
  getCharacter
)

router.put(
  '/characters/:id',
  authMiddleware,
  updateCharacter
)

router.delete(
  '/characters/:id',
  authMiddleware,
  deleteCharacter
)

// INIMIGOS
router.get(
  '/enemies',
  listEnemies
)

router.post(
  '/enemies',
  authMiddleware,
  createEnemy
)

// BATALHA
router.post(
  '/battles/attack',
  authMiddleware,
  attackEnemy
)

// AVATAR
router.post(
  '/characters/:id/avatar',
  authMiddleware,
  upload.single('file'),
  uploadAvatar
)

export default router
