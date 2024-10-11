const express = require('express')



const router = express.Router();

const taskController = require('./../controllers/taskController');
const {getTasks, getTask, postTask, updateTask, deleteTask} = taskController;

router.route('/').get(getTasks).post(postTask)
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask)  



module.exports = router