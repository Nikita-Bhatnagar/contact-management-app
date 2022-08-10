const mongoose = require("mongoose");
const validator = require("validator");
const contactSchema = new mongoose.Schema({
  contact_name: {
    type: String,
    required: [true, "a contact must have a name"],
  },
  email: {
    type: String,

    validate: [validator.isEmail, "provide a valid email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      `Please provide a valid email address`,
    ],
  },
  phone_number: {
    type: [String],
    required: [true, "contact must have a phone number"],
    validate: [validatePhoneNumber, "Invalid length phone number"],
  },
  address: {
    type: String,
  },
  city: String,
  state: String,
  country: String,
  category: {
    type: String,
    enum: ["personal", "organizational", "other"],
    default: "other",
  },
  image: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "a contact must belong to a user"],
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

function validatePhoneNumber(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].length < 10 || arr[i].length > 12) return false;
  }
  return true;
}

const Contact = new mongoose.model("Contact", contactSchema);

module.exports = Contact;
