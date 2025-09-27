import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Health check
  if (req.method === "GET") {
    return res.status(200).json({ success: true, message: "📧 Email server is running" });
  }

  // Only POST requests allowed
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { to, subject, text, html, from } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: to, subject, and text or html."
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: from || `"Tailor Me" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
