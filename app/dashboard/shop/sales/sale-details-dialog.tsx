'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { FileDown, Edit, Plus, Loader2 } from 'lucide-react'
import { downloadInvoicePDF } from '@/lib/pdf-export'
import { addPayment, updateSale } from '@/app/actions/sales'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SaleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: any
}

export function SaleDetailsDialog({ open, onOpenChange, sale }: SaleDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Edit State
  const [editNotes, setEditNotes] = useState('')
  const [editDiscount, setEditDiscount] = useState('0')

  // Payment State
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  if (!sale) return null

  // Update state when sale changes or dialog opens, 
  // but be careful not to reset user input if they are just switching tabs.
  // Ideally use useEffect or keys. For now, we'll initialize on edit click.

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

  const handleAddPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error('ভুল পেমেন্ট পরিমাণ')
      return
    }

    setLoading(true)
    try {
      await addPayment(sale.shop_id, {
        sale_id: sale.id,
        amount: paymentAmount,
        payment_method: paymentMethod
      })
      toast.success('পেমেন্ট সফলভাবে যুক্ত হয়েছে')
      setPaymentAmount('')
      onOpenChange(false) // Close to refresh data
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSale = async () => {
    setLoading(true)
    try {
      await updateSale(sale.shop_id, sale.id, {
        discount_amount: editDiscount,
        notes: editNotes
      })
      toast.success('বিক্রয় আপডেট করা হয়েছে')
      setIsEditing(false)
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const balanceDue = Number(sale.total_amount) - Number(sale.paid_amount)
  const isPaid = balanceDue <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>বিক্রয় বিবরণ - {sale.sale_number}</DialogTitle>
            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => {
                  setEditNotes(sale.notes || '')
                  setEditDiscount(sale.discount_amount?.toString() || '0')
                  setIsEditing(true)
                }} size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={handleDownloadPDF} size="sm" variant="outline">
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">বিবরণ</TabsTrigger>
            <TabsTrigger value="payments">পেমেন্ট & ডিউ</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
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
                        {formatCurrency(item.unit_price)} × {item.quantity} {item.product?.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(item.unit_price * item.quantity)}
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

            {/* Totals & Edit Mode */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সাবটোটাল:</span>
                <span>{formatCurrency(Number(sale.subtotal))}</span>
              </div>
              {Number(sale.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ট্যাক্স:</span>
                  <span>{formatCurrency(Number(sale.tax_amount))}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-primary">
                <span className="text-muted-foreground">ডিসকাউন্ট:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editDiscount}
                    onChange={e => setEditDiscount(e.target.value)}
                    className="w-24 h-8 text-right"
                  />
                ) : (
                  <span>-{formatCurrency(Number(sale.discount_amount))}</span>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>মোট:</span>
                <span>
                  {isEditing
                    ? formatCurrency(Number(sale.subtotal) + Number(sale.tax_amount) - Number(editDiscount))
                    : formatCurrency(Number(sale.total_amount))
                  }
                </span>
              </div>
            </div>

            {/* Notes */}
            {(sale.notes || isEditing) && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">নোট</div>
                  {isEditing ? (
                    <Input
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="নোট লিখুন..."
                    />
                  ) : (
                    <div className="text-sm">{sale.notes}</div>
                  )}
                </div>
              </>
            )}

            {isEditing && (
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>বাতিল</Button>
                <Button onClick={handleUpdateSale} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  সেভ করুন
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">ব্যালেন্স ডিউ</span>
                <span className={`text-xl font-bold ${balanceDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">পরিশোধিত</span>
                <span>{formatCurrency(Number(sale.paid_amount))}</span>
              </div>
            </div>

            {!isPaid && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  নতুন পেমেন্ট যুক্ত করুন
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>পরিমাণ ({formatCurrency(balanceDue)})</Label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder={balanceDue.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>পেমেন্ট মেথড</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">নগদ</SelectItem>
                        <SelectItem value="card">কার্ড</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddPayment} className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  পেমেন্ট নিশ্চিত করুন
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
