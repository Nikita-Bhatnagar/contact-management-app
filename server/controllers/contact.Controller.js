const url = require("url");
const Contact = require("./../models/contact.Model");
const multer = require("multer");
const filterUpdateData = require("./../utils/filterUpdateData");
const AppError = require("./../utils/AppError");

exports.createContact = async (req, res, next) => {
  try {
    const newContact = await Contact.create({
      ...req.body,
      user: req.user._id,
    });
    newContact["__v"] = undefined;

    res.status(201).json({
      status: "success",
      data: newContact,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const updateData = filterUpdateData(
      ["user", "created_at", "updated_at"],
      req.body
    );

    const updateInfo = await Contact.updateOne(
      { _id: req.params.contactId, user: req.user._id },
      { ...updateData, updated_at: Date.now() },
      { runValidators: true }
    );
    if (updateInfo.modifiedCount == 0)
      return next(new AppError("No contact found with that id", 404));
    const query = Contact.findById(req.params.contactId);
    const updatedContact = await query.select("-__v");
    res.status(200).json({
      status: "success",
      data: updatedContact,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const deleteInfo = await Contact.deleteOne({
      _id: req.params.contactId,
      user: req.user._id,
    });
    if (deleteInfo.deletedCount == 0)
      return next(new AppError("No contact found with that id", 404));
    res.status(204).json({
      status: "success",
      data: deleteInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const { query } = url.parse(req.url, true);
    const fields = ["city", "state", "country", "contact_name"];
    const unsupportedFields = [
      "phone_number",
      "address",
      "image",
      "created_at",
      "updated_at",
    ];

    for (let key in query) {
      if (unsupportedFields.includes(key)) {
        return next(
          new AppError(
            `The parameter ${key} is not supported for searching.`,
            400
          )
        );
      }
    }

    for (let key in query) {
      if (fields.includes(key)) {
        query[key].replace("+", " ");
      }
    }
    const getQuery = Contact.find({ user: req.user._id, ...query });
    const contacts = await getQuery.select("-__v");
    res.status(200).json({
      status: "success",
      total_count: contacts.length,
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};
exports.getContactById = async (req, res, next) => {
  try {
    const query = Contact.find({
      user: req.user._id,
      _id: req.params.contactId,
    });
    const contact = await query.select("-__v");
    if (contact.length === 0)
      return next(new AppError("No contact found with that id", 404));
    res.status(200).json({
      status: "success",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};
