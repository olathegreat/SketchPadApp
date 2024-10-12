const express = require('express')
const router = express.Router();
const authController = require('./../controllers/authController')
const {signUp, signIn,protect, forgotPassword, updatePassword, resetPassword} = authController





router.post('/signup', signUp)
router.post('/signin', signIn)
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword); 
router.patch('/updatePassword',protect, updatePassword);




module.exports = router