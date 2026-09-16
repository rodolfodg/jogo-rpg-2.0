import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token JWT não informado.' })
  }

  const token = authorization.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }
    req.userId = payload.userId
    return next()
  } catch {
    return res.status(401).json({ message: 'Token JWT inválido ou expirado.' })
  }
}
