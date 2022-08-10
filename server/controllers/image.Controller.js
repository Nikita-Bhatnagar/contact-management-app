const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary");
const AppError = require("./../utils/AppError");

let fileName = "";
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else cb(new AppError("Please upload image type file", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.single("image");
exports.uploadImageOnCloud = async (req, res, next) => {
  try {
    if (!req.file) return next();
    await cloudinary.v2.uploader.upload(
      `public/images/${fileName}`,
      { public_id: `${fileName}` },
      function (error, result) {
        if (error) return next(error);
        req.body.image = result.url;
      }
    );
    fs.unlink(`public/images/${fileName}`, (error) => {
      if (error) return;
    });
    next();
  } catch (err) {
    next(err);
  }
};
