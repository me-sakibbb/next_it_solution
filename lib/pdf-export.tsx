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

export type InvoiceSize = 'A4' | 'POS'

export function generateInvoicePDF(invoice: InvoiceData, size: InvoiceSize = 'A4') {
  const isPOS = size === 'POS'

  const content = isPOS ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 72mm; /* Standard width for 80mm paper allowing for margins */
      margin: 0 auto;
      padding: 4mm 2mm;
      font-size: 11pt;
      line-height: 1.2;
      color: #000;
      background: #fff;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 2mm 0; }
    .header { margin-bottom: 3mm; }
    .shop-name { font-size: 14pt; font-weight: bold; margin-bottom: 1mm; }
    .items-table { width: 100%; border-collapse: collapse; margin: 2mm 0; }
    .items-table th { text-align: left; border-bottom: 1px solid #000; padding: 1mm 0; font-size: 10pt; }
    .items-table td { padding: 1mm 0; vertical-align: top; font-size: 10pt; }
    .totals-area { margin-top: 2mm; }
    .footer { margin-top: 5mm; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="header text-center">
    <div class="shop-name">${invoice.shop.name.toUpperCase()}</div>
    ${invoice.shop.address ? `<div>${invoice.shop.address}</div>` : ''}
    ${invoice.shop.phone ? `<div>Tel: ${invoice.shop.phone}</div>` : ''}
    <div class="divider"></div>
    <div class="bold">INVOICE: ${invoice.invoice_number}</div>
    <div>Date: ${new Date(invoice.sale_date).toLocaleString()}</div>
  </div>

  <div class="divider"></div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th width="45%">Item</th>
        <th width="20%" class="text-center">Qty</th>
        <th width="35%" class="text-right">Price</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${item.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="totals-area">
    <div style="display: flex; justify-content: space-between;">
      <span>Subtotal:</span>
      <span>${invoice.subtotal.toFixed(2)}</span>
    </div>
    ${invoice.discount_amount > 0 ? `
    <div style="display: flex; justify-content: space-between;">
      <span>Discount:</span>
      <span>-${invoice.discount_amount.toFixed(2)}</span>
    </div>
    ` : ''}
    ${invoice.tax_amount > 0 ? `
    <div style="display: flex; justify-content: space-between;">
      <span>Tax:</span>
      <span>${invoice.tax_amount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="divider"></div>
    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12pt;">
      <span>TOTAL:</span>
      <span>৳${invoice.total_amount.toFixed(2)}</span>
    </div>
  </div>

  <div class="divider"></div>
  
  <div class="footer text-center">
    <div>Method: ${invoice.payment_method?.toUpperCase() || 'CASH'}</div>
    ${invoice.customer ? `<div style="margin-top: 1mm;">Customer: ${invoice.customer.name}</div>` : ''}
    <div style="margin-top: 3mm;">THANK YOU FOR SHOPPING!</div>
    <div>Visit Again</div>
  </div>

  <script>
    window.onload = () => {
      window.print();
      // Optional: Close window after printing
      // window.onafterprint = () => window.close();
    };
  </script>
</body>
</html>
  ` : `
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
  <script>window.onload = () => window.print();</script>
</body>
</html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(content)
    printWindow.document.close()
  }
}

export function downloadInvoicePDF(invoice: InvoiceData, size: InvoiceSize = 'A4') {
  generateInvoicePDF(invoice, size)
}
