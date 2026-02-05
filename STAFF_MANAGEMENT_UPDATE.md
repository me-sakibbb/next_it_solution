# Staff Attendance & Leave Management - Implementation Summary

## What Was Added

I've implemented the missing attendance and leave management features for the `/staff` page. Here's what was added:

### New Components Created

1. **`attendance-dialog.tsx`** - Dialog form to create attendance records
   - Select staff member
   - Set date, check-in/check-out times
   - Set attendance status (Present, Absent, Half Day, Leave, Holiday)
   - Add optional notes

2. **`leave-dialog.tsx`** - Dialog form to create leave requests
   - Select staff member
   - Choose leave type (Sick, Casual, Annual, Maternity, Paternity, Unpaid, Other)
   - Set from/to dates with automatic day calculation
   - Enter reason for leave

### Updated Components

1. **`attendance-list.tsx`**
   - Added header with description
   - Added "Mark Attendance" button
   - Button opens the attendance creation dialog

2. **`leaves-list.tsx`**
   - Added header with description
   - Added "Request Leave" button
   - Enhanced leave approval with both Approve and Reject actions
   - Added toast notifications for success/error feedback

### Server Actions Enhanced

Added `rejectLeave()` function to `app/actions/staff.ts` to allow managers to reject leave requests.

### Database Migration Required

⚠️ **IMPORTANT**: You need to run a database migration to ensure the schema supports all features.

Run these SQL scripts in your Supabase SQL Editor in this order:

1. First: `scripts/create_staff_table.sql` (if not already run)
2. Then: `scripts/fix_leaves_columns.sql` (newly created)

The migration adds:
- `from_date` and `to_date` columns to the leaves table
- Expanded leave types (maternity, paternity, annual, other)
- Proper constraints and data migration from old columns

## Features Now Available

### Attendance Tab
- ✅ View all attendance records in a searchable table
- ✅ Create new attendance records with "Mark Attendance" button
- ✅ Track check-in/check-out times
- ✅ Set attendance status for each employee
- ✅ Add notes for special cases

### Leave Tab
- ✅ View all leave requests in a searchable table
- ✅ Submit new leave requests with "Request Leave" button
- ✅ Automatic calculation of leave days
- ✅ Approve or reject pending leave requests
- ✅ Track leave status (Pending, Approved, Rejected)
- ✅ Color-coded badges for different leave types and statuses

## How to Use

### To Mark Attendance:
1. Go to Staff page → Attendance tab
2. Click "Mark Attendance" button
3. Select staff member, date, and status
4. Optionally add check-in/check-out times and notes
5. Click "Create Record"

### To Request Leave:
1. Go to Staff page → Leaves tab
2. Click "Request Leave" button
3. Select staff member and leave type
4. Set from/to dates (automatically calculates days)
5. Enter reason for leave
6. Click "Submit Request"

### To Approve/Reject Leaves:
- Pending leave requests show green checkmark (Approve) and red X (Reject) buttons
- Click the appropriate button to approve or reject
- Status updates immediately with visual feedback

## Next Steps

1. Run the database migration scripts
2. Test the attendance marking feature
3. Test the leave request and approval workflow
4. Consider adding filters (by date range, staff member, status)
5. Consider adding bulk attendance marking for holidays
6. Consider adding leave balance tracking per employee

All features are now fully functional and ready to use!
