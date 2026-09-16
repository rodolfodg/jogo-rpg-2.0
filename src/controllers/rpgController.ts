import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const characterSchema = z.object({
  name: z.string().min(2),

  characterClass: z.enum(['WARRIOR', 'MAGE', 'ARCHER']),

  baseHp: z.number().int().min(1),

  baseAttack: z.number().int().min(1),

  level: z.number().int().min(1).optional(),

  defense: z.number().int().min(0).optional()
})

const enemySchema = z.object({
  name: z.string().min(2),

  level: z.number().int().min(1),

  maxHp: z.number().int().min(1),

  attackPower: z.number().int().min(1),

  defense: z.number().int().min(0)
})

/**
 * LISTAR PERSONAGENS DO USUÁRIO
 */
export async function listCharacters(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  const characters = await prisma.character.findMany({
    where: {
      userId: req.userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return res.status(200).json(characters)
}

/**
 * CRIAR PERSONAGEM
 * TICKET RPG-01
 */
export async function createCharacter(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  const parsed = characterSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados do personagem inválidos.',
      errors: parsed.error.flatten()
    })
  }

  const {
    name,
    characterClass,
    baseHp,
    baseAttack,
    level,
    defense
  } = parsed.data

  const character = await prisma.character.create({
    data: {
      name,
      characterClass,
      level: level ?? 1,

      baseHp,
      baseAttack,

      hp: baseHp,
      maxHp: baseHp,

      attack: baseAttack,

      defense: defense ?? 0,

      userId: req.userId
    }
  })

  return res.status(201).json(character)
}

/**
 * CONSULTAR PERSONAGEM
 */
export async function getCharacter(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
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

  return res.status(200).json(character)
}

/**
 * ATUALIZAR PERSONAGEM
 */
export async function updateCharacter(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  const parsed = characterSchema.partial().safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors: parsed.error.flatten()
    })
  }

  const current = await prisma.character.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId
    }
  })

  if (!current) {
    return res.status(404).json({
      message: 'Personagem não encontrado.'
    })
  }

  const data: any = {
    ...parsed.data
  }

  if (parsed.data.baseHp !== undefined) {
    data.maxHp = parsed.data.baseHp

    if (current.hp > parsed.data.baseHp) {
      data.hp = parsed.data.baseHp
    }
  }

  if (parsed.data.baseAttack !== undefined) {
    data.attack = parsed.data.baseAttack
  }

  const character = await prisma.character.update({
    where: {
      id: current.id
    },
    data
  })

  return res.status(200).json(character)
}

/**
 * DELETAR PERSONAGEM
 */
export async function deleteCharacter(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  const current = await prisma.character.findFirst({
    where: {
      id: req.params.id,
      userId: req.userId
    }
  })

  if (!current) {
    return res.status(404).json({
      message: 'Personagem não encontrado.'
    })
  }

  await prisma.character.delete({
    where: {
      id: current.id
    }
  })

  return res.status(204).send()
}

/**
 * LISTAR INIMIGOS
 * TICKET RPG-02
 *
 * GET /enemies
 * GET /enemies?level=2
 */
export async function listEnemies(
  req: Request,
  res: Response
) {
  const levelParam = req.query.level

  let level: number | undefined

  if (levelParam !== undefined) {
    level = Number(levelParam)

    if (!Number.isInteger(level) || level < 1) {
      return res.status(400).json({
        message: 'O nível deve ser um número inteiro positivo.'
      })
    }
  }

  const enemies = await prisma.enemy.findMany({
    where: level !== undefined
      ? { level }
      : undefined,

    orderBy: {
      level: 'asc'
    }
  })

  return res.status(200).json(enemies)
}

/**
 * CRIAR INIMIGO
 * TICKET RPG-02
 */
export async function createEnemy(
  req: AuthRequest,
  res: Response
) {
  const parsed = enemySchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Dados do inimigo inválidos.',
      errors: parsed.error.flatten()
    })
  }

  const {
    name,
    level,
    maxHp,
    attackPower,
    defense
  } = parsed.data

  const enemy = await prisma.enemy.create({
    data: {
      name,
      level,
      hp: maxHp,
      maxHp,
      attackPower,
      defense
    }
  })

  return res.status(201).json(enemy)
}

/**
 * ATAQUE
 * TICKET RPG-03
 *
 * Dado entre 1 e 500.
 *
 * PAR = sucesso
 * ÍMPAR = falha + contra-ataque
 */
export async function attackEnemy(
  req: AuthRequest,
  res: Response
) {
  if (!req.userId) {
    return res.status(401).json({
      message: 'Token não informado.'
    })
  }

  const schema = z.object({
    characterId: z.string().min(1),
    enemyId: z.string().min(1)
  })

  const parsed = schema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Informe characterId e enemyId.'
    })
  }

  const {
    characterId,
    enemyId
  } = parsed.data

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      userId: req.userId
    }
  })

  const enemy = await prisma.enemy.findUnique({
    where: {
      id: enemyId
    }
  })

  if (!character) {
    return res.status(404).json({
      message: 'Personagem não encontrado.'
    })
  }

  if (!enemy) {
    return res.status(404).json({
      message: 'Inimigo não encontrado.'
    })
  }

  if (character.hp <= 0) {
    return res.status(400).json({
      message: 'O personagem está derrotado.'
    })
  }

  if (enemy.hp <= 0) {
    return res.status(400).json({
      message: 'O inimigo já foi derrotado.'
    })
  }

  /**
   * DADO ENTRE 1 E 500
   */
  const diceRoll =
    Math.floor(Math.random() * 500) + 1

  /**
   * PAR = SUCESSO
   * ÍMPAR = FALHA
   */
  const success = diceRoll % 2 === 0

  let damageToEnemy = 0
  let damageToCharacter = 0

  let enemyHp = enemy.hp
  let characterHp = character.hp

  if (success) {
    /**
     * O valor sorteado causa dano ao inimigo.
     */
    damageToEnemy = Math.min(
      diceRoll,
      enemy.hp
    )

    enemyHp = Math.max(
      0,
      enemy.hp - damageToEnemy
    )
  } else {
    /**
     * Ataque falha.
     *
     * Contra-ataque do inimigo.
     */
    damageToCharacter = Math.max(
      1,
      enemy.attackPower - character.defense
    )

    characterHp = Math.max(
      0,
      character.hp - damageToCharacter
    )
  }

  /**
   * REGISTRO DA BATALHA
   * + atualização dos HPs
   */
  const battle = await prisma.$transaction(
    async (tx) => {
      await tx.character.update({
        where: {
          id: character.id
        },
        data: {
          hp: characterHp
        }
      })

      await tx.enemy.update({
        where: {
          id: enemy.id
        },
        data: {
          hp: enemyHp
        }
      })

      return tx.battle.create({
        data: {
          characterId: character.id,
          enemyId: enemy.id,
          userId: req.userId!,

          diceRoll,
          success,

          damageToEnemy,
          damageToCharacter,

          characterHp,
          enemyHp
        }
      })
    }
  )

  return res.status(200).json({
    battleId: battle.id,

    diceRoll,

    success,

    message: success
      ? 'Ataque bem-sucedido!'
      : 'Ataque falhou e o inimigo realizou um contra-ataque.',

    damageToEnemy,
    damageToCharacter,

    currentHp: characterHp,

    character: {
      id: character.id,
      name: character.name,
      hp: characterHp,
      maxHp: character.maxHp
    },

    enemy: {
      id: enemy.id,
      name: enemy.name,
      hp: enemyHp,
      maxHp: enemy.maxHp
    }
  })
}