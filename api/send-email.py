
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Try to load .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration - you'll need to set these environment variables
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL', 'noreply@gsdc.com')

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        to_email = data.get('to')
        subject = data.get('subject')
        html_content = data.get('html')
        from_email = data.get('from', SMTP_FROM_EMAIL)
        
        if not all([to_email, subject, html_content]):
            return jsonify({'error': 'Missing required fields: to, subject, html'}), 400
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        # Create HTML part
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # For development/testing, if no SMTP credentials are set, just log the email
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            logger.info(f"EMAIL WOULD BE SENT TO: {to_email}")
            logger.info(f"SUBJECT: {subject}")
            logger.info(f"CONTENT: {html_content}")
            return jsonify({'success': True, 'message': 'Email logged (no SMTP configured)'}), 200
        
        # Send email via SMTP
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return jsonify({'success': True, 'message': 'Email sent successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return jsonify({'error': f'Failed to send email: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'}), 200

if __name__ == '__main__':
    port = int(os.getenv('EMAIL_API_PORT', 5006))
    app.run(host='0.0.0.0', port=port, debug=True)
