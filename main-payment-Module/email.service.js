// modules/email/email.service.js
const nodemailer = require('nodemailer');
const { email: emailCfg, product } = require('../../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailCfg.user,
    pass: emailCfg.appPassword,
  },
});

const buildEmailHtml = ({ buyerName, paymentId }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f7f2ea;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2ea;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0c0a;border-radius:6px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:40px 48px 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
            <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c8973a;">
              Digital Product · Instant Access
            </p>
            <h1 style="margin:12px 0 0;font-size:36px;font-weight:700;color:#f7f2ea;line-height:1.1;">
              Your ebook is<br/><em style="color:#c8973a;">ready to read</em>
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 48px;">
            <p style="margin:0 0 24px;font-size:15px;color:rgba(247,242,234,0.7);line-height:1.8;">
              Hi ${buyerName || 'there'},<br/><br/>
              Thank you for purchasing <strong style="color:#f7f2ea;">${product.title}</strong>.
              Your payment was successful and your ebook is ready to download right now.
            </p>

            <!-- Download Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:linear-gradient(135deg,#c8973a,#a87628);border-radius:3px;">
                  <a href="${product.downloadUrl}"
                     style="display:inline-block;padding:15px 36px;color:#0f0c0a;font-family:sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">
                    📖 Download My Ebook
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:rgba(247,242,234,0.4);line-height:1.7;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 32px;font-size:12px;word-break:break-all;">
              <a href="${product.downloadUrl}" style="color:#c8973a;">${product.downloadUrl}</a>
            </p>

            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin-bottom:28px;"/>

            <p style="margin:0;font-size:12px;color:rgba(247,242,234,0.3);line-height:1.7;">
              Payment ID: ${paymentId}<br/>
              Questions? Reply to this email — ${product.sellerName}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 48px;background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;font-size:11px;color:rgba(247,242,234,0.2);text-align:center;letter-spacing:0.05em;">
              © ${new Date().getFullYear()} ${product.sellerName} · Digital Product Delivery
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const sendEbookEmail = async ({ buyerName, buyerEmail, paymentId }) => {
  const info = await transporter.sendMail({
    from:    `"${product.sellerName}" <${emailCfg.user}>`,
    to:      buyerEmail,
    subject: `📖 Your copy of "${product.title}" is here!`,
    html:    buildEmailHtml({ buyerName, paymentId }),
  });

  return info;
};

module.exports = { sendEbookEmail };
