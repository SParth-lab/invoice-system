const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    gst: {
      type: String,
      required: [true, "GST number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    themeColor: {
      type: String,
      default: "#CC0000",
      trim: true,
    },
    invoicePrefix: {
      type: String,
      default: "",
      trim: true,
    },
    lastInvoiceSequence: {
      type: Number,
      default: 0,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    pdfTemplate: {
      type: String,
      enum: ["standard", "modern", "minimal"],
      default: "standard",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
