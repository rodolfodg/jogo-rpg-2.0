import { Response } from 'express'

import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export async function uploadAvatar(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  if (!req.file) {
    return res.status(400).json({
      message: 'Nenhum arquivo enviado.'
    })
  }

  const character = await prisma.character.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId
    }
  })

  if (!character) {
    return res.status(404).json({
      message: 'Personagem não encontrado.'
    })
  }

  const baseUrl =
    `${req.protocol}://${req.get('host')}`

  const avatarUrl =
    `${baseUrl}/uploads/${req.file.filename}`

  const updatedCharacter =
    await prisma.character.update({
      where: {
        id: character.id
      },

      data: {
        avatarId: avatarUrl
      }
    })

  return res.status(200).json({
    message: 'Avatar enviado com sucesso.',

    avatarId: avatarUrl,

    character: updatedCharacter
  })
}