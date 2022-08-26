const jwt = require("jsonwebtoken");
const User = require("./../models/user.Model");
const AppError = require("./../utils/AppError");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

const createSendToken = (statusCode, newUser, res) => {
  const token = signToken(newUser._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  newUser.password = undefined;
  newUser.passwordChangedAt = undefined;
  newUser.__v = undefined;

  const userObj = Object.assign({ token: token }, newUser._doc);
  console.log(userObj);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    data: userObj,
  });
};

exports.signup = async (req, res, next) => {
  try {
    console.log(req);
    const newUser = await User.create({
      user_name: req.body.user_name,
      email: req.body.email,
      password: req.body.password,
      company_name: req.body.company_name,
      company_description: req.body.company_description,
      image: req.body.image,
    });

    const token = createSendToken(201, newUser, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("Please provide email id and password", 400));
    const user = await User.findOne({ email });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid email id or password", 401));
    }

    createSendToken(200, user, res);
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    //console.log(req.headers.authorization);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      // console.log(token);
      //token = token.substring(1, token.length - 1);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user)
        return next(
          new AppError("The user belonging to this token no longer exists", 401)
        );
      req.user = user;
      next();
    } else {
      return next(new AppError("Please log in to your account", 401));
    }
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  if (!req.body.email)
    return next(new AppError("Please provide your email address", 401));
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError("No user found with this email address", 404));

  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/resetPassword/${resetToken}`;

  const resetUrl = `${req.protocol}://127.0.0.1:3000/password_resets/${resetToken}`;
  //const message = `Forgot password? Send a patch request with your new password to the url: ${resetUrl}.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      payload: { link: resetUrl },
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      return next(new AppError("Token is invalid or has expired", 400));
    if (!req.body.password)
      return next(
        new AppError("Please provide the new password to be set", 401)
      );

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(200, user, res);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!req.body.passwordCurrent || !req.body.password)
      return next(
        new AppError("please provide your current and new password", 400)
      );
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    await user.save();

    createSendToken(200, user, res);
  } catch (err) {
    next(err);
  }
};
