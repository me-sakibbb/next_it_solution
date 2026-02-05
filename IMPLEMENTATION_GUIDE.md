# Implementation Guide - Next IT Solution

This guide provides step-by-step instructions for implementing the remaining features of the Next IT Solution platform.

## 🏗️ Architecture Overview

The application follows a **multi-tenant architecture** where:
- Each shop is a separate tenant with isolated data
- Users can own multiple shops or be members of shops owned by others
- Row Level Security (RLS) ensures data isolation at the database level
- All modules share the same authenticated user context

## 📋 Implementation Checklist

### ✅ Completed Components

- [x] Database schema with 20+ tables
- [x] Authentication system (Supabase Auth)
- [x] Dashboard layout with responsive sidebar
- [x] Shop management (CRUD operations)
- [x] Landing page
- [x] User settings structure
- [x] Testing infrastructure (Jest + Playwright)

### 🚧 Modules Ready for Implementation

## 1. Inventory Management System

### Database Tables
- `categories` - Product categories (hierarchical)
- `products` - Product catalog
- `inventory` - Stock levels
- `inventory_transactions` - Audit trail
- `suppliers` - Supplier database
- `purchase_orders` - PO management
- `purchase_order_items` - PO line items

### Implementation Steps

#### A. Products Page (`/app/dashboard/inventory/products/page.tsx`)

```typescript
// 1. Fetch products with inventory data
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    categories(name),
    inventory(quantity, available_quantity)
  `)
  .eq('shop_id', selectedShopId)
  .order('name')

// 2. Display in a data table with:
// - Search functionality
// - Filter by category
// - Sort by various fields
// - Pagination
// - Actions: Edit, Delete, View Details

// 3. Add stock level indicators:
// - Red: quantity < reorder_point
// - Yellow: quantity < min_stock_level
// - Green: adequate stock
```

#### B. Create Product Form (`/app/dashboard/inventory/products/new/page.tsx`)

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  category_id: z.string().uuid(),
  cost_price: z.number().min(0),
  selling_price: z.number().min(0),
  // ... other fields
})

// Form with validation, image upload, and specifications JSON editor
```

#### C. Stock Management

```typescript
// Stock adjustment action
async function adjustStock(productId, quantity, type, reason) {
  // 1. Update inventory table
  // 2. Create inventory_transaction record
  // 3. Check reorder alerts
  // 4. Send notification if low stock
}
```

### Key Features
- Barcode generation and scanning
- Bulk import/export (CSV)
- Low stock alerts
- Stock transfer between shops
- Product variants (size, color, etc.)
- Serial number tracking

## 2. Point of Sale (POS) System

### Database Tables
- `customers` - Customer database
- `sales` - Sales transactions
- `sale_items` - Line items
- `payments` - Payment records
- `refunds` - Return/refund records

### Implementation Steps

#### A. POS Interface (`/app/dashboard/sales/new/page.tsx`)

```typescript
'use client'
// Split screen layout:
// - Left: Product search and selection
// - Right: Cart with selected items

const [cart, setCart] = useState<CartItem[]>([])
const [customer, setCustomer] = useState<Customer | null>(null)

// Features:
// 1. Barcode scanner integration
// 2. Product quick search
// 3. Quantity adjustment
// 4. Discount application
// 5. Tax calculation
// 6. Multiple payment methods
// 7. Receipt printing
```

#### B. Sales Transaction Flow

```typescript
async function completeSale(saleData) {
  // 1. Create sale record
  const { data: sale } = await supabase
    .from('sales')
    .insert({
      shop_id,
      customer_id,
      sale_number: generateSaleNumber(),
      subtotal,
      tax_amount,
      total_amount,
      // ...
    })

  // 2. Create sale items (triggers inventory update automatically)
  await supabase.from('sale_items').insert(items)

  // 3. Record payment
  await supabase.from('payments').insert(paymentData)

  // 4. Print/email receipt
  await generateReceipt(sale.id)
}
```

### Key Features
- Touch-friendly interface
- Quick product selection
- Customer lookup
- Split payments
- Hold/retrieve sales
- Offline mode (local storage)
- Receipt templates

## 3. Customer Management

### Implementation Steps

#### A. Customer List (`/app/dashboard/customers/page.tsx`)

```typescript
// Display customers with:
// - Search by name/phone/email
// - Filter by customer type
// - Sort by various fields
// - Show outstanding balance
// - Show loyalty points
```

#### B. Customer Detail (`/app/dashboard/customers/[id]/page.tsx`)

```typescript
// Tabs:
// 1. Profile - Basic info, credit limit
// 2. Purchase History - All sales
// 3. Payments - Payment history
// 4. Loyalty - Points and rewards
// 5. Notes - Customer notes
```

### Key Features
- Customer groups (retail, wholesale, VIP)
- Loyalty points system
- Credit management
- Purchase history
- Email/SMS communications

## 4. Staff Management

### Database Tables
- `staff` - Employee records
- `attendance` - Daily attendance
- `leaves` - Leave management

### Implementation Steps

#### A. Staff List (`/app/dashboard/staff/page.tsx`)

```typescript
// Fetch staff with shop member data
const { data: staffMembers } = await supabase
  .from('staff')
  .select(`
    *,
    shop_members!inner(
      shop_id,
      role,
      is_active,
      users(email, full_name)
    )
  `)
  .eq('shop_members.shop_id', shopId)
```

#### B. Attendance Tracking

```typescript
// Check-in/Check-out interface
async function recordAttendance(staffId, type: 'check_in' | 'check_out') {
  const today = new Date().toISOString().split('T')[0]
  
  if (type === 'check_in') {
    await supabase.from('attendance').insert({
      staff_id: staffId,
      date: today,
      check_in: new Date().toISOString(),
      status: 'present'
    })
  } else {
    await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('staff_id', staffId)
      .eq('date', today)
  }
}
```

### Key Features
- Employee onboarding
- Role-based permissions
- Shift scheduling
- Performance tracking
- Document management

## 5. Payroll Management

### Database Tables
- `payroll` - Monthly payroll records
- `advances` - Salary advances

### Implementation Steps

#### A. Payroll Generation

```typescript
async function generateMonthlyPayroll(shopId, month, year) {
  // 1. Fetch all active staff
  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)

  // 2. Calculate for each staff:
  for (const employee of staff) {
    // - Base salary
    // - Allowances
    // - Deductions
    // - Overtime pay
    // - Advance repayment
    
    const payrollData = {
      staff_id: employee.id,
      month,
      year,
      base_salary: employee.base_salary,
      // ... calculations
    }

    await supabase.from('payroll').insert(payrollData)
  }
}
```

### Key Features
- Automated salary calculation
- Deduction management
- Advance tracking
- Payslip generation
- Bank file export

## 6. Photo Editor

### Implementation Steps

#### A. Photo Upload Component

```typescript
'use client'
import { useState } from 'react'
import { removeBackground } from '@imgly/background-removal'

export function PhotoEditor() {
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleBackgroundRemoval = async () => {
    setProcessing(true)
    const blob = await removeBackground(image)
    setImage(URL.createObjectURL(blob))
    setProcessing(false)
  }

  // Implement other features:
  // - Brightness/Contrast adjustment
  // - Crop/Rotate
  // - Filters
  // - Face detection
  // - Text overlay
}
```

#### B. Preset Management

```typescript
// Save editing preset
async function savePreset(name, settings) {
  await supabase.from('photo_presets').insert({
    user_id,
    name,
    settings: {
      brightness: 0,
      contrast: 0,
      filters: [],
      // ...
    },
    is_public: false
  })
}
```

### Libraries to Install
```bash
npm install @imgly/background-removal face-api.js canvas
```

## 7. Reports & Analytics

### Implementation Steps

#### A. Sales Report

```typescript
async function getSalesReport(shopId, startDate, endDate) {
  const { data: sales } = await supabase
    .from('sales')
    .select('*, sale_items(*), payments(*)')
    .eq('shop_id', shopId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)

  // Calculate:
  // - Total revenue
  // - Total sales count
  // - Average sale value
  // - Payment method breakdown
  // - Top selling products
  // - Daily/weekly/monthly trends
}
```

#### B. Inventory Report

```typescript
async function getInventoryReport(shopId) {
  const { data: products } = await supabase
    .from('products')
    .select('*, inventory(*)')
    .eq('shop_id', shopId)

  // Calculate:
  // - Total stock value
  // - Low stock items
  // - Out of stock items
  // - Fast moving items
  // - Slow moving items
  // - Stock turnover ratio
}
```

### Chart Integration
```bash
npm install recharts
# Use shadcn/ui chart components
```

## 🔧 Common Patterns

### 1. Server Actions Pattern

```typescript
// app/actions/products.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const productData = {
    // Parse formData
  }

  const { data, error } = await supabase
    .from('products')
    .insert(productData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/inventory/products')
  return { success: true, data }
}
```

### 2. Real-time Updates with SWR

```typescript
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ProductList() {
  const { data, error, mutate } = useSWR('/api/products', fetcher)

  // mutate() to refresh data after changes
}
```

### 3. Optimistic UI Updates

```typescript
const handleDelete = async (id: string) => {
  // Optimistically update UI
  mutate(
    data?.filter(item => item.id !== id),
    false
  )

  // Perform delete
  await deleteProduct(id)

  // Revalidate
  mutate()
}
```

### 4. Form Validation with Zod

```typescript
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  cost_price: z.number().min(0),
  selling_price: z.number().min(0).refine(
    (price) => price > schema.cost_price,
    'Selling price must be greater than cost'
  ),
})
```

## 🎨 UI Components Guide

### Data Tables

Use shadcn/ui Table component:
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>SKU</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map(product => (
      <TableRow key={product.id}>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.sku}</TableCell>
        <TableCell>${product.selling_price}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Dialogs for Confirmations

```typescript
import { AlertDialog } from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// __tests__/lib/calculations.test.ts
import { calculatePayroll } from '@/lib/payroll'

describe('Payroll Calculations', () => {
  it('should calculate net salary correctly', () => {
    const result = calculatePayroll({
      base_salary: 50000,
      allowances: 5000,
      deductions: 2000,
    })
    expect(result.net_salary).toBe(53000)
  })
})
```

### E2E Tests
```typescript
// e2e/inventory.spec.ts
test('should create new product', async ({ page }) => {
  await page.goto('/dashboard/inventory/products/new')
  await page.fill('[name="name"]', 'Test Product')
  await page.fill('[name="sku"]', 'TEST-001')
  await page.fill('[name="cost_price"]', '100')
  await page.fill('[name="selling_price"]', '150')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard\/inventory\/products\/[a-z0-9-]+/)
})
```

## 📱 Mobile Optimization

- Use responsive grid layouts: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- Touch-friendly buttons: minimum 44x44px hit area
- Drawer navigation on mobile instead of sidebar
- Optimize images with Next.js Image component
- Use Sheet component for mobile modals

## 🚀 Performance Optimization

1. **Database Indexes**: Already created on foreign keys and commonly queried fields
2. **Server Components**: Use by default, only add 'use client' when needed
3. **Lazy Loading**: Dynamic imports for heavy components
4. **Image Optimization**: Use Next.js Image component
5. **Caching**: Use SWR for client-side caching
6. **Pagination**: Implement for large lists

## 🔒 Security Checklist

- [x] RLS policies on all tables
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Supabase)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (Next.js built-in)
- [ ] Rate limiting on API routes
- [ ] Secure file uploads
- [ ] Audit logging for sensitive operations

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

## 💡 Tips

1. Start with one module at a time
2. Test RLS policies thoroughly
3. Use TypeScript for type safety
4. Follow the existing patterns
5. Write tests as you build
6. Keep components small and focused
7. Document complex business logic
8. Use meaningful commit messages

---

Happy coding! 🎉
