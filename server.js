import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

// Express Routing:

// Toy LIST
app.get('/api/toy', (req, res) => {
  const filterBy = {
    name: req.query.name || '',
    inStock: req.query.inStock || '',
    labels: req.query.labels || [],
    sortBy: req.query.sortBy || '',
  }

  toyService
    .query(filterBy)
    .then((toys) => {
      res.send(toys)
    })
    .catch((err) => {
      loggerService.error('Cannot get toys', err)
      res.status(400).send('Cannot get toys')
    })
})

// Toy READ
app.get('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params
  toyService
    .getById(toyId)
    .then((toy) => {
      res.send(toy)
    })
    .catch((err) => {
      loggerService.error('Cannot get toy', err)
      res.status(400).send('Cannot get toy')
    })
})

// Toy CREATE
app.post('/api/toy', (req, res) => {
  const toy = {
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    createdAt: req.body.createdAt,
    inStock: req.body.inStock,
  }
  toyService
    .save(toy)
    .then((savedToy) => {
      res.send(savedToy)
    })
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

// Toy UPDATE
app.put('/api/toy/:id', (req, res) => {
  const toy = {
    _id: req.params.id,
    name: req.body.name,
    price: +req.body.price,
    labels: req.body.labels,
    createdAt: req.body.createdAt,
    inStock: req.body.inStock,
  }
  console.log('🚀 ~ file: server.js:96 ~ app.put ~ toy:', toy)

  // {name: 'Spiderman', price: 9, labels: Array(2), createdAt: 1689691008061, inStock: false}

  toyService
    .save(toy)
    .then((savedToy) => {
      res.send(savedToy)
    })
    .catch((err) => {
      loggerService.error('Cannot save toy', err)
      res.status(400).send('Cannot save toy')
    })
})

// Toy DELETE
app.delete('/api/toy/:toyId', (req, res) => {
  const { toyId } = req.params
  toyService
    .remove(toyId)
    .then(() => {
      loggerService.info(`Toy ${toyId} removed`)

      res.send('Removed!')
    })
    .catch((err) => {
      loggerService.error('Cannot remove toy', err)
      res.status(400).send('Cannot remove toy')
    })
})

const PORT = 3030
app.listen(PORT, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
