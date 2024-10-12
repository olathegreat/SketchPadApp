const express = require('express')

const cors = require('cors');

const app = express()
app.use(cors())

app.use(express.json())


// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with your frontend URL if different
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods you want to allow
//     allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
// }));


const taskRouter = require('./routes/taskRouter')
const authRouter = require('./routes/authRouter')

app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/auth', authRouter)




module.exports = app