export type UserRole = 'super_admin' | 'shop_owner' | 'manager' | 'staff'

export type ShopMemberRole = 'owner' | 'manager' | 'staff'

export type SubscriptionPlanType = 'trial' | 'basic' | 'premium' | 'enterprise'

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'suspended'

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern'

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'holiday'

export type LeaveType = 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'other'

export type SaleStatus = 'draft' | 'completed' | 'cancelled' | 'refunded' | 'partial_refund'

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'

export type CustomerType = 'retail' | 'wholesale' | 'vip'

export type InventoryTransactionType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'damage' | 'expired'

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'

export type PayrollStatus = 'pending' | 'processing' | 'paid' | 'cancelled'

export type AdvanceStatus = 'active' | 'repaying' | 'repaid' | 'cancelled'

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: UserRole
  balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: SubscriptionPlanType
  status: SubscriptionStatus
  trial_start_date?: string
  trial_end_date?: string
  subscription_start_date?: string
  subscription_end_date?: string
  auto_renew: boolean
  payment_method?: string
  created_at: string
  updated_at: string
}

export interface Shop {
  id: string
  owner_id: string
  name: string
  description?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  phone?: string
  email?: string
  tax_rate: number
  currency: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShopMember {
  id: string
  shop_id: string
  user_id: string
  role: ShopMemberRole
  permissions: string[]
  joined_at: string
  is_active: boolean
}

export interface Category {
  id: string
  shop_id: string
  name: string
  description?: string
  parent_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  shop_id: string
  category_id?: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  brand?: string
  model?: string
  specifications: Record<string, any>
  cost_price: number
  selling_price: number
  mrp?: number
  tax_rate: number
  unit: string
  min_stock_level: number
  max_stock_level?: number
  reorder_point?: number
  is_active: boolean
  images: string[]
  warranty_period?: number
  warranty_type?: string
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  shop_id: string
  product_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  location?: string
  batch_number?: string
  serial_numbers: string[]
  expiry_date?: string
  last_restocked_at?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  shop_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  date_of_birth?: string
  customer_type: CustomerType
  credit_limit: number
  outstanding_balance: number
  loyalty_points: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  shop_id: string
  customer_id?: string
  sale_number: string
  sale_date: string
  status: SaleStatus
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_amount: number
  payment_status: PaymentStatus
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount_amount: number
  total_price: number
  serial_numbers: string[]
  warranty_applicable: boolean
  warranty_months?: number
  created_at: string
}

export interface Staff {
  id: string
  shop_member_id: string
  employee_id?: string
  department?: string
  designation?: string
  employment_type?: EmploymentType
  date_of_joining?: string
  date_of_leaving?: string
  base_salary: number
  allowances: Record<string, number>
  deductions: Record<string, number>
  bank_account_number?: string
  bank_name?: string
  bank_ifsc?: string
  pan_number?: string
  aadhar_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  shop_id: string
  staff_id: string
  date: string
  check_in?: string
  check_out?: string
  status: AttendanceStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Leave {
  id: string
  shop_id: string
  staff_id: string
  leave_type: LeaveType
  from_date: string
  to_date: string
  days: number
  reason?: string
  status: LeaveStatus
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface Payroll {
  id: string
  shop_id: string
  staff_id: string
  month: number
  year: number
  base_salary: number
  allowances: number
  deductions: number
  overtime_hours: number
  overtime_pay: number
  gross_salary: number
  net_salary: number
  payment_date?: string
  payment_method?: string
  payment_reference?: string
  status: PayrollStatus
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PhotoPreset {
  id: string
  user_id: string
  name: string
  description?: string
  settings: Record<string, any>
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export type TaskStatus = 'pending' | 'completed'

export interface ShopTask {
  id: string
  shop_id: string
  title: string
  description?: string
  price: number
  status: TaskStatus
  customer_name?: string
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  category: string
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ServiceOrder {
  id: string
  user_id: string
  service_id: string
  status: ServiceStatus
  requirements?: string
  deliverables?: string
  total_price: number
  created_at: string
  updated_at: string
  service?: Service // user expanded
  user?: User // admin expanded
}

export interface SuperAdmin {
  id: string
  email: string
  created_at: string
}
