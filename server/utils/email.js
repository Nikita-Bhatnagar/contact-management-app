const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const source = fs.readFileSync(
    path.join(__dirname, "./password.Reset.handlebars"),

    "utf8"
  );

  const compiledTemplate = handlebars.compile(source);

  const emailOptions = {
    from: "nikita<bhatnagarnikita.02@gmail.com",
    to: options.email,
    subject: options.subject,
    html: compiledTemplate(options.payload),
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
