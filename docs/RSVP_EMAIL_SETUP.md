# RSVP Confirmation Email Setup

This feature sends automated confirmation emails to guests after they submit their RSVP.

## Features
- ✅ Beautiful HTML email template
- ✅ RSVP status confirmation (attending/declined/maybe)
- ✅ "View Your Invitation" button linking to `/wedding/:token`
- ✅ Wedding details summary (date, venue, couple names)
- ✅ Attendee count for confirmed guests
- ✅ Plain text fallback for email clients

## Required Environment Variables

Add these to your `.env` file:

```bash
# Frontend URL (required for generating public links)
FRONTEND_URL=http://localhost:3000

# SMTP Configuration (required for sending emails)
SMTP_HOST=smtp.gmail.com           # SMTP server hostname
SMTP_PORT=587                       # Port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                   # true for port 465, false for other ports
SMTP_USER=your-email@gmail.com     # Your email address
SMTP_PASS=your-app-password        # App-specific password (NOT your regular password)
SMTP_FROM=your-email@gmail.com     # "From" email address (optional, defaults to SMTP_USER)
```

## Gmail Setup

If using Gmail, you need to create an **App Password**:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to **Security** → **App passwords**
4. Generate a new app password for "Mail"
5. Use this 16-character password as `SMTP_PASS`

**Note:** Never use your regular Gmail password in the app!

## Other Email Providers

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your-mailgun-smtp-password
```

### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## How It Works

1. **Guest submits RSVP** → `POST /api/guests/rsvp/:token`
2. **Backend saves RSVP** → Updates guest record in database
3. **Email is sent** → Uses `sendRsvpConfirmationEmail()` utility
4. **Guest receives email** → Contains button to view full wedding website at `/wedding/:token`

## Email Content

The confirmation email includes:
- Personalized greeting with guest's name
- RSVP status confirmation with emoji (✅/❌/🤔)
- Number of attendees (if attending)
- Wedding date and venue
- "View Your Invitation" button → links to `/wedding/:token`
- Couple's names and message

## API Response

After successful RSVP submission, the response includes:
```json
{
  "success": true,
  "message": "RSVP submitted successfully",
  "guest": { /* guest object */ },
  "publicLink": "http://localhost:3000/wedding/abc123..."
}
```

## Error Handling

- If email sending fails, the RSVP is still saved successfully
- Error is logged to console but doesn't block the response
- Guest receives success response even if email fails

## Testing

1. Ensure all environment variables are set
2. Submit an RSVP via the frontend or API
3. Check console logs for email confirmation
4. Verify email arrives in guest's inbox
5. Click "View Your Invitation" button to test the link

## Files Modified/Created

- `src/config/mailer.js` - Nodemailer transporter configuration
- `src/utils/emailTemplates.js` - Email template utility
- `src/controllers/guestController.js` - Added email sending to `submitRSVP`
- `.env.example` - Documented required environment variables

## Dependencies

- `nodemailer` - Email sending library (already installed)
