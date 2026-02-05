'use client'

interface InvoiceData {
  id: string
  invoice_number: string
  sale_date: string
  customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  shop: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total: number
  }>
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method?: string
  notes?: string
}

export function generateInvoicePDF(invoice: InvoiceData) {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      border-bottom: 2px solid #22c55e;
      padding-bottom: 20px;
    }
    .company-info h1 {
      margin: 0;
      color: #22c55e;
      font-size: 28px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      font-size: 24px;
    }
    .details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .section {
      flex: 1;
    }
    .section h3 {
      margin-top: 0;
      color: #22c55e;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #22c55e;
      color: white;
      padding: 10px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals table {
      margin-bottom: 0;
    }
    .totals td {
      border: none;
      padding: 5px 10px;
    }
    .totals tr:last-child td {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #22c55e;
      padding-top: 10px;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-left: 4px solid #22c55e;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${invoice.shop.name}</h1>
      ${invoice.shop.address ? `<p>${invoice.shop.address}</p>` : ''}
      ${invoice.shop.phone ? `<p>Phone: ${invoice.shop.phone}</p>` : ''}
      ${invoice.shop.email ? `<p>Email: ${invoice.shop.email}</p>` : ''}
    </div>
    <div class="invoice-info">
      <h2>INVOICE</h2>
      <p><strong>#${invoice.invoice_number}</strong></p>
      <p>Date: ${new Date(invoice.sale_date).toLocaleDateString()}</p>
    </div>
  </div>

  <div class="details">
    <div class="section">
      <h3>Bill To:</h3>
      ${invoice.customer ? `
        <p><strong>${invoice.customer.name}</strong></p>
        ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ''}
        ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ''}
        ${invoice.customer.address ? `<p>${invoice.customer.address}</p>` : ''}
      ` : '<p>Walk-in Customer</p>'}
    </div>
    <div class="section">
      <h3>Payment Details:</h3>
      <p>Method: ${invoice.payment_method || 'Cash'}</p>
      <p>Status: Paid</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align: right;">Quantity</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td style="text-align: right;">${item.quantity}</td>
          <td style="text-align: right;">৳${item.unit_price.toFixed(2)}</td>
          <td style="text-align: right;">৳${item.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">৳${invoice.subtotal.toFixed(2)}</td>
      </tr>
      ${invoice.discount_amount > 0 ? `
        <tr>
          <td>Discount:</td>
          <td style="text-align: right;">-৳${invoice.discount_amount.toFixed(2)}</td>
        </tr>
      ` : ''}
      ${invoice.tax_amount > 0 ? `
        <tr>
          <td>Tax:</td>
          <td style="text-align: right;">৳${invoice.tax_amount.toFixed(2)}</td>
        </tr>
      ` : ''}
      <tr>
        <td>Total:</td>
        <td style="text-align: right;">৳${invoice.total_amount.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  ${invoice.notes ? `
    <div class="notes">
      <strong>Notes:</strong>
      <p>${invoice.notes}</p>
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>
  `

  // Create a new window with the invoice content
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(content)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

export function downloadInvoicePDF(invoice: InvoiceData) {
  // For a more robust solution, you would use a library like jsPDF
  // This is a simple implementation that opens print dialog
  generateInvoicePDF(invoice)
}
