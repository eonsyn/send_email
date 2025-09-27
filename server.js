const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API route
app.post("/send-email", async (req, res) => {
  const { to, subject, text, html, from } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const info = await transporter.sendMail({
      from: from || `"Tailor Me" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`📧 Email server running on http://localhost:${PORT}`));
