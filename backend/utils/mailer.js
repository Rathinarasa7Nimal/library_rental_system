const nodemailer = require("nodemailer");

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends the rental confirmation email after a successful checkout.
 * Never throws to the caller on failure - checkout should still succeed
 * even if email delivery has a problem; the error is just logged.
 */
async function sendRentalConfirmation({ to, order }) {
  const rows = order.books
    .map(
      (b) =>
        `<tr><td>${b.title}</td><td>${b.format}</td><td>${b.count}</td><td>Rs. ${b.lineFee}</td></tr>`
    )
    .join("");

  const html = `
    <h2>Rental Confirmed</h2>
    <p>Order ID: <b>${order._id}</b></p>
    <p>Rental Date: ${new Date(order.rentDate).toDateString()}</p>
    <p>Due Date: ${new Date(order.rentCloseDate).toDateString()}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Title</th><th>Format</th><th>Qty</th><th>Fee</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><b>Total Rental Fee: Rs. ${order.totalFee}</b></p>
    <p>Please return your books by the due date to avoid late fees.</p>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Rental Confirmation - Order ${order._id}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send rental confirmation email:", err.message);
  }
}

module.exports = { sendRentalConfirmation };
