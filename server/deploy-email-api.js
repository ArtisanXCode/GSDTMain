
// Production Email API Server for gsdc-send-mail.etherauthority.io
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://gsdc.etherauthority.io',
      'https://www.gsdc.etherauthority.io',
      'https://gsdc-send-mail.etherauthority.io'
    ];
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      return callback(null, true);
    }
    
    // Allow replit dev domains for development
    if (origin.includes('replit.dev') || origin.includes('replit.co')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME || '',
    pass: process.env.SMTP_PASSWORD || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'GSDC Email API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'GSDC Email API',
    timestamp: new Date().toISOString(),
    smtp_configured: !!(process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD)
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Email API is working',
    timestamp: new Date().toISOString(),
    smtp_configured: !!(process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD),
    service: 'GSDC Email API'
  });
});

// GET endpoint for send-email (for testing)
app.get('/api/send-email', (req, res) => {
  res.json({ 
    message: 'Email API is running',
    method: 'Use POST to send emails',
    timestamp: new Date().toISOString(),
    service: 'GSDC Email API',
    status: 'OK'
  });
});

// Main email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;
    
    // Validation
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['to', 'subject', 'html']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check SMTP configuration
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      console.log('Development mode - Email would be sent:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('From:', from || 'noreply@gsdc.com');
      return res.json({ 
        success: true, 
        message: 'Email logged (development mode)',
        service: 'GSDC Email API'
      });
    }

    const mailOptions = {
      from: from || process.env.SMTP_FROM_EMAIL || 'noreply@gsdc.com',
      to,
      subject,
      html,
      replyTo: process.env.SMTP_REPLY_TO || from
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${to} - MessageId: ${info.messageId}`);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      service: 'GSDC Email API'
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message,
      service: 'GSDC Email API'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'GSDC Email API Server',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      test: '/api/test',
      sendEmail: '/api/send-email (POST)'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    service: 'GSDC Email API',
    availableEndpoints: ['/health', '/api/health', '/api/test', '/api/send-email']
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    service: 'GSDC Email API'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GSDC Email API Server running on port ${PORT}`);
  console.log(`Service URL: http://0.0.0.0:${PORT}`);
  console.log(`Production URL: https://gsdc-send-mail.etherauthority.io`);
  console.log(`SMTP Configuration: ${process.env.SMTP_USERNAME ? 'Configured' : 'Not configured (dev mode)'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
