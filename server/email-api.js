const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

// Load environment variables
require("dotenv").config();

// Email configuration - load from environment variables only
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // For development, if no SMTP credentials, just log
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      console.log("EMAIL WOULD BE SENT:");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Content:", html);
      return res.json({
        success: true,
        message: "Email logged (development mode)",
      });
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.EMAIL_API_PORT || 5005;
app.listen(PORT, "localhost", () => {
  console.log(`Email API server running on port ${PORT}`);
  console.log(`Email API accessible at http://localhost:${PORT}/api/send-email`);
});
