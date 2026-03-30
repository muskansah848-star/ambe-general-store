const PDFDocument = require('pdfkit');

const generateInvoice = (order, user, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Ambe General Store', { align: 'center' });
  doc.fontSize(12).text('Invoice', { align: 'center' });
  doc.moveDown();

  // Order info
  doc.fontSize(10)
    .text(`Invoice #: ${order._id}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .text(`Customer: ${user.name}`)
    .text(`Email: ${user.email}`)
    .moveDown();

  // Shipping
  const addr = order.shippingAddress;
  doc.text(`Shipping: ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`).moveDown();

  // Table header
  doc.font('Helvetica-Bold').text('Product', 50, doc.y, { width: 200 });
  doc.text('Qty', 260, doc.y - doc.currentLineHeight(), { width: 60 });
  doc.text('Price', 330, doc.y - doc.currentLineHeight(), { width: 80 });
  doc.text('Total', 420, doc.y - doc.currentLineHeight(), { width: 80 });
  doc.font('Helvetica').moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // Items
  order.orderItems.forEach((item) => {
    const y = doc.y + 5;
    doc.text(item.name, 50, y, { width: 200 });
    doc.text(item.quantity.toString(), 260, y, { width: 60 });
    doc.text(`Rs.${item.price}`, 330, y, { width: 80 });
    doc.text(`Rs.${item.price * item.quantity}`, 420, y, { width: 80 });
    doc.moveDown();
  });

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

  // Totals
  doc.font('Helvetica-Bold')
    .text(`Items Total: Rs.${order.itemsPrice}`, { align: 'right' })
    .text(`Shipping: Rs.${order.shippingPrice}`, { align: 'right' })
    .text(`Tax: Rs.${order.taxPrice}`, { align: 'right' })
    .text(`Grand Total: Rs.${order.totalPrice}`, { align: 'right' });

  doc.end();
};

module.exports = generateInvoice;
