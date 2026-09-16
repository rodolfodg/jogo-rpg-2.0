import { Router } from 'express'
import { createUser, deleteUser, getLoggedUser, login, updateUser } from '../controllers/userController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.post('/users', createUser)
router.post('/login', login)
router.get('/users/me', authMiddleware, getLoggedUser)
router.put('/users/me', authMiddleware, updateUser)
router.delete('/users/me', authMiddleware, deleteUser)

export default router
