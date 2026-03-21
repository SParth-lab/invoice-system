const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const auth = require("../middleware/auth");

// All company routes require authentication
router.use(auth);

// GET /api/companies — list all for auth user
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/companies/:id — get single
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, userId: req.user._id });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/companies — create
router.post("/", async (req, res) => {
  try {
    const company = await Company.create({ ...req.body, userId: req.user._id });
    res.status(201).json(company);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "A company with this GST number already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/companies/:id — update
router.put("/:id", async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/companies/:id — delete
router.delete("/:id", async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json({ message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
