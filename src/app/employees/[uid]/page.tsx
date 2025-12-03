'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearToken, getEmployeeByUID, getEmployeeMealMonth, Employee, MealMonth } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const API_BASE_URL = 'http://10.10.10.176:8080';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;
  const { theme, toggleTheme } = useTheme();

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [mealData, setMealData] = useState<MealMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    loadEmployeeData();
  }, [router, uid]);

  useEffect(() => {
    if (employee) {
      loadMealData();
    }
  }, [employee, selectedYear, selectedMonth]);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError('');
    try {
      const emp = await getEmployeeByUID(uid);
      setEmployee(emp);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const loadMealData = async () => {
    try {
      const data = await getEmployeeMealMonth(uid, selectedYear, selectedMonth);
      setMealData(data);
    } catch (err: any) {
      console.error('Failed to load meal data:', err);
      setMealData(null);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Calculate meal statistics
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const mealDays = mealData?.days || {};
  const mealsOn = Object.values(mealDays).filter(v => v === 1).length;
  const mealsOff = Object.values(mealDays).filter(v => v === 0).length;

  // Calculate meals till today
  const isSameMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;
  const daysTillToday = isSameMonth ? today.getDate() : daysInMonth;
  let mealsTillToday = 0;
  for (let d = 1; d <= daysTillToday; d++) {
    if (mealDays[d.toString()] === 1) {
      mealsTillToday++;
    }
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">OEL Meal Admin</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Dashboard
                </Link>
                <Link href="/employees" className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                  Employees
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/employees"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Employees
        </Link>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : employee ? (
          <>
            {/* Employee Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
              <div className="flex items-center gap-6">
                {employee.image_url ? (
                  <img
                    src={getImageUrl(employee.image_url) || ''}
                    alt={employee.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-3xl">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{employee.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {employee.department}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      employee.role === 'ADMIN'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {employee.role}
                    </span>
                  </div>
                  {employee.phone && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-medium">Phone:</span> {employee.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Month Selector and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Month Selector */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Select Month</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meals ON */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mealsOn}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Meals ON</p>
                  </div>
                </div>
              </div>

              {/* Meals OFF */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mealsOff}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Meals OFF</p>
                  </div>
                </div>
              </div>

              {/* Meals Till Today */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mealsTillToday}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isSameMonth ? 'Till Today' : 'Total This Month'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {months[selectedMonth - 1]} {selectedYear} - Meal Calendar
              </h3>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for first week */}
                {Array.from({ length: getFirstDayOfMonth(selectedYear, selectedMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const mealStatus = mealDays[day.toString()];
                  const isToday = isSameMonth && day === today.getDate();
                  const isPast = selectedYear < today.getFullYear() ||
                    (selectedYear === today.getFullYear() && selectedMonth < today.getMonth() + 1) ||
                    (isSameMonth && day < today.getDate());

                  return (
                    <div
                      key={day}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } ${
                        mealStatus === 1
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                          : mealStatus === 0
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span className="font-medium">{day}</span>
                      {mealStatus !== undefined && (
                        <span className="text-xs mt-0.5">
                          {mealStatus === 1 ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/50"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Meal ON</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/50"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Meal OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">No Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded ring-2 ring-blue-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Employee not found
          </div>
        )}
      </main>
    </div>
  );
}
