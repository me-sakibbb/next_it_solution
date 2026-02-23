'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createSystemExpense } from '@/app/actions/expenses'

import { getPaginationRange, type PaginationParams, type PaginatedResponse } from '@/lib/pagination'

export async function getPaginatedStaff(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const supabase = await createClient()
  const { from, to } = getPaginationRange(params.page, params.limit)

  let query = supabase
    .from('staff')
    .select('*', { count: 'exact' })
    .eq('shop_id', params.shopId)
    .eq('is_active', true)

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`)
  }

  const { data, error, count } = await query
    .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
    .range(from, to)

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil((count || 0) / params.limit)
  }
}

export async function getStaffStats(shopId: string) {
  const supabase = await createClient()

  const { count: staffCount, error: staffError } = await supabase
    .from('staff')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('is_active', true)

  if (staffError) throw staffError

  const { count: leaveCount, error: leaveError } = await supabase
    .from('leaves')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopId)
    .eq('status', 'pending')

  if (leaveError) throw leaveError

  return {
    totalStaff: staffCount || 0,
    totalPendingLeaves: leaveCount || 0
  }
}

export async function getAttendance(shopId: string, staffId?: string, month?: number, year?: number) {
  const supabase = await createClient()

  let query = supabase
    .from('attendance')
    .select('*, staff(*)')
    .eq('shop_id', shopId)
    .order('date', { ascending: false })

  if (staffId) query = query.eq('staff_id', staffId)

  const { data, error } = await query.limit(100)
  if (error) {
    console.error('Attendance error:', error)
    throw error
  }
  return data
}

export async function createAttendance(shopId: string, formData: FormData) {
  const supabase = await createClient()

  const attendanceData = {
    shop_id: shopId,
    staff_id: formData.get('staff_id'),
    date: formData.get('date'),
    check_in: formData.get('check_in') ? new Date(formData.get('check_in') as string).toISOString() : null,
    check_out: formData.get('check_out') ? new Date(formData.get('check_out') as string).toISOString() : null,
    status: formData.get('status') || 'present',
    notes: formData.get('notes'),
  }

  const { data, error } = await supabase
    .from('attendance')
    .insert(attendanceData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
  return data
}

export async function getLeaves(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leaves')
    .select('*, staff(*)')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createLeave(shopId: string, formData: FormData) {
  const supabase = await createClient()

  const fromDate = new Date(formData.get('from_date') as string)
  const toDate = new Date(formData.get('to_date') as string)
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const leaveData = {
    shop_id: shopId,
    staff_id: formData.get('staff_id'),
    leave_type: formData.get('leave_type'),
    from_date: formData.get('from_date'),
    to_date: formData.get('to_date'),
    days,
    reason: formData.get('reason'),
    status: 'pending',
  }

  const { data, error } = await supabase
    .from('leaves')
    .insert(leaveData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
  return data
}

export async function approveLeave(leaveId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('leaves')
    .update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', leaveId)

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
}

export async function rejectLeave(leaveId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('leaves')
    .update({
      status: 'rejected',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', leaveId)

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
}

export async function getPaginatedPayroll(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const supabase = await createClient()
  const { from, to } = getPaginationRange(params.page, params.limit)

  let query = supabase
    .from('payroll')
    .select('*, staff!inner(*)', { count: 'exact' })
    .eq('shop_id', params.shopId)

  if (params.search) {
    query = query.ilike('staff.name', `%${params.search}%`)
  }

  if (params.filters?.status) {
    query = query.eq('status', params.filters.status)
  }

  const { data, error, count } = await query
    .order(params.sortBy || 'year', { ascending: params.sortOrder === 'asc' })
    .order('month', { ascending: params.sortOrder === 'asc' })
    .range(from, to)

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil((count || 0) / params.limit)
  }
}

export async function getPayrollStats(shopId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payroll')
    .select('net_salary, status')
    .eq('shop_id', shopId)

  if (error) throw error

  const totalPayroll = data.reduce((sum, p) => sum + Number(p.net_salary), 0)
  const pendingCount = data.filter(p => p.status === 'pending').length
  const paidCount = data.filter(p => p.status === 'paid').length

  return {
    totalPayroll,
    totalRecords: data.length,
    pendingCount,
    paidCount
  }
}

export async function createPayroll(shopId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const baseSalary = Number(formData.get('base_salary'))
  const allowances = Number(formData.get('allowances') || 0)
  const deductions = Number(formData.get('deductions') || 0)
  const overtimePay = Number(formData.get('overtime_pay') || 0)
  const bonus = Number(formData.get('bonus') || 0)

  // Calculate gross and net salary
  const grossSalary = baseSalary + allowances + overtimePay + bonus
  const netSalary = grossSalary - deductions

  const payrollData = {
    shop_id: shopId,
    staff_id: formData.get('staff_id'),
    month: Number(formData.get('month')),
    year: Number(formData.get('year')),
    base_salary: baseSalary,
    basic_salary: baseSalary, // For backward compatibility
    allowances: allowances,
    deductions: deductions,
    overtime_hours: Number(formData.get('overtime_hours') || 0),
    overtime_pay: overtimePay,
    bonus: bonus,
    gross_salary: grossSalary,
    net_salary: netSalary,
    payment_date: formData.get('payment_date') || null,
    payment_method: formData.get('payment_method') || null,
    status: 'pending',
    payment_status: 'pending', // For backward compatibility
    notes: formData.get('notes') || null,
    created_by: user?.id,
  }

  const { data, error } = await supabase
    .from('payroll')
    .insert(payrollData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/shop/payroll')
  return data
}

export async function markPayrollPaid(payrollId: string) {
  const supabase = await createClient()

  // Fetch the payroll record to get details for the expense
  const { data: payroll, error: fetchError } = await supabase
    .from('payroll')
    .select('shop_id, net_salary')
    .eq('id', payrollId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('payroll')
    .update({
      status: 'paid',
      payment_status: 'paid' // For backward compatibility
    })
    .eq('id', payrollId)

  if (error) throw error

  // Auto log as expense
  try {
    await createSystemExpense(
      payroll.shop_id,
      Number(payroll.net_salary),
      'স্টাফ বেতন প্রদান',
      'পে-রোল',
      'payroll',
      payrollId
    )
  } catch (err) {
    console.error('Failed to auto log payroll expense:', err)
  }

  revalidatePath('/dashboard/shop/payroll')
}

export async function createStaff(shopId: string, formData: FormData) {
  const supabase = await createClient()

  // Create staff record directly without user account
  const staffData = {
    shop_id: shopId,
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    employee_id: formData.get('employee_id') || undefined,
    department: formData.get('department') || undefined,
    designation: formData.get('designation') || undefined,
    employment_type: formData.get('employment_type') || 'full_time',
    date_of_joining: formData.get('date_of_joining'),
    base_salary: Number(formData.get('base_salary')),
    emergency_contact_name: formData.get('emergency_contact_name') || undefined,
    emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
  }

  const { data, error } = await supabase
    .from('staff')
    .insert(staffData)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
  return data
}

export async function updateStaff(staffId: string, formData: FormData) {
  const supabase = await createClient()

  const staffData = {
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    employee_id: formData.get('employee_id') || undefined,
    department: formData.get('department') || undefined,
    designation: formData.get('designation') || undefined,
    employment_type: formData.get('employment_type') || 'full_time',
    date_of_joining: formData.get('date_of_joining'),
    base_salary: Number(formData.get('base_salary')),
    emergency_contact_name: formData.get('emergency_contact_name') || undefined,
    emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
  }

  const { data, error } = await supabase
    .from('staff')
    .update(staffData)
    .eq('id', staffId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/shop/staff')
  return data
}
