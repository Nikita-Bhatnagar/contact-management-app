const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const port = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection successful");
  });

const server = app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
process.on("unhandledRejection", (err) => {
  console.log("umhandled rejection, shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
