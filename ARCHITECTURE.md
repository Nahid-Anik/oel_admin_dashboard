# OEL Meal Admin Dashboard - Architecture Documentation

## Overview

This is the web-based admin dashboard for the OEL Meal Management system. It allows administrators to manage pending meal requests, view employees, and perform administrative operations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: JWT stored in localStorage
- **UI Theme**: Light/Dark mode support

## Project Structure

```
oel_admin_dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with ThemeProvider
│   │   ├── page.tsx                  # Home redirect page
│   │   ├── login/
│   │   │   └── page.tsx              # Admin login page
│   │   ├── register/
│   │   │   └── page.tsx              # Admin registration page
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard page
│   │   ├── employees/
│   │   │   └── page.tsx              # Employees list page
│   │   └── globals.css               # Global styles
│   ├── context/
│   │   └── ThemeContext.tsx          # Dark/Light mode context
│   └── lib/
│       └── api.ts                    # API utilities and types
├── public/                           # Static assets
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
└── package.json                      # Dependencies
```

## Architecture

### App Router Structure

Next.js 14 App Router provides file-based routing:

```
/                 -> src/app/page.tsx (redirects to dashboard/login)
/login            -> src/app/login/page.tsx
/register         -> src/app/register/page.tsx
/dashboard        -> src/app/dashboard/page.tsx
/employees        -> src/app/employees/page.tsx
```

### Components Structure

#### Root Layout (`layout.tsx`)
- Wraps entire application
- Provides ThemeProvider for dark mode
- Sets metadata (title, description)

#### Theme Context (`context/ThemeContext.tsx`)
```typescript
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
```

- Persists theme preference in localStorage
- Respects system preference on first load
- Adds/removes 'dark' class on document root

### API Layer (`lib/api.ts`)

#### Types
```typescript
interface Employee {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone: string;
  pin: number;
  department: string;
  role: string;
  image_url?: string;
}

interface MealRequest {
  id: string;
  uid: string;
  employee_id: string;
  year: number;
  month: number;
  days: number[];
  mode: string;
  status: string;
  requested_at: string;
  employee_name?: string;
  employee_department?: string;
  employee_image_url?: string;
}
```

#### API Functions
```typescript
// Authentication
login(email, password): Promise<LoginResponse>
registerAdmin(name, email, password, phone, pin, department): Promise<LoginResponse>

// Token Management
saveToken(token): void
clearToken(): void
getUser(): Employee | null
saveUser(user): void

// Admin Operations
getPendingRequests(): Promise<MealRequest[]>
approveRequest(requestId): Promise<void>
rejectRequest(requestId, reason?): Promise<void>
getEmployees(): Promise<Employee[]>
```

## Pages

### Login Page (`/login`)
- Email/password form
- Admin role validation
- Redirects non-admin users
- Link to registration

### Register Page (`/register`)
- Full registration form
- Department selection dropdown
- PIN validation (4 digits)
- Password confirmation

### Dashboard Page (`/dashboard`)
**Features:**
- Stats cards (Pending Requests, Total Employees, Top Department)
- Pending meal requests list with:
  - Employee profile picture
  - Employee name and department
  - Request mode (ON/OFF/AUTO_ON/AUTO_OFF)
  - Request dates (formatted)
  - Approve/Reject buttons
- Rejection reason modal
- Dark mode toggle
- Navigation menu

**Key Functions:**
- `loadData()` - Fetches requests and employees
- `handleApprove(requestId)` - Approves request
- `handleReject()` - Rejects with optional reason
- `getModeColor(mode)` - Returns Tailwind classes for mode badge
- `formatDates(year, month, days)` - Formats day numbers to dates

### Employees Page (`/employees`)
**Features:**
- Department filter cards
- Search by name/email
- Department dropdown filter
- Employee cards with:
  - Profile picture
  - Name, email
  - Department and role badges
  - Phone number
- Responsive grid layout

## Styling

### Tailwind Configuration
```typescript
// tailwind.config.ts
{
  darkMode: 'class',  // Enable class-based dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ]
}
```

### Dark Mode Classes
All components use Tailwind's dark mode variant:
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#22C55E)
- Danger: Red (#EF4444)
- Background: Gray-100/Gray-900
- Cards: White/Gray-800

## Authentication Flow

```
1. User submits login form
   ↓
2. API call to /api/auth/login
   ↓
3. Validate response (must be ADMIN role)
   ↓
4. Save token and user to localStorage
   ↓
5. Redirect to /dashboard
```

### Protected Routes
```typescript
useEffect(() => {
  const currentUser = getUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    router.push('/login');
    return;
  }
  setUser(currentUser);
  loadData();
}, [router]);
```

## State Management

### Loading State Pattern
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

const loadData = async () => {
  setLoading(true);
  setError('');
  try {
    const data = await fetchData();
    setData(data);
  } catch (err: any) {
    setError(err.message || 'Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### Action Loading Pattern
```typescript
const [actionLoading, setActionLoading] = useState<string | null>(null);

const handleAction = async (id: string) => {
  setActionLoading(id);
  try {
    await performAction(id);
    // Update state
  } catch (err) {
    setError(err.message);
  } finally {
    setActionLoading(null);
  }
};

// In JSX
<button disabled={actionLoading === id}>
  {actionLoading === id ? 'Processing...' : 'Action'}
</button>
```

## API Configuration

```typescript
// lib/api.ts
const API_BASE_URL = 'http://10.10.10.176:8080/api';

// For production
// const API_BASE_URL = 'https://your-server.com/api';
```

## Image URL Handling

Profile images are stored as relative paths. The full URL is constructed:

```typescript
const API_BASE_URL = 'http://10.10.10.176:8080';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};
```

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Environment Configuration

Update `API_BASE_URL` in `src/lib/api.ts` for different environments:
- Development: `http://localhost:8080/api` or local IP
- Production: `https://your-production-server.com/api`

## Features Checklist

- [x] Admin login/registration
- [x] View pending meal requests
- [x] Approve/Reject requests
- [x] View all employees
- [x] Filter employees by department
- [x] Search employees
- [x] Dark mode toggle
- [x] Responsive design
- [x] Profile pictures display
- [x] Formatted dates display
- [x] Department statistics
