const { createTransporter } = require('../config/mailer');

/**
 * Send RSVP confirmation email to guest
 * @param {Object} options - Email options
 * @param {string} options.to - Guest email address
 * @param {string} options.guestName - Guest's name
 * @param {Object} options.wedding - Wedding object with couple names and details
 * @param {string} options.rsvpStatus - RSVP status (attending/declined/maybe)
 * @param {number} options.attendeesCount - Number of attendees
 * @param {string} options.publicLink - Public wedding website link
 */
const sendRsvpConfirmationEmail = async ({
  to,
  guestName,
  wedding,
  rsvpStatus,
  attendeesCount,
  publicLink,
  isDeclined = false
}) => {
  const transporter = createTransporter();

  const statusText = rsvpStatus === 'attending' 
    ? 'confirmed your attendance' 
    : rsvpStatus === 'declined' 
    ? 'declined the invitation' 
    : 'marked as maybe';

  const statusEmoji = rsvpStatus === 'attending' ? '✅' : rsvpStatus === 'declined' ? '❌' : '🤔';

  const coupleName = `${wedding.groomName} & ${wedding.brideName}`;
  const weddingDate = new Date(wedding.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const location = wedding.city && wedding.venue 
    ? `${wedding.venue}, ${wedding.city}` 
    : wedding.venue || wedding.city || 'Location TBA';
  
  // For declined guests, send simpler email
  if (isDeclined) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Response Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                RSVP Response Received
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${guestName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Thank you for your response to <strong>${coupleName}</strong>'s wedding invitation.
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                We've received your RSVP and understand that you won't be able to join us. You will be missed, but we completely understand. Thank you for letting us know.
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                If your plans change, you can always update your RSVP using the link you received earlier.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #888888;">
                Warm regards,
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #888888;">
                ${coupleName}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Hi ${guestName},

Thank you for your response to ${coupleName}'s wedding invitation.

We've received your RSVP and understand that you won't be able to join us. You will be missed, but we completely understand. Thank you for letting us know.

If your plans change, you can always update your RSVP using the link you received earlier.

Warm regards,
${coupleName}
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `RSVP Response Received - ${coupleName}'s Wedding`,
      text: textContent,
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('RSVP decline acknowledgment sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending RSVP decline email:', error);
      throw error;
    }
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${statusEmoji} RSVP Confirmed!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${guestName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Thank you for your RSVP! We've received your response for the wedding of <strong>${coupleName}</strong>.
              </p>

              <!-- RSVP Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #667eea;">Your RSVP Details:</h2>
                    <p style="margin: 5px 0; font-size: 15px; color: #555555;">
                      <strong>Status:</strong> ${rsvpStatus.charAt(0).toUpperCase() + rsvpStatus.slice(1)} ${statusEmoji}
                    </p>
                    ${rsvpStatus === 'attending' ? `
                    <p style="margin: 5px 0; font-size: 15px; color: #555555;">
                      <strong>Number of Attendees:</strong> ${attendeesCount}
                    </p>
                    ` : ''}
                    <p style="margin: 5px 0; font-size: 15px; color: #555555;">
                      <strong>Wedding Date:</strong> ${weddingDate}
                    </p>
                    <p style="margin: 5px 0; font-size: 15px; color: #555555;">
                      <strong>Location:</strong> ${location}
                    </p>
                  </td>
                </tr>
              </table>

              ${rsvpStatus === 'attending' ? `
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                We're thrilled you'll be joining us for this special day! 🎉
              </p>
              ` : ''}

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Click the button below to view the full wedding invitation and get all the details:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${publicLink}" 
                       style="display: inline-block; padding: 16px 40px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600;">
                      View Your Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you need to update your RSVP, please use your invitation link above or contact the couple directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #888888;">
                Looking forward to celebrating with you!
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #888888;">
                ${coupleName}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Hi ${guestName},

Thank you for your RSVP! We've received your response for the wedding of ${coupleName}.

Your RSVP Details:
- Status: ${rsvpStatus.charAt(0).toUpperCase() + rsvpStatus.slice(1)}
${rsvpStatus === 'attending' ? `- Number of Attendees: ${attendeesCount}` : ''}
- Wedding Date: ${weddingDate}
- Location: ${location}

${rsvpStatus === 'attending' ? "We're thrilled you'll be joining us for this special day!" : ''}

View your full invitation here: ${publicLink}

If you need to update your RSVP, please use your invitation link above or contact the couple directly.

Looking forward to celebrating with you!
${coupleName}
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `RSVP Confirmed - ${coupleName}'s Wedding`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('RSVP confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending RSVP confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendRsvpConfirmationEmail,
};
