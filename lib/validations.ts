import { z } from 'zod'

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  cost_price: z.number().min(0, 'Cost price must be positive'),
  selling_price: z.number().min(0, 'Selling price must be positive'),
  mrp: z.number().min(0).optional(),
  tax_rate: z.number().min(0).max(100).default(0),
  unit: z.string().default('piece'),
  min_stock_level: z.number().int().min(0).default(0),
  max_stock_level: z.number().int().min(0).optional(),
  reorder_point: z.number().int().min(0).optional(),
  warranty_period: z.number().int().min(0).optional(),
  warranty_type: z.string().optional(),
  specifications: z.record(z.any()).optional(),
})

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
})

// Customer validation
export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'vip']).default('retail'),
  credit_limit: z.number().min(0).default(0),
})

// Supplier validation
export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
})

// Sale validation
export const saleSchema = z.object({
  customer_id: z.string().uuid().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0),
    discount_amount: z.number().min(0).default(0),
  })).min(1, 'At least one item is required'),
  discount_amount: z.number().min(0).default(0),
  payment_method: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other']),
  paid_amount: z.number().min(0),
  notes: z.string().optional(),
})

// Staff validation
export const staffSchema = z.object({
  user_id: z.string().uuid(),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  date_of_joining: z.string(),
  base_salary: z.number().min(0),
  bank_account_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_ifsc: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
})

// Purchase Order validation
export const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid(),
  order_date: z.string(),
  expected_delivery_date: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_cost: z.number().min(0),
  })).min(1),
  shipping_cost: z.number().min(0).default(0),
  notes: z.string().optional(),
})

// Payroll validation
export const payrollSchema = z.object({
  staff_id: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  base_salary: z.number().min(0),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  overtime_hours: z.number().min(0).default(0),
  overtime_pay: z.number().min(0).default(0),
  payment_date: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
})

// Leave validation
export const leaveSchema = z.object({
  staff_id: z.string().uuid(),
  leave_type: z.enum(['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid']),
  from_date: z.string(),
  to_date: z.string(),
  reason: z.string().optional(),
})
