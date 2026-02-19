'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { FileDown } from 'lucide-react'
import { downloadInvoicePDF } from '@/lib/pdf-export'

interface SaleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: any
}

export function SaleDetailsDialog({ open, onOpenChange, sale }: SaleDetailsDialogProps) {
  if (!sale) return null

  const handleDownloadPDF = () => {
    const invoiceData = {
      id: sale.id,
      invoice_number: sale.sale_number,
      sale_date: sale.sale_date,
      customer: sale.customer,
      shop: sale.shop,
      items: sale.sale_items?.map((item: any) => ({
        product_name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total: Number(item.total_price),
      })) || [],
      subtotal: Number(sale.subtotal),
      tax_amount: Number(sale.tax_amount),
      discount_amount: Number(sale.discount_amount),
      total_amount: Number(sale.total_amount),
      payment_method: sale.payment_method,
      notes: sale.notes,
    }
    downloadInvoicePDF(invoiceData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>বিক্রয় বিবরণ - {sale.sale_number}</DialogTitle>
            <Button onClick={handleDownloadPDF} size="sm" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              পিডিএফ ডাউনলোড করুন
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">তারিখ</div>
              <div className="font-medium">
                {format(new Date(sale.sale_date), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">কাস্টমার</div>
              <div className="font-medium">{sale.customer?.name || 'ওয়াক-ইন'}</div>
            </div>
            {sale.customer?.phone && (
              <div>
                <div className="text-sm text-muted-foreground">ফোন</div>
                <div className="font-medium">{sale.customer.phone}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">অবস্থা</div>
              <div className="font-medium capitalize">{sale.status}</div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">আইটেম</h3>
            <div className="space-y-2">
              {sale.sale_items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.unit_price.toFixed(2)} × {item.quantity} {item.product?.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </div>
                    {item.tax_rate > 0 && (
                      <div className="text-sm text-muted-foreground">
                        +{item.tax_rate}% ট্যাক্স
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${Number(sale.subtotal).toFixed(2)}</span>
            </div>
            {Number(sale.tax_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${Number(sale.tax_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(sale.discount_amount) > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount:</span>
                <span>-${Number(sale.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${Number(sale.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-medium">${Number(sale.paid_amount).toFixed(2)}</span>
            </div>
            {Number(sale.paid_amount) < Number(sale.total_amount) && (
              <div className="flex justify-between text-destructive">
                <span>Balance Due:</span>
                <span className="font-medium">
                  ${(Number(sale.total_amount) - Number(sale.paid_amount)).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {sale.notes && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Notes</div>
                <div className="text-sm">{sale.notes}</div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
