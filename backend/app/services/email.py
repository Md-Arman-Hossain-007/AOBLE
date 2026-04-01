import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings

def send_email(email_to: str, subject: str, content: str):
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP settings not configured. Email NOT sent.")
        print(f"To: {email_to}")
        print(f"Subject: {subject}")
        print(f"Content: {content}")
        return

    message = MIMEMultipart()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = subject
    message.attach(MIMEText(content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        print(f"Email successfully sent to {email_to}")
    except Exception as e:
        print(f"Error sending email to {email_to}: {e}")

def send_reset_password_email(email_to: str, token: str):
    subject = f"{settings.PROJECT_NAME} - Password Reset"
    reset_link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    
    # Basic HTML Content
    content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your {settings.PROJECT_NAME} account. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.875rem; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 0.875rem; color: #2563eb; word-break: break-all;">{reset_link}</p>
            </div>
        </body>
    </html>
    """
    send_email(email_to, subject, content)

def send_password_reset_email(email_to: str, full_name: str, reset_token: str):
    """Send password reset email (alias for send_reset_password_email)"""
    send_reset_password_email(email_to, reset_token)

def send_welcome_email(email_to: str, full_name: str):
    """Send welcome email to new users"""
    subject = f"Welcome to {settings.PROJECT_NAME}!"
    
    # Basic HTML Content
    content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Welcome to {settings.PROJECT_NAME}!</h2>
                <p>Hello {full_name},</p>
                <p>Thank you for joining {settings.PROJECT_NAME}. Your account has been successfully created and you can now access all our features.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.FRONTEND_HOST}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started</a>
                </div>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <p>Best regards,<br>The {settings.PROJECT_NAME} Team</p>
            </div>
        </body>
    </html>
    """
    send_email(email_to, subject, content)
