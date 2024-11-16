const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const users = []
const exercises = []

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = users.find(user => user._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  let userExercises = exercises.filter(exercise => exercise._id === _id)
  
  if (from) {
    const fromDate = new Date(from)
    userExercises = userExercises.filter(exercise => new Date(exercise.date) >= fromDate)
  }
  
  if (to) {
    const toDate = new Date(to)
    userExercises = userExercises.filter(exercise => new Date(exercise.date) <= toDate)
  }
  
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit))
  }
  
  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString()
    }))
  })
})

app.get('/api/users', (req, res) => {
  res.json(users)
})


app.post('/api/users', (req, res) => {
  const { username } = req.body
  const newUser = {
    username: username,
    _id: new Date().getTime().toString()
  }
  users.push(newUser)
  res.json(newUser)
})



app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  const user = users.find(user => user._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const newExercise = {
    _id: _id,
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }
  exercises.push(newExercise)
  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  })
})






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
