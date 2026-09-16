import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import userRoutes from './routes/userRoutes'
import rpgRoutes from './routes/rpgRoutes'

dotenv.config()

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.')
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurada.')

const app = express()
const port = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => res.json({ message: 'API do RPG funcionando!', game: 'Fantasy RPG' }))
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))
app.use(userRoutes)
app.use(rpgRoutes)

app.listen(port, () => console.log(`Servidor do RPG rodando em http://localhost:${port}`))
