'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, X, Search, ShoppingCart, Loader2 } from 'lucide-react'
import { createSale } from '@/app/actions/sales'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

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
  products: any[]
  customers: any[]
  shopId: string
}

export function POSClient({ products, customers, shopId }: POSClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState('')
  const [discount, setDiscount] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      setError('Cart is empty')
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
        payment_method: paymentMethod,
        paid_amount: Number(paidAmount) || totalAmount,
      }

      await createSale(shopId, saleData)
      
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
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Scan or search products</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-[calc(100vh-18rem)]">
          {filteredProducts.map((product) => {
            const stock = product.inventory?.[0]?.quantity || 0
            const isLowStock = stock <= product.min_stock_level
            const isOutOfStock = stock === 0

            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  isOutOfStock ? 'opacity-50' : ''
                }`}
                onClick={() => !isOutOfStock && addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium line-clamp-2">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.category?.name || 'Uncategorized'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(product.selling_price)}
                      </div>
                      <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}>
                        {stock} {product.unit}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <Card className="w-96 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({cart.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label>Customer (Optional)</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Cart Items */}
            <div className="space-y-2 overflow-y-auto max-h-64">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cart is empty
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
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
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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
                    <div className="text-right font-medium">
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
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="discount" className="text-sm text-muted-foreground">Discount:</Label>
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
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_amount">Amount Paid</Label>
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
                  <div className="text-sm text-muted-foreground">Change</div>
                  <div className="text-lg font-bold text-primary">
                    ${(Number(paidAmount) - totalAmount).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
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
                Clear
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Sale
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
