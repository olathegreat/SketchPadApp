const mongoose = require('mongoose')
const User = require('./userModel')

const taskSchema = new mongoose.Schema({
    taskTitle: {
        type: String,
        required: [true, 'Add  brief header for task'],
        trim: true,
        unique: true
        
    
    },
    taskDescription: {
        type: String,
        required: [true, 'Write description for task']
    },
    taskStatus: {
        type: String,
        enum: ['To Do','In Progress', 'Completed'],
        // required: [true, 'task status must be added']
    },
    taskCreatedAt: Date,
    taskUpdatedAt: Date,
    taskCompletedAt: Date,
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, 'review must belong to a user']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtual: true}
})

taskSchema.index({user:1},{unique:true})

taskSchema.pre('save', async function(next){
    this.taskCreatedAt = Date.now();
    this.taskStatus = 'To Do';

    next();
})

taskSchema.pre(/^find/, function(next){
    this.populate({
        path:'user',
    })

    next()
})

const Task = mongoose.model('Task', taskSchema )

module.exports = Task;