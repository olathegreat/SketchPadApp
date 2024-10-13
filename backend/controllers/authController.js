const User = require("./../models/userModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require('util');
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  user.password = undefined;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "kindly provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "there is no user with this email address",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://localhost:3000/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new 
  password and passwordConfirm to: ${resetUrl} \nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err.message)
    res.status(500).json({
      status: "fail",
      message: "error, try again",
    });
  }
};

exports.resetPassword = async (req, res) => {
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      status: "fail",
      message: "error, try again",
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(401).json({
        status: "error",
        message: "your current password is wrong, try again",
      });
    }

    user.password = req.body.password;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = await req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return   res.status(500).json({
        status: "fail",
        message: "you are not logged in",
      });
      
      
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
  
    const freshUser = await User.findById(decoded.id);
  
    if (!freshUser) {
      return  res.status(401).json({
        status: "fail",
        message: 'user belonging to this token doesnot exist',
      });
    }
  
    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: 'user curently changed password, please logging again',
      });
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    console.log(req.user)
    next();
  };
  
