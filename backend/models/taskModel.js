const mongoose = require('mongoose')

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
    taskCompletedAt: Date
},{
    toJSON: {virtuals: true},
    toObject: {virtual: true}
})


taskSchema.pre('save', async function(next){
    this.taskCreatedAt = Date.now();
    this.taskStatus = 'To Do';

    next();
})

const Task = mongoose.model('Task', taskSchema )

module.exports = Task;