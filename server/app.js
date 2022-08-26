const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/user.Router");
const contactRouter = require("./routes/contact.Router");
const errorHandler = require("./controllers/error.Controller");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "Content-Type",
    "Authorization"
  );
  next();
});

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/client/build/index.html"));
  });
}

//app.use(express.bodyParser(x - www - form - urlencoded));
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/contacts", contactRouter);

app.use(errorHandler);
module.exports = app;
