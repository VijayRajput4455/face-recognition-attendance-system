import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import AppLayout from './components/layout/AppLayout';

import DashboardPage from './features/dashboard/DashboardPage';
import EmployeesPage from './features/employees/EmployeesPage';
import EmployeeProfile from './features/employees/EmployeeProfile';
import DepartmentsPage from './features/departments/DepartmentsPage';
import ShiftsPage from './features/shifts/ShiftsPage';
import AttendancePage from './features/attendance/AttendancePage';
import RecognitionPage from './features/recognition/RecognitionPage';
import EnrollmentsListPage from './features/enrollments/EnrollmentsListPage';
import SystemHealthPage from './features/system-health/SystemHealthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRouter() {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'employee-profile':
        return <EmployeeProfile />;
      case 'departments':
        return <DepartmentsPage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'recognition':
        return <RecognitionPage />;
      case 'enrollments':
      case 'enrollment-wizard':
        return <EnrollmentsListPage />;
      case 'system-health':
        return <SystemHealthPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderCurrentPage()}</AppLayout>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NavigationProvider>
          <AppRouter />
        </NavigationProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
