import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir =
  process.env.UPLOAD_DIR || 'uploads'

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },

  filename: (_req, file, cb) => {
    const extension =
      path.extname(file.originalname)

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`

    cb(null, filename)
  }
})

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Apenas imagens JPG, PNG, WEBP ou GIF são permitidas.'
        )
      )
    }

    cb(null, true)
  }
})