// Local development host for the Vercel serverless functions in ./api.
// Vercel wraps each handler with request parsing + response helpers; this file
// provides the same surface through Express so the handlers run unchanged.
import express from 'express'
import type { Request, Response } from 'express'
import bundles from '../api/bundles'
import callback from '../api/callback'

type Handler = (req: any, res: any) => unknown

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function mount(path: string, handler: Handler) {
  app.all(path, async (req: Request, res: Response) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error(`[dev-api] ${req.method} ${path} failed:`, error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Handler failed in the local dev server' })
      }
    }
  })
}

mount('/api/bundles', bundles as Handler)
mount('/api/callback', callback as Handler)

const port = Number(process.env.PORT || 8000)
app.listen(port, '0.0.0.0', () => {
  console.log(`[dev-api] listening on http://0.0.0.0:${port}`)
})
