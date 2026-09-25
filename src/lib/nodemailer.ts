
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
          user: 'varun60degreedigital@gmail.com',
          pass: 'wdux jztw nwlw ywjl',
      }
    });
// 2. Pass variables into the function so it can be reused dynamically
async function sendBookingConfirmation(bookingDetails:any) {
  const {
    email,
    firstName,
    lastName,
    bookingNumber,
    reservationNumber,
    checkIn,
    checkOut,
    hotel_name,
    totalGuests,
    totalPrice
  } = bookingDetails;

 const mailOptions = {
  // Display name with fallback to SMTP user
  from: `"${hotel_name}" <${process.env.SMTP_USER}>`,
  to: email,
  subject: `Booking Confirmed! Your stay at ${hotel_name} (#${bookingNumber})`,
  
  // Plain text version (Crucial for spam deliverability & accessibility)
  text: `
Dear ${firstName} ${lastName},

Thank you for your booking! Your payment has been successfully processed.

BOOKING DETAILS:
- Hotel: ${hotel_name}
- Booking Number: ${bookingNumber}
- Reservation Number: ${reservationNumber}
- Check-in: ${checkIn}
- Check-out: ${checkOut}
- Guests: ${totalGuests}
- Total Paid: $${parseFloat(totalPrice.toString()).toFixed(2)}

View your booking details online: ${process.env.FRONTEND_URL}/booking/${bookingNumber}

If you have any questions, please feel free to reach out to us.

Warm regards,
${hotel_name} Team
  `.trim(),

  // Responsive, Outlook-friendly HTML version
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        /* Mobile adjustments */
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
          .mobile-padding { padding: 15px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; -webkit-text-size-adjust: 100%;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 30px 0;">
        <tr>
          <td align="center">
            
            <!-- Main Container -->
            <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #1A2B4C; padding: 35px 20px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; color: #ffffff;">
                    ${hotel_name}
                  </h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #D1D5DB; text-transform: uppercase; letter-spacing: 1px;">
                    Booking Confirmation
                  </p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td class="mobile-padding" style="padding: 30px 40px;">
                  
                  <p style="font-size: 16px; margin: 0 0 15px 0; color: #111827;">
                    Dear <strong>${firstName} ${lastName}</strong>,
                  </p>
                  <p style="font-size: 15px; line-height: 1.5; color: #4B5563; margin: 0 0 25px 0;">
                    We are delighted to confirm your reservation! Your payment has been successfully processed, and we are preparing for your arrival.
                  </p>

                  <!-- Dates Highlight Block -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 25px;">
                    <tr>
                      <td class="stack-column" width="50%" style="padding: 15px; text-align: center; border-right: 1px solid #E2E8F0;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: bold; letter-spacing: 0.5px;">Check-In</span>
                        <div style="font-size: 16px; font-weight: bold; color: #1E293B; margin-top: 4px;">${checkIn}</div>
                      </td>
                      <td class="stack-column" width="50%" style="padding: 15px; text-align: center;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: bold; letter-spacing: 0.5px;">Check-Out</span>
                        <div style="font-size: 16px; font-weight: bold; color: #1E293B; margin-top: 4px;">${checkOut}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Details Table -->
                  <h3 style="font-size: 16px; color: #1E293B; margin: 0 0 12px 0; border-bottom: 2px solid #F1F5F9; padding-bottom: 8px;">
                    Reservation Summary
                  </h3>

                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                    <tr>
                      <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Booking Reference</td>
                      <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${bookingNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Reservation ID</td>
                      <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${reservationNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Guests</td>
                      <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${totalGuests} Guest(s)</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; font-size: 15px; font-weight: bold; color: #0F172A;">Total Paid</td>
                      <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #166534;">
                        $${parseFloat(totalPrice.toString()).toFixed(2)}
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 20px;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL}/booking/${bookingNumber}" 
                           target="_blank" 
                           style="background-color: #1A2B4C; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                          Manage Your Reservation
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin-top: 25px; text-align: center;">
                    Need to make changes or have questions? Contact us through our website or reply directly to your booking portal.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.4;">
                    This is an automated confirmation email for your stay at <strong>${hotel_name}</strong>.
                  </p>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: #9CA3AF;">
                    &copy; ${new Date().getFullYear()} ${hotel_name}. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
};

  // 3. Add Try/Catch for proper error handling
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    // Depending on your setup, you might want to throw the error to be handled by your controller
    throw new Error('Failed to send email'); 
  }
}


export default sendBookingConfirmation ;