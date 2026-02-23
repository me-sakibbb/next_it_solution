'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, X, Search, ShoppingCart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { CustomerSelector } from '@/components/dashboard/shop/customer-selector'
import { CustomerDialog } from '@/app/dashboard/shop/customers/customer-dialog'
import { Switch } from '@/components/ui/switch'
import { generateInvoicePDF, type InvoiceSize } from '@/lib/pdf-export'
import { useSales } from '@/hooks/use-sales'
import { useProducts } from '@/hooks/use-products'
import { useCustomers } from '@/hooks/use-customers'

interface CartItem {
  product_id: string
  name: string
  unit_price: number
  quantity: number
  tax_rate: number
  discount_amount: number
  unit: string
}

interface POSClientProps {
  shopId: string
  currency: string
}

export function POSClient({ shopId, currency }: POSClientProps) {
  const router = useRouter()
  const { handleCreateSale, getSaleDetails } = useSales(shopId)
  const { products, setSearch: setProductSearch, loading: productsLoading } = useProducts(shopId)
  const { customers, handleCreateCustomer } = useCustomers(shopId)

  const [cart, setCart] = useState<CartItem[]>([])
  const [localCustomers, setLocalCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState('')
  const [discount, setDiscount] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generateInvoice, setGenerateInvoice] = useState(true)
  const [invoiceSize, setInvoiceSize] = useState<InvoiceSize>('POS')

  // Sync products search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setProductSearch(val)
  }

  // Sync customers from hook
  useEffect(() => {
    if (customers?.length > 0) {
      setLocalCustomers(customers)
    }
  }, [customers])

  const filteredProducts = products

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.id)

    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        unit_price: product.selling_price,
        quantity: 1,
        tax_rate: product.tax_rate || 0,
        discount_amount: 0,
        unit: product.unit,
      }])
    }
    setSearchQuery('')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const taxAmount = cart.reduce((sum, item) => {
    const itemTotal = item.unit_price * item.quantity
    return sum + (itemTotal * (item.tax_rate / 100))
  }, 0)
  const discountAmount = Number(discount) || 0
  const totalAmount = subtotal + taxAmount - discountAmount

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('কার্ট খালি')
      return
    }

    setLoading(true)
    setError('')

    try {
      const saleData = {
        customer_id: selectedCustomer || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_amount: item.discount_amount,
        })),
        discount_amount: discountAmount,
        payment_method: paymentMethod === 'due' ? 'cash' : paymentMethod, // If due, we default payment method of paid part to cash if not specified, but usually due is mixed. For now, if full due, payment method doesn't matter much for the payment record (0 amount).
        paid_amount: paymentMethod === 'due' && paidAmount === '' ? 0 : (Number(paidAmount) || 0), // If due selected and no amount, assume 0. OR permit partial.
      }

      // Validation: If there is a due amount (total > paid), customer is required
      const paid = Number(saleData.paid_amount)
      if (totalAmount > paid && !saleData.customer_id) {
        setError('বাকি বিক্রয়ের জন্য কাস্টমার নির্বাচন আবশ্যক')
        setLoading(false)
        return
      }

      const sale = await handleCreateSale(saleData)

      if (generateInvoice && sale?.id) {
        try {
          const fullSale = await getSaleDetails(sale.id)
          if (fullSale) {
            const invoiceData = {
              id: fullSale.id,
              invoice_number: fullSale.sale_number,
              sale_date: fullSale.created_at,
              customer: fullSale.customer,
              shop: fullSale.shop,
              items: fullSale.sale_items.map((item: any) => ({
                product_name: item.product?.name || 'Unknown Product',
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: (item.quantity * item.unit_price)
              })),
              subtotal: fullSale.subtotal,
              tax_amount: fullSale.tax_amount,
              discount_amount: fullSale.discount_amount,
              total_amount: fullSale.total_amount,
              payment_method: fullSale.payment_status === 'paid' ? paymentMethod : 'Partial/Due',
              notes: fullSale.notes
            }
            generateInvoicePDF(invoiceData, invoiceSize)
          }
        } catch (printErr) {
          console.error('Failed to generate invoice:', printErr)
        }
      }

      // Reset form
      setCart([])
      setSelectedCustomer('')
      setPaidAmount('')
      setDiscount('0')

      router.push('/dashboard/shop/sales')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Left Panel - Products */}
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">পয়েন্ট অফ সেল</h1>
          <p className="text-muted-foreground">পণ্য স্ক্যান বা খুঁজুন</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="নাম, SKU বা বারকোড দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {productsLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto h-[calc(100vh-18rem)] pr-2 pb-2 content-start">
          {filteredProducts.map((product) => {
            const stock = product.inventory?.[0]?.quantity || 0
            const isLowStock = stock <= product.min_stock_level
            const isOutOfStock = stock === 0

            // Expanded color palette for a more vibrant look
            const colorMap = [
              { name: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100', ring: 'ring-blue-100' },
              { name: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-100', ring: 'ring-emerald-100' },
              { name: 'violet', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', iconBg: 'bg-violet-100', ring: 'ring-violet-100' },
              { name: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100', ring: 'ring-amber-100' },
              { name: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', iconBg: 'bg-rose-100', ring: 'ring-rose-100' },
              { name: 'cyan', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', iconBg: 'bg-cyan-100', ring: 'ring-cyan-100' },
              { name: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', iconBg: 'bg-indigo-100', ring: 'ring-indigo-100' },
              { name: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-100', ring: 'ring-orange-100' },
            ];

            const colorIndex = (product.category?.name || product.name).charCodeAt(0) % colorMap.length;
            const theme = colorMap[colorIndex];

            return (
              <div
                key={product.id}
                className={`
                    group relative flex flex-col justify-between h-fit
                    rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300
                    hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden
                    ${isOutOfStock ? 'opacity-60 grayscale' : ''}
                `}
                onClick={() => !isOutOfStock && addToCart(product)}
              >
                {/* Top Visual Area */}
                <div className={`h-24 w-full ${theme.bg} flex items-center justify-center relative overflow-hidden`}>
                  {/* Decorative Elements */}
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${theme.iconBg} opacity-50 blur-2xl transition-transform duration-500 group-hover:scale-150`} />
                  <div className={`absolute -left-6 -bottom-6 h-20 w-20 rounded-full ${theme.iconBg} opacity-50 blur-xl transition-transform duration-500 group-hover:scale-150`} />

                  {/* Center Initial/Icon */}
                  <div className={`relative z-10 h-12 w-12 rounded-full ${theme.bg} border-2 ${theme.border} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className={`text-lg font-bold ${theme.text}`}>
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Category Badge - Top Left */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm text-[10px] font-normal px-2 h-5">
                      {product.category?.name || 'আইটেম'}
                    </Badge>
                  </div>

                  {/* Stock Badge - Top Right */}
                  <div className="absolute top-2 right-2 z-10">
                    {isOutOfStock ? (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[10px] shadow-sm">স্টক আউট</Badge>
                    ) : (
                      <Badge variant="outline" className={`bg-background/80 backdrop-blur-md border-0 shadow-sm text-[10px] h-5 ${isLowStock ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {stock} {product.unit}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 pb-4 flex flex-col gap-2 relative">
                  <div className="min-h-[2.5rem] flex items-center">
                    <h3 className="font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors text-sm">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">দাম</span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(product.selling_price)}
                      </span>
                    </div>

                    <div className={`h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm ${isOutOfStock ? 'hidden' : ''}`}>
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <Card className="w-96 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            কার্ট ({cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label>কাস্টমার (ঐচ্ছিক)</Label>
              <CustomerSelector
                customers={localCustomers}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                onAddCustomer={() => setShowCustomerDialog(true)}
                placeholder="ওয়াক-ইন কাস্টমার"
              />
            </div>

            <Separator />

            {/* Cart Items */}
            <div className="space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  কার্ট খালি
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right font-medium text-sm">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">সাবটোটাল:</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ট্যাক্স:</span>
                <span>৳{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="discount" className="text-sm text-muted-foreground">ডিসকাউন্ট:</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 h-8 text-right"
                  step="0.01"
                  min="0"
                />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>মোট:</span>
                <span>৳{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="payment_method">পেমেন্ট মেথড</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">নগদ</SelectItem>
                    <SelectItem value="card">কার্ড</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">ব্যাংক ট্রান্সফার</SelectItem>
                    <SelectItem value="due">বাকি (Due)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_amount">প্রদত্ত পরিমাণ</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={totalAmount.toFixed(2)}
                  step="0.01"
                  min="0"
                />
              </div>

              {Number(paidAmount) > totalAmount && (
                <div className="rounded-lg bg-primary/10 p-3">
                  <div className="text-sm text-muted-foreground">ফেরত</div>
                  <div className="text-lg font-bold text-primary">
                    ৳{(Number(paidAmount) - totalAmount).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Options */}
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">ইনভয়েস তৈরি করুন</Label>
                  <p className="text-[10px] text-muted-foreground">বিক্রয়ের পর সরাসরি প্রিন্ট হবে</p>
                </div>
                <Switch
                  checked={generateInvoice}
                  onCheckedChange={setGenerateInvoice}
                />
              </div>

              {generateInvoice && (
                <div className="flex gap-2">
                  <Button
                    variant={invoiceSize === 'POS' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setInvoiceSize('POS')}
                  >
                    POS (Small)
                  </Button>
                  <Button
                    variant={invoiceSize === 'A4' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setInvoiceSize('A4')}
                  >
                    A4 (Large)
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="p-4 border-t bg-card space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setCart([])}
                disabled={loading || cart.length === 0}
              >
                মুছুন
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                বিক্রয় সম্পন্ন করুন
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomerDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        shopId={shopId}
        onSuccess={(customer) => {
          setLocalCustomers([...localCustomers, customer])
          setSelectedCustomer(customer.id)
          setShowCustomerDialog(false)
        }}
      />
    </div>
  )
}
