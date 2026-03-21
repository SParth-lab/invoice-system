/**
 * Seed script: populates a default user and 4 initial companies linked to that user
 * Run: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Company = require("./models/Company");
const User = require("./models/User");

const SEED_COMPANIES = [
  {
    name: "Sunday Fashion",
    gst: "24AELPI2850K1ZF",
    address:
      "2nd Floor, Plot No. 147, Room No. 6, Varsha Co. Op. Housing Society, Matawadi, Varachha, Surat, Gujarat – 395006",
  },
  {
    name: "Shiva Fashion",
    gst: "24ANTPI0909C1Z9",
    address:
      "2nd Floor, Plot No. 146, Room No. 1, Varsha Co. Op. Housing Society-1, Varsha Road, Bajrang Apartment, Varachha, Surat, Gujarat – 395006",
  },
  {
    name: "Royal Garments",
    gst: "24BCDEF1234G1ZH",
    address:
      "Shop No. 12, Kapodra Market, Ring Road, Surat, Gujarat – 395004",
  },
  {
    name: "Sunrise Textiles",
    gst: "24XYZAB5678K1ZQ",
    address:
      "Plot No. 88, GIDC Estate, Pandesara, Surat, Gujarat – 395010",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing companies and optionally test user (but avoid clearing other users for safety)
    await Company.deleteMany({});
    console.log("🗑️  Cleared existing companies");

    await User.deleteOne({ email: "admin@seed.com" });
    console.log("🗑️  Cleared existing seed user");

    // 1. Create a default seed user
    const seedUser = await User.create({
      name: "Seed Admin",
      email: "admin@seed.com",
      password: "password123", // Will be hashed via pre-save hook
    });
    console.log(`👤 Created seed user: admin@seed.com (password: password123)`);

    // 2. Map all companies to belong to this seed user
    const companiesToInsert = SEED_COMPANIES.map(company => ({
      ...company,
      userId: seedUser._id
    }));

    // Insert seed data
    const created = await Company.insertMany(companiesToInsert);
    console.log(`🌱 Seeded ${created.length} companies:`);
    created.forEach((c) => console.log(`   - ${c.name} (${c.gst})`));

    await mongoose.disconnect();
    console.log("✅ Done. MongoDB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
