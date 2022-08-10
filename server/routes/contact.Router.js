const express = require("express");
const contactController = require("../controllers/contact.Controller");
const authController = require("./../controllers/auth.Controller");
const imageController = require("./../controllers/image.Controller");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(contactController.getContacts)
  .post(
    imageController.uploadImage,
    imageController.uploadImageOnCloud,
    contactController.createContact
  );
router
  .route("/:contactId")
  .get(contactController.getContactById)
  .patch(
    imageController.uploadImage,
    imageController.uploadImageOnCloud,
    contactController.updateContact
  )
  .delete(contactController.deleteContact);
module.exports = router;
