const express = require("express");
const app = express();
const userRouter = require("./routes/user.Router");
const contactRouter = require("./routes/contact.Router");
const errorHandler = require("./controllers/error.Controller");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer();
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/contacts", contactRouter);

app.use(errorHandler);
module.exports = app;
