
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Enable CORS for all origins in development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all replit.dev domains
    if (origin.includes('.replit.dev') || origin.includes('.replit.co')) {
      return callback(null, true);
    }
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow production domains
    if (origin.includes('etherauthority.io') || origin.includes('gsdc.')) {
      return callback(null, true);
    }
    // Allow all origins in development
    return callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Add explicit CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Max-Age', '3600');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME || '',
    pass: process.env.SMTP_PASSWORD || ''
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For development, if no SMTP credentials, just log
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      console.log('EMAIL WOULD BE SENT:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      return res.json({ success: true, message: 'Email logged (development mode)' });
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM_EMAIL || 'noreply@gsdc.com',
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    res.json({ success: true, message: 'Email sent successfully' });
    
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'Email API Server Running',
    timestamp: new Date().toISOString(),
    port: PORT,
    endpoints: {
      test: '/api/test',
      sendEmail: '/api/send-email',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Email API is working', 
    timestamp: new Date().toISOString(),
    port: PORT,
    smtp_configured: !!process.env.SMTP_USERNAME
  });
});

const PORT = process.env.EMAIL_API_PORT || 5001;

// Add a health check endpoint for production
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Email API server running on port ${PORT}`);
  console.log(`Email API accessible at http://0.0.0.0:${PORT}/api/send-email`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`Production URL should be: https://gsdc.etherauthority.io:${PORT}/api/send-email`);
  console.log(`SMTP Config: ${process.env.SMTP_USERNAME ? 'Configured' : 'Not configured (dev mode)'}`);
});
