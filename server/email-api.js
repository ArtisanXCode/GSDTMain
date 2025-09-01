const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

// Email configuration - load from environment variables only
const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT) || 587,
  secure: import.meta.env.SMTP_SECURE === "true",
  auth: {
    user: import.meta.env.SMTP_USERNAME,
    pass: import.meta.env.SMTP_PASSWORD,
  },
});

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // For development, if no SMTP credentials, just log
    if (!import.meta.env.SMTP_USERNAME || !import.meta.env.SMTP_PASSWORD) {
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
      from: from || import.meta.env.SMTP_FROM_EMAIL,
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

const PORT = import.meta.env.EMAIL_API_PORT;
app.listen(PORT, "localhost", () => {
  console.log(`Email API server running on port ${PORT}`);
  console.log(
    `Email API accessible at http://localhost:${PORT}/api/send-email`,
  );
});
