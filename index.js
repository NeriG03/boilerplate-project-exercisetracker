const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const users = []
const exercises = []

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/users', (req, res) => {
  const { username } = req.body
  const user = { username, _id: users.length.toString() }
  users.push(user)
  res.json(user)
})

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  const user = users.find(user => user._id === _id)
  if (!user) return res.status(404).send('User not found')

  if (!description || !duration || isNaN(parseInt(duration))) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }
  exercises.push({ ...exercise, _id })

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = users.find(user => user._id === _id)
  if (!user) return res.status(404).send('User not found')

  let log = exercises
    .filter(exercise => exercise._id === _id)
    .map(({ description, duration, date }) => ({
      description,
      duration,
      date: new Date(date).toDateString()
    }))

  if (from) log = log.filter(exercise => new Date(exercise.date) >= new Date(from))
  if (to) log = log.filter(exercise => new Date(exercise.date) <= new Date(to))
  if (limit) log = log.slice(0, parseInt(limit))

  res.json({ ...user, count: log.length, log })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
