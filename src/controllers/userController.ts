import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const createUserSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) })
const updateUserSchema = z.object({ name: z.string().min(2).optional(), email: z.string().email().optional(), password: z.string().min(6).optional() }).refine(data => Object.keys(data).length > 0, { message: 'Informe ao menos um campo para atualizar.' })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

function publicUser(user: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }
}

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.', errors: parsed.error.flatten() })
  const { name, email, password } = parsed.data
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ message: 'E-mail já cadastrado.' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash } })
  return res.status(201).json(publicUser(user))
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados de login inválidos.' })
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ message: 'E-mail ou senha inválidos.' })
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'] })
  return res.status(200).json({ token, user: publicUser(user) })
}

export async function getLoggedUser(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })
  return res.status(200).json(publicUser(user))
}

export async function updateUser(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.', errors: parsed.error.flatten() })
  if (parsed.data.email) {
    const emailOwner = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (emailOwner && emailOwner.id !== req.userId) return res.status(409).json({ message: 'E-mail já cadastrado.' })
  }
  const data: { name?: string; email?: string; passwordHash?: string } = {}
  if (parsed.data.name) data.name = parsed.data.name
  if (parsed.data.email) data.email = parsed.data.email
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 10)
  try {
    const user = await prisma.user.update({ where: { id: req.userId }, data })
    return res.status(200).json(publicUser(user))
  } catch { return res.status(404).json({ message: 'Usuário não encontrado.' }) }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ message: 'Token não informado.' })
  try {
    await prisma.user.delete({ where: { id: req.userId } })
    return res.status(204).send()
  } catch { return res.status(404).json({ message: 'Usuário não encontrado.' }) }
}
