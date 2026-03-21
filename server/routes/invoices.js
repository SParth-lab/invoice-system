const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

// All invoice routes require authentication
router.use(auth);

// ── Helper: amount to words (Indian system) ──
function toWords(amount) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const inWords = (n) => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10] + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + "Crore " + inWords(n % 10000000);
  };
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = (inWords(rupees) || "Zero ") + "Rupees";
  if (paise > 0) result += " and " + inWords(paise) + "Paise";
  return result.trim() + " Only";
}

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// GET /api/invoices — list all
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate("seller", "name gst")
      .populate("buyer", "name gst")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id — get single
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id })
      .populate("seller")
      .populate("buyer");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices — create
router.post("/", async (req, res) => {
  try {
    const invoice = new Invoice({ ...req.body, user: req.user._id });
    await invoice.save(); // triggers pre-save hook for totals
    const populated = await Invoice.findById(invoice._id)
      .populate("seller")
      .populate("buyer");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Invoice number already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/invoices/:id — update
router.put("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    // Update fields
    Object.assign(invoice, req.body);
    await invoice.save(); // triggers pre-save hook

    const populated = await Invoice.findById(invoice._id)
      .populate("seller")
      .populate("buyer");
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/invoices/:id — delete
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id/pdf — generate PDF (matching reference invoice format)
router.get("/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id })
      .populate("seller")
      .populate("buyer");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const doc = new PDFDocument({ size: "A4", margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Invoice-${invoice.invoiceNo}.pdf"`
    );
    doc.pipe(res);

    const pageW = doc.page.width - 60;
    const left = 30;
    const right = left + pageW;
    let y = 30;

    // Helper: draw filled rect
    const fillRect = (x, _y, w, h, color) => {
      doc.save().rect(x, _y, w, h).fill(color).restore();
    };

    // Helper: draw bordered row
    const drawLine = (_y) => {
      doc.moveTo(left, _y).lineTo(right, _y).strokeColor("#000").lineWidth(0.5).stroke();
    };

    // ═══════════════════════════════════════════════
    // HEADER — Seller company name (bold, large, red)
    // ═══════════════════════════════════════════════
    fillRect(left, y, pageW, 36, "#FFF3E0");
    doc.font("Helvetica-Bold").fontSize(24).fillColor("#CC0000");
    doc.text(invoice.seller.name.toUpperCase(), left, y + 6, { width: pageW, align: "center" });
    y += 38;

    // Seller address
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text(invoice.seller.address, left, y, { width: pageW, align: "center" });
    y += 14;

    // GST Number
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000");
    doc.text(`GST NO. ${invoice.seller.gst}`, left, y, { width: pageW, align: "center" });
    y += 20;
    drawLine(y);

    // ═══════════════════════════════════════════════
    // TAX INVOICE + INVOICE META (right side)
    // ═══════════════════════════════════════════════
    const metaStartY = y + 2;
    const halfW = pageW / 2;
    const midX = left + halfW;

    doc.font("Helvetica-Bold").fontSize(14).fillColor("#000");
    doc.text("TAX INVOICE", left + 10, metaStartY + 8, { width: halfW - 20 });

    // Right side meta
    const metaLabelX = midX + 10;
    const metaValueX = midX + halfW / 2 + 10;
    const metaW = halfW / 2 - 20;

    const invoiceDateStr = new Date(invoice.invoiceDate).toLocaleDateString("en-IN");
    const dueDays = Math.round((new Date(invoice.dueDate) - new Date(invoice.invoiceDate)) / (1000 * 60 * 60 * 24));

    drawLine(metaStartY);
    // Row 1
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text("Invoice No.", metaLabelX, metaStartY + 6, { width: metaW });
    doc.font("Helvetica").fillColor("#CC0000");
    doc.text(invoice.invoiceNo, metaValueX, metaStartY + 6, { width: metaW });

    // Row 2
    doc.font("Helvetica-Bold").fillColor("#000");
    doc.text("Invoice Date:", metaLabelX, metaStartY + 20, { width: metaW });
    doc.font("Helvetica");
    doc.text(invoiceDateStr, metaValueX, metaStartY + 20, { width: metaW });

    // Row 3
    doc.font("Helvetica-Bold");
    doc.text("Due Date:", metaLabelX, metaStartY + 34, { width: metaW });
    doc.font("Helvetica");
    doc.text(`${dueDays} DAY`, metaValueX, metaStartY + 34, { width: metaW });

    y = metaStartY + 52;
    drawLine(y);

    // ═══════════════════════════════════════════════
    // BILL TO / SHIP TO
    // ═══════════════════════════════════════════════
    y += 4;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text("BILL TO", left + 5, y, { width: halfW });
    doc.text("SHIP TO", midX + 5, y, { width: halfW });
    y += 14;

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#CC0000");
    doc.text(invoice.buyer.name.toUpperCase(), left + 5, y, { width: halfW - 10 });
    doc.text(invoice.buyer.name.toUpperCase(), midX + 5, y, { width: halfW - 10 });
    y += 14;

    doc.font("Helvetica").fontSize(8).fillColor("#000");
    doc.text(invoice.buyer.address, left + 5, y, { width: halfW - 10 });
    doc.text(invoice.buyer.address, midX + 5, y, { width: halfW - 10 });
    y += 28;

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text(`GST:- ${invoice.buyer.gst}`, left + 5, y, { width: halfW });
    doc.text(`GST:-${invoice.buyer.gst}`, midX + 5, y, { width: halfW });
    y += 16;
    drawLine(y);

    // ═══════════════════════════════════════════════
    // ITEMS TABLE
    // ═══════════════════════════════════════════════
    // Red header row
    fillRect(left, y, pageW, 18, "#CC0000");

    const colDesc = left + 5;
    const colQty = left + pageW * 0.55;
    const colPrice = left + pageW * 0.70;
    const colTotal = left + pageW * 0.85;
    const colDescW = pageW * 0.50;
    const colQtyW = pageW * 0.14;
    const colPriceW = pageW * 0.14;
    const colTotalW = pageW * 0.14;

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFF");
    doc.text("DESCRIPTION", colDesc, y + 4, { width: colDescW });
    doc.text("QTY", colQty, y + 4, { width: colQtyW, align: "center" });
    doc.text("UNIT PRICE", colPrice, y + 4, { width: colPriceW, align: "center" });
    doc.text("TOTAL", colTotal, y + 4, { width: colTotalW, align: "right" });
    y += 20;

    // Item rows
    doc.font("Helvetica").fontSize(9).fillColor("#000");
    invoice.items.forEach((item) => {
      drawLine(y);
      doc.text(item.description.toUpperCase(), colDesc, y + 4, { width: colDescW });
      doc.text(`${item.qty}`, colQty, y + 4, { width: colQtyW, align: "center" });
      doc.text(fmt(item.unitPrice), colPrice, y + 4, { width: colPriceW, align: "center" });
      doc.text(fmt(item.total), colTotal, y + 4, { width: colTotalW, align: "right" });
      y += 18;
    });

    // Empty rows to fill table (at least 6 rows total)
    const emptyRows = Math.max(0, 6 - invoice.items.length);
    for (let i = 0; i < emptyRows; i++) {
      drawLine(y);
      doc.text("", colDesc, y + 4, { width: colDescW });
      doc.text("", colQty, y + 4, { width: colQtyW });
      doc.text("", colPrice, y + 4, { width: colPriceW });
      doc.text(fmt(0), colTotal, y + 4, { width: colTotalW, align: "right" });
      y += 18;
    }
    drawLine(y);

    // Total Qty row
    y += 4;
    const totalQty = invoice.items.reduce((s, it) => s + it.qty, 0);
    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.text(`${totalQty}`, colQty, y, { width: colQtyW, align: "center" });
    y += 16;
    drawLine(y);

    // ═══════════════════════════════════════════════
    // TERMS + TOTALS side by side
    // ═══════════════════════════════════════════════
    const termsStartY = y + 4;
    const totalsLabelX = colQty - 20;
    const totalsValueX = colTotal;

    // Terms (left side)
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#CC0000");
    doc.text("Terms & Instructions", left + 5, termsStartY, { width: colDescW });

    doc.font("Helvetica").fontSize(8).fillColor("#000");
    const termsLines = (invoice.terms || "").split("\n");
    let termsY = termsStartY + 14;
    termsLines.forEach((line) => {
      doc.text(line, left + 5, termsY, { width: colDescW });
      termsY += 12;
    });

    // Totals (right side)
    let totY = termsStartY;

    // SUBTOTAL
    fillRect(totalsLabelX, totY, pageW - (totalsLabelX - left), 16, "#FFF3E0");
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text("SUBTOTAL", totalsLabelX + 5, totY + 3, { width: colPriceW + 20 });
    doc.text("₹", colTotal - 10, totY + 3, { width: 15, align: "right" });
    doc.text(fmt(invoice.subtotal), colTotal + 5, totY + 3, { width: colTotalW, align: "right" });
    totY += 18;

    // CGST
    doc.font("Helvetica").fontSize(9);
    doc.text("CGST", totalsLabelX + 5, totY + 3, { width: colPriceW + 20, align: "right" });
    doc.text(fmt(invoice.cgstAmt), colTotal + 5, totY + 3, { width: colTotalW, align: "right" });
    totY += 16;

    // SGST
    doc.text("SGST", totalsLabelX + 5, totY + 3, { width: colPriceW + 20, align: "right" });
    doc.text(fmt(invoice.sgstAmt), colTotal + 5, totY + 3, { width: colTotalW, align: "right" });
    totY += 16;

    // TOTAL TAX
    doc.font("Helvetica-Bold");
    doc.text("TOTAL TAX", totalsLabelX + 5, totY + 3, { width: colPriceW + 20, align: "right" });
    doc.text(fmt(invoice.cgstAmt + invoice.sgstAmt), colTotal + 5, totY + 3, { width: colTotalW, align: "right" });
    totY += 20;

    // TOTAL BILL AMOUNT (red background)
    fillRect(totalsLabelX, totY, pageW - (totalsLabelX - left), 20, "#FFE0E0");
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#CC0000");
    doc.text("TOTAL BILL AMOUNT", totalsLabelX + 5, totY + 4, { width: colPriceW + 20 });
    doc.text("₹", colTotal - 10, totY + 4, { width: 15, align: "right" });
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text(fmt(invoice.grandTotal), colTotal + 5, totY + 4, { width: colTotalW, align: "right" });
    totY += 24;

    // Amount in words
    const finalY = Math.max(termsY, totY) + 8;
    doc.font("Helvetica").fontSize(8).fillColor("#333");
    doc.text(`Amount in Words: ${toWords(invoice.grandTotal)}`, left + 5, finalY, { width: pageW });

    // Thank you message
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000");
    doc.text("Thank you for your business!", left + 5, finalY + 20, { width: halfW });

    // Authorized Signatory (right)
    doc.text("For " + invoice.seller.name, colTotal - 30, finalY + 20, { width: colTotalW + 40, align: "right" });
    doc.moveDown(2);
    doc.font("Helvetica").fontSize(8);
    doc.text("Authorized Signatory", colTotal - 30, finalY + 55, { width: colTotalW + 40, align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/next-number — get next invoice number
router.get("/next-number/generate", async (req, res) => {
  try {
    const last = await Invoice.findOne({ user: req.user._id }).sort({ createdAt: -1 }).select("invoiceNo");
    let nextNum = 1;
    if (last && last.invoiceNo) {
      const match = last.invoiceNo.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    res.json({ invoiceNo: `INV-${String(nextNum).padStart(3, "0")}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
