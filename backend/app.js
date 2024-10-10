const express = require('express')

const app = express()

app.use(express.json())


const taskRouter = require('./routes/taskRouter')

app.use('/api/v1/tasks', taskRouter)




module.exports = app