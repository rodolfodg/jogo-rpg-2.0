import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware'
import { attackEnemy, createCharacter, createEnemy, deleteCharacter, getCharacter, listCharacters, listEnemies, updateCharacter } from '../controllers/rpgController'

const router = Router()

router.get('/characters', authMiddleware, listCharacters)
router.post('/characters', authMiddleware, createCharacter)
router.get('/characters/:id', authMiddleware, getCharacter)
router.put('/characters/:id', authMiddleware, updateCharacter)
router.delete('/characters/:id', authMiddleware, deleteCharacter)

router.get('/enemies', authMiddleware, listEnemies)
router.post('/enemies', authMiddleware, createEnemy)
router.post('/battles/attack', authMiddleware, attackEnemy)

export default router
