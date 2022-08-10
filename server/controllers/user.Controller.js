const User = require("../models/user.Model");
const Contact = require("./../models/contact.Model");
const AppError = require("./../utils/AppError");

exports.updateMe = async (req, res, next) => {
  try {
    const updateRestrictedFields = [
      "_id",
      "password",
      "role",
      "created_at",
      "__v",
    ];
    let filteredObj = {};

    for (let key in req.body) {
      if (!updateRestrictedFields.includes(key))
        filteredObj[key] = req.body[key];
    }

    if (req.body.image) filteredObj.image = req.body.image;
    const query = User.findByIdAndUpdate(
      req.user._id,
      { ...filteredObj, updated_at: Date.now() },
      {
        runValidators: true,
        returnDocument: "after",
      }
    );
    const updatedUser = await query.select("-password -__v");
    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const query = User.findById(req.user._id);
    const user = await query.select("-password -__v");
    if (!user) return next(new AppError("user not found", 404));
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    await Contact.deleteMany({ user: req.user._id });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
