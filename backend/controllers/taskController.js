const Task = require('./../models/taskModel')



exports.getTasks = async(req, res)=>{
    console.log(req.user)

    try{
        const tasks =  await Task.find({ user: req.user._id }).sort('-taskCreatedAt');

        res.status(200).json({
            status:'success',
            results: tasks.length,
            data:{
                tasks
            }
        })


    }catch(err){
        console.log(err)

        res.status(404).json({
            status: 'Not Found',
            
        })

    }
   
}

exports.getTask = async (req, res) =>{
    try{
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        res.status(200).json({
            status:'success',
            data:{
                task
            }
        })
    }catch(err){
        console.log(err)

        res.status(404).json({
            status: 'Not Found',
            
        })

    }
}

exports.postTask = async( req, res) =>{
    try{

        // if (!req.body.title) {
        //     return res.status(400).json({
        //         status: 'fail',
        //         message: 'Task title is required'
        //     });
        // }
        req.body.user = req.user.id
        const task = await Task.create(req.body)

        res.status(201).json({
            status:'success',
            data:{
                task
            }
        })
    }catch(err){
        console.log(err)

        res.status(500).json({
            status: 'Error try again',
            message: err.message
            
        })

    }
}

exports.updateTask = async (req, res)=>{
    try{
        const task = await Task.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators: true
        })

        res.status(201).json({
            status:'success',
            data:{
                task
            }
        })
    }catch(err){
        console.log(err)

        res.status(500).json({
            status: 'Error try again',
            
        })

    }
}


exports.deleteTask = async (req, res)=>{
    try{
        const task = await Task.findByIdAndDelete(req.params.id)
 
        res.status(201).json({
            status:'success',
            
        })
    }catch(err){
        console.log(err)

        res.status(500).json({
            status: 'Error try again',
            
        })

    }
}