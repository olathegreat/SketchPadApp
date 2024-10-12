const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const { builtinModules } = require('module');

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: [true, "First name is required"],
        trim: true,
        
    },
    lastname:{
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'  
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:8,
        select:false
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,  
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    

    

    next();

})

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();  
    this.passwordChangedAt = Date.now() - 1000;
    next();

})

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
const User = mongoose.model('User', userSchema)

module.exports = User;