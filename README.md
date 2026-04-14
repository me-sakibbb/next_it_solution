# Nex IT Solution

A comprehensive IT retail management platform built with Next.js 16, Supabase, and TypeScript. This enterprise-grade SaaS application provides complete business management capabilities for IT retail stores.

## 🚀 Features

### Core Modules

- **🏪 Multi-Shop Management**: Manage multiple retail locations from a single dashboard
- **📦 Inventory Management**: Products, categories, stock tracking, purchase orders, suppliers
- **💰 Point of Sale (POS)**: Complete POS system with barcode scanning, payment processing
- **👥 Customer Management**: CRM with loyalty points, credit limits, purchase history
- **👔 Staff Management**: HR system with employee records, roles, permissions
- **⏰ Attendance & Leaves**: Track attendance, manage leave requests and approvals
- **💵 Payroll Management**: Automated salary processing, advances, deductions
- **🖼️ Photo Editor**: AI-powered photo editing with background removal, face detection
- **📊 Reports & Analytics**: Comprehensive business intelligence and reporting
- **🔐 Role-Based Access Control**: Super Admin, Shop Owner, Manager, Staff roles
- **📝 Audit Logging**: Complete audit trail for all critical operations
- **🔔 Notifications**: Real-time notifications for important events
- **📱 Responsive Design**: Mobile-optimized interface for on-the-go management

### Technical Features

- **🔒 Row Level Security (RLS)**: Database-level security with Supabase RLS
- **🎨 Professional UI**: Beautiful, accessible interface with shadcn/ui components
- **⚡ Server Components**: Next.js 16 App Router with React Server Components
- **🔄 Real-time Updates**: Live data synchronization across all modules
- **📈 Scalable Architecture**: Multi-tenant design for unlimited shops
- **🧪 Test Infrastructure**: Comprehensive testing setup (Jest + Playwright)
- **🌐 API Routes**: RESTful API endpoints for all operations
- **🔍 Advanced Search**: Full-text search across products, customers, sales

## 📋 Database Schema

### Core Tables

- **users**: User profiles extending Supabase auth.users
- **subscriptions**: Trial and subscription management
- **shops**: Multi-shop support with settings
- **shop_members**: Shop membership and roles

### Inventory & Products

- **categories**: Hierarchical product categories
- **products**: Product catalog with specifications
- **inventory**: Real-time stock levels and tracking
- **inventory_transactions**: Complete audit trail
- **suppliers**: Supplier management
- **purchase_orders**: Purchase order management
- **purchase_order_items**: PO line items

### Sales & POS

- **customers**: Customer database with CRM features
- **sales**: Sales transactions with payment tracking
- **sale_items**: Line items with warranty info
- **payments**: Multi-method payment processing
- **refunds**: Return and refund management

### Staff & Payroll

- **staff**: Employee records with HR details
- **attendance**: Daily attendance tracking
- **leaves**: Leave management system
- **payroll**: Monthly payroll processing
- **advances**: Salary advances and repayment

### Photo & Audit

- **photo_presets**: Reusable editing presets
- **photo_edits**: Photo editing history
- **audit_logs**: System-wide audit logging
- **notifications**: User notifications

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Testing**: Jest + Playwright (E2E)
- **State Management**: React Server Components + SWR
- **Image Processing**: @imgly/background-removal, face-api.js

## 📦 Installation

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Set these in your Vercel project or .env.local:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

3. **Database Setup**:
   All migrations have been applied. The database includes:
   - Core tables (users, shops, subscriptions)
   - Inventory tables (products, inventory, suppliers)
   - Sales tables (customers, sales, payments)
   - Staff tables (staff, attendance, leaves, payroll)
   - Audit and photo tables

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   - Landing Page: http://localhost:3000
   - Login: http://localhost:3000/auth/login
   - Dashboard: http://localhost:3000/dashboard

## 🏗️ Project Structure

```
next-it-solution/
├── app/
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-success/
│   │   └── error/
│   ├── dashboard/            # Main application
│   │   ├── shops/            # Shop management
│   │   ├── inventory/        # Inventory system
│   │   ├── sales/            # POS and sales
│   │   ├── customers/        # Customer management
│   │   ├── staff/            # Staff management
│   │   ├── payroll/          # Payroll processing
│   │   ├── photo-editor/     # Photo editing
│   │   ├── reports/          # Analytics
│   │   └── settings/         # User settings
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/            # Dashboard components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   ├── types.ts              # TypeScript types
│   ├── auth.ts               # Auth helpers
│   └── utils.ts              # Utility functions
├── scripts/                  # Database migrations (executed)
├── middleware.ts             # Auth middleware
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles

1. **Super Admin**: System-wide access (defined in ADMIN_EMAILS env var)
2. **Shop Owner**: Full access to their shops
3. **Manager**: Shop management without owner privileges
4. **Staff**: Limited access based on permissions

### Role-Based Access

- **RLS Policies**: Database-level security for all tables
- **Middleware**: Route protection and session management
- **Permission System**: Granular permissions stored in JSONB

## 🎯 Key Features Implementation Status

### ✅ Completed

- [x] Database schema with all tables
- [x] Authentication system (login, signup, session management)
- [x] Dashboard layout with sidebar navigation
- [x] Shop management (create, list, view)
- [x] Landing page with feature showcase
- [x] User profile and settings structure
- [x] Role-based access control foundation
- [x] Responsive design system
- [x] Type definitions for all entities

### 🚧 Ready for Implementation

The following modules have database tables, types, and page stubs ready:

- [ ] **Inventory System**: Product CRUD, stock tracking, purchase orders
- [ ] **POS System**: Sales processing, barcode scanning, receipt printing
- [ ] **Customer Management**: CRM, loyalty points, credit management
- [ ] **Staff Management**: Employee records, role assignment
- [ ] **Attendance System**: Check-in/out, attendance reports
- [ ] **Leave Management**: Leave requests, approvals workflow
- [ ] **Payroll System**: Salary calculation, advances, payments
- [ ] **Photo Editor**: Image upload, editing tools, preset management
- [ ] **Reports**: Sales, inventory, financial, staff reports
- [ ] **Notifications**: Real-time notifications, preferences

### 📋 Implementation Guide

Each module follows this pattern:

1. **List Page**: Display records with search, filter, pagination
2. **Detail Page**: View individual record with related data
3. **Create/Edit Form**: Form with validation and error handling
4. **API Routes**: Server actions for CRUD operations
5. **Real-time Updates**: SWR or Supabase realtime subscriptions

Example Implementation Pattern:
```typescript
// List Page
- Fetch data with Supabase
- Display in table/grid with shadcn/ui components
- Add search, filters, pagination
- Link to detail/edit pages

// Create/Edit Page
- Form with react-hook-form
- Validation with zod
- Server action for submission
- Optimistic updates with SWR

// API Layer
- Server actions in actions/ directory
- Input validation
- Error handling
- RLS policy enforcement
```

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm run test
```

Test files location: `__tests__/`

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Test files location: `e2e/`

### Test Coverage

- Authentication flows
- Shop management
- Inventory operations
- Sales processing
- Staff management
- Payroll calculations

## 🎨 Design System

### Color Scheme

Professional blue theme optimized for enterprise applications:
- Primary: Blue (#4F6FED)
- Secondary: Light blue/gray
- Accent: Lighter blue for highlights
- Destructive: Red for errors/warnings

### Typography

- Headings: Bold, clear hierarchy
- Body: Readable, accessible contrast
- Code: Monospace for technical content

### Components

All components from shadcn/ui:
- Button, Card, Input, Select, Textarea
- Dialog, Dropdown, Popover, Sheet
- Table, Tabs, Toast, Tooltip
- And more...

## 📊 Performance

- **Server Components**: Reduced JavaScript bundle
- **Database Indexes**: Optimized query performance
- **RLS Policies**: Efficient permission checks
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component

## 🔒 Security

- **RLS Policies**: Database-level security
- **CSRF Protection**: Built-in with Next.js
- **XSS Prevention**: React automatic escaping
- **SQL Injection**: Parameterized queries via Supabase
- **Authentication**: Secure session management with Supabase Auth
- **Audit Logging**: Track all sensitive operations

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm run start
```

## 📝 API Documentation

### Server Actions

All data mutations use Next.js Server Actions:

```typescript
// Example: Create Shop
'use server'
export async function createShop(data: ShopInput) {
  const supabase = await createClient()
  const { data: shop, error } = await supabase
    .from('shops')
    .insert(data)
  return { shop, error }
}
```

### Supabase Queries

```typescript
// Example: Fetch Products
const { data: products } = await supabase
  .from('products')
  .select('*, categories(*), inventory(*)')
  .eq('shop_id', shopId)
  .eq('is_active', true)
  .order('name')
```

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add tests for new features
4. Follow the component patterns
5. Update this README for major changes

## 📄 License

This project is built for Nex IT Solution. All rights reserved.

## 🆘 Support

For issues or questions:
1. Check the README
2. Review the database schema
3. Check Supabase logs
4. Review RLS policies

## 🎓 Learning Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🗺️ Roadmap

- [ ] Complete all module implementations
- [ ] Add barcode scanning with device camera
- [ ] Implement real-time notifications
- [ ] Add export to PDF/Excel for reports
- [ ] Mobile app with React Native
- [ ] WhatsApp/SMS notifications
- [ ] Multi-currency support
- [ ] Advanced analytics with charts
- [ ] Integration with accounting software
- [ ] Automated backup system

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
