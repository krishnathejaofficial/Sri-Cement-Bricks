import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderNotificationToAdmin(order) {
  const itemsList = order.items.map(i =>
    `<tr>
      <td style="padding:8px;border:1px solid #ddd">${i.productName}</td>
      <td style="padding:8px;border:1px solid #ddd">${i.quantity} units</td>
      <td style="padding:8px;border:1px solid #ddd">₹${i.price}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `🧱 New Order #${order.orderCode} - ${order.customerName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#c2410c;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="margin:0">New Order Received</h1>
          <p style="margin:5px 0 0">Order Code: <strong>${order.orderCode}</strong></p>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #ddd">
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
          <p><strong>Delivery Location:</strong> ${order.deliveryLocation}</p>
          ${order.deliveryAddress ? `<p><strong>Full Address:</strong> ${order.deliveryAddress}</p>` : ''}
          <h2>Order Items</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left">Quantity</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left">Price</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          <h2>Price Breakdown</h2>
          <p><strong>Product Total:</strong> ₹${order.productTotal}</p>
          <p><strong>Transport Charges:</strong> ₹${order.transportCharge}</p>
          <p><strong>Labour Charges:</strong> ₹${order.labourCharge}</p>
          <p style="font-size:1.2em"><strong>GRAND TOTAL:</strong> ₹${order.totalAmount}</p>
          <p><strong>Payment Mode:</strong> ${order.paymentMode}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          ${order.advanceAmount ? `<p><strong>Advance Paid:</strong> ₹${order.advanceAmount}</p>` : ''}
          <p><strong>Special Notes:</strong> ${order.notes || 'None'}</p>
          <div style="background:#fef3c7;padding:15px;border-radius:6px;margin-top:20px">
            <p style="margin:0"><strong>⚠️ Action Required:</strong> Please review and confirm this order in the admin panel.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send error:', err);
  }
}

export async function sendOrderConfirmationToCustomer(order, customerEmail) {
  if (!customerEmail) return;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmed - #${order.orderCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#c2410c;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="margin:0">Order Received! 🧱</h1>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #ddd">
          <p>Dear ${order.customerName},</p>
          <p>Your order has been received successfully.</p>
          <p><strong>Your Order Code: <span style="font-size:1.5em;color:#c2410c">${order.orderCode}</span></strong></p>
          <p>Use this code to track your order on our website.</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p>Our team will contact you shortly to confirm your order.</p>
          <p>Thank you for choosing us!</p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Customer email error:', err);
  }
}
