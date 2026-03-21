const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Seller is required"],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Buyer is required"],
    },
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one item is required",
      },
    },
    gstRate: {
      label: { type: String, required: true },
      cgst: { type: Number, required: true, min: 0 },
      sgst: { type: Number, required: true, min: 0 },
    },
    subtotal: { type: Number, default: 0 },
    cgstAmt: { type: Number, default: 0 },
    sgstAmt: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    terms: {
      type: String,
      default:
        "1. Goods Once Sold Will Not Be Accepted.\n2. Interest @ 24% will be charged from the due date.\n3. Subject to SURAT Jurisdiction Only. E.&.O.E",
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: compute item totals and invoice totals
invoiceSchema.pre("save", function (next) {
  // Compute each item's total
  this.items.forEach((item) => {
    item.total = item.qty * item.unitPrice;
  });

  // Compute subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Compute tax
  this.cgstAmt = (this.subtotal * this.gstRate.cgst) / 100;
  this.sgstAmt = (this.subtotal * this.gstRate.sgst) / 100;
  this.grandTotal = this.subtotal + this.cgstAmt + this.sgstAmt;

  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
