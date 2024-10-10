const dotenv = require('dotenv');
const mongoose = require('mongoose')

dotenv.config({path: './config.env'})


const app = require('./app')



const DB = process.env.DATABASE_LOCAL


mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con=> console.log('Db Connected ✅'))


const port = process.env.PORT || 8000;
const server = app.listen(port, ()=>{
    console.log(`App is running on port ${port}`)
})


console.log('ready')