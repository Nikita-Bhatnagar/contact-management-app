const express = require("express");
const userController = require("./../controllers/user.Controller");
const authController = require("./../controllers/auth.Controller");
const imageController = require("./../controllers/image.Controller");
const router = express.Router();

router
  .route("/signup")
  .post(
    imageController.uploadImage,
    imageController.uploadImageOnCloud,
    authController.signup
  );
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router
  .route("/")
  .get(authController.protect, userController.getMe)
  .patch(
    authController.protect,
    imageController.uploadImage,
    imageController.uploadImageOnCloud,
    userController.updateMe
  )
  .delete(authController.protect, userController.deleteMe);

module.exports = router;
