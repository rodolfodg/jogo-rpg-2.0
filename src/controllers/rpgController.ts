import { Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const characterSchema = z.object({
  name: z.string().min(2),
  class: z.string().min(2),
  level: z.number().int().min(1).optional(),
  maxHp: z.number().int().min(1).optional(),
  attack: z.number().int().min(1).optional(),
  defense: z.number().int().min(0).optional()
})

const enemySchema = z.object({
  name: z.string().min(2),
  level: z.number().int().min(1).optional(),
  hp: z.number().int().min(1),
  attack: z.number().int().min(1),
  defense: z.number().int().min(0)
})

export async function listCharacters(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const characters = await prisma.character.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } })
  return res.json(characters)
}

export async function createCharacter(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const parsed = characterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados do personagem inválidos.', errors: parsed.error.flatten() })
  const maxHp = parsed.data.maxHp ?? 100
  const character = await prisma.character.create({
    data: { name: parsed.data.name, class: parsed.data.class, level: parsed.data.level ?? 1, maxHp, hp: maxHp, attack: parsed.data.attack ?? 10, defense: parsed.data.defense ?? 5, userId: req.userId }
  })
  return res.status(201).json(character)
}

export async function getCharacter(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const character = await prisma.character.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' })
  return res.json(character)
}

export async function updateCharacter(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const parsed = characterSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.', errors: parsed.error.flatten() })
  const current = await prisma.character.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!current) return res.status(404).json({ message: 'Personagem não encontrado.' })
  const character = await prisma.character.update({ where: { id: current.id }, data: parsed.data })
  return res.json(character)
}

export async function deleteCharacter(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const current = await prisma.character.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!current) return res.status(404).json({ message: 'Personagem não encontrado.' })
  await prisma.character.delete({ where: { id: current.id } })
  return res.status(204).send()
}

export async function listEnemies(_req: AuthRequest, res: Response) {
  return res.json(await prisma.enemy.findMany({ orderBy: { level: 'asc' } }))
}

export async function createEnemy(req: AuthRequest, res: Response) {
  const parsed = enemySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados do inimigo inválidos.', errors: parsed.error.flatten() })
  const enemy = await prisma.enemy.create({ data: { name: parsed.data.name, level: parsed.data.level ?? 1, hp: parsed.data.hp, maxHp: parsed.data.hp, attack: parsed.data.attack, defense: parsed.data.defense } })
  return res.status(201).json(enemy)
}

export async function attackEnemy(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const schema = z.object({ characterId: z.string(), enemyId: z.string() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Informe characterId e enemyId.' })
  const character = await prisma.character.findFirst({ where: { id: parsed.data.characterId, userId: req.userId } })
  const enemy = await prisma.enemy.findUnique({ where: { id: parsed.data.enemyId } })
  if (!character) return res.status(404).json({ message: 'Personagem não encontrado.' })
  if (!enemy) return res.status(404).json({ message: 'Inimigo não encontrado.' })
  if (character.hp <= 0) return res.status(400).json({ message: 'O personagem está derrotado.' })
  if (enemy.hp <= 0) return res.status(400).json({ message: 'O inimigo já foi derrotado.' })

  const damageToEnemy = Math.max(1, character.attack - enemy.defense)
  const damageToCharacter = Math.max(1, enemy.attack - character.defense)
  const enemyHp = Math.max(0, enemy.hp - damageToEnemy)
  const characterHp = Math.max(0, character.hp - damageToCharacter)
  const victory = enemyHp === 0

  await prisma.$transaction([
    prisma.enemy.update({ where: { id: enemy.id }, data: { hp: enemyHp } }),
    prisma.character.update({ where: { id: character.id }, data: { hp: characterHp } })
  ])

  return res.json({ message: victory ? 'Inimigo derrotado!' : 'Ataque realizado!', character: { ...character, hp: characterHp }, enemy: { ...enemy, hp: enemyHp }, damageToEnemy, damageToCharacter, victory })
}
