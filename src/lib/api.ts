const API_BASE_URL = 'http://10.10.10.176:8080/api';

export interface Employee {
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

export interface MealRequest {
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

export interface MealMonth {
  employee_id: string;
  year: number;
  month: number;
  days: Record<string, number>; // day -> 0 (OFF) or 1 (ON)
}

export interface LoginResponse {
  token: string;
  employee: Employee;
}

export interface ApiError {
  error: string;
}

// Get token from localStorage
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Save token to localStorage
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Clear token from localStorage
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Save user to localStorage
export function saveUser(user: Employee): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Get user from localStorage
export function getUser(): Employee | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Login
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

// Register admin
export async function registerAdmin(
  name: string,
  email: string,
  password: string,
  phone: string,
  pin: number,
  department: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
      phone,
      pin,
      department,
      role: 'ADMIN',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

// Get all pending requests
export async function getPendingRequests(): Promise<MealRequest[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/meal-requests/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch requests');
  }

  const data = await response.json();
  return data.requests || [];
}

// Approve request
export async function approveRequest(requestId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/meal-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve request');
  }
}

// Reject request
export async function rejectRequest(requestId: string, reason?: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/meal-requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: reason || '' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject request');
  }
}

// Get all employees
export async function getEmployees(): Promise<Employee[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/employees`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employees');
  }

  const data = await response.json();
  return data.employees || [];
}

// Get employee by UID
export async function getEmployeeByUID(uid: string): Promise<Employee> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/employees/${uid}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employee');
  }

  const data = await response.json();
  return data.employee;
}

// Get employee meal data for a specific month (admin only)
export async function getEmployeeMealMonth(uid: string, year: number, month: number): Promise<MealMonth> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/admin/employees/${uid}/meals/${year}/${month}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch meal data');
  }

  const data = await response.json();
  return data.meal_month;
}
