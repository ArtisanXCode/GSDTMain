const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Simple in-memory cache for transporter (avoid creating multiple connections)
let transporter = null;

app.post('/api/send-email-smtp', async (req, res) => {
  try {
    const { to, subject, html, from, smtpConfig } = req.body;
    
    if (!to || !subject || !html || !smtpConfig) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, html, smtpConfig' 
      });
    }

    // Create or reuse transporter
    if (!transporter) {
      console.log('Creating SMTP transporter with config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        username: smtpConfig.username,
        password: '***HIDDEN***'
      });

      transporter = nodemailer.createTransporter({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465, // true for 465, false for other ports
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      // Verify connection configuration
      try {
        await transporter.verify();
        console.log('✅ SMTP server connection verified successfully');
      } catch (error) {
        console.error('❌ SMTP server connection failed:', error.message);
        transporter = null; // Reset transporter on failure
        return res.status(500).json({ 
          success: false, 
          error: 'SMTP connection failed', 
          details: error.message 
        });
      }
    }

    const mailOptions = {
      from: from || smtpConfig.username,
      to: to,
      subject: subject,
      html: html
    };

    console.log('📧 Sending email...', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      response: info.response
    });

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Reset transporter on authentication errors
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      transporter = null;
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email', 
      details: error.message,
      code: error.code
    });
  }
});

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    let smtpStatus = 'Not configured';
    
    if (process.env.VITE_SMTP_USERNAME && process.env.VITE_SMTP_PASSWORD) {
      try {
        const testTransporter = nodemailer.createTransporter({
          host: process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.VITE_SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.VITE_SMTP_USERNAME,
            pass: process.env.VITE_SMTP_PASSWORD
          }
        });
        
        await testTransporter.verify();
        smtpStatus = 'Connected';
        testTransporter.close();
      } catch (error) {
        smtpStatus = `Error: ${error.message}`;
      }
    }
    
    res.json({ 
      status: 'OK',
      service: 'SMTP Email API',
      smtpStatus,
      timestamp: new Date().toISOString(),
      environment: {
        host: process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
        port: process.env.VITE_SMTP_PORT || '587',
        username: process.env.VITE_SMTP_USERNAME ? '✅ Set' : '❌ Missing',
        password: process.env.VITE_SMTP_PASSWORD ? '✅ Set' : '❌ Missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SMTP Email API Server',
    endpoints: {
      health: '/health',
      sendEmail: '/api/send-email-smtp'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.SMTP_API_PORT || 5002;

app.listen(PORT, '0.0.0.0', (error) => {
  if (error) {
    console.error('Failed to start SMTP API server:', error);
    process.exit(1);
  }
  
  console.log(`🚀 SMTP Email API server running on port ${PORT}`);
  console.log(`📧 SMTP API accessible at http://0.0.0.0:${PORT}/api/send-email-smtp`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📧 Shutting down SMTP Email API server...');
  if (transporter) {
    transporter.close();
  }
  process.exit(0);
});