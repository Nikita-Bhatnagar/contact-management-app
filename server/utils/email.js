const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const emailOptions = {
    from: "nikita<bhatnagarnikita.02@gmail.com",
    to: options.email,
    text: options.message,
    subject: options.subject,
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
