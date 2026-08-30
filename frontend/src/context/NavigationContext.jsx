import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationContext = createContext(null);

export const NAV_ITEMS = [
  // Overview
  { id: 'dashboard', label: 'Dashboard', group: 'OVERVIEW' },
  // Workforce
  { id: 'employees', label: 'Employees', group: 'WORKFORCE' },
  { id: 'departments', label: 'Departments', group: 'WORKFORCE' },
  { id: 'designations', label: 'Designations', group: 'WORKFORCE' },
  { id: 'shifts', label: 'Shifts', group: 'WORKFORCE' },
  // Attendance
  { id: 'attendance', label: 'Attendance', group: 'ATTENDANCE' },
  // AI & Biometrics
  { id: 'recognition', label: 'Face Recognition', group: 'AI & BIOMETRICS' },
  { id: 'enrollments', label: 'Enrollments', group: 'AI & BIOMETRICS' },
  // System
  { id: 'system-health', label: 'System Health', group: 'SYSTEM' },
];

export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with window.location hash for clean reload persistence
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      const [page, queryString] = hash.split('?');
      const params = {};
      if (queryString) {
        new URLSearchParams(queryString).forEach((val, key) => {
          params[key] = val;
        });
      }
      setCurrentPage(page || 'dashboard');
      setPageParams(params);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((pageId, params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const hash = searchParams ? `#${pageId}?${searchParams}` : `#${pageId}`;
    window.location.hash = hash;
    setCurrentPage(pageId);
    setPageParams(params);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getBreadcrumbs = useCallback(() => {
    const crumbs = [{ label: 'FaceAttend AI', pageId: 'dashboard' }];

    if (currentPage === 'dashboard') {
      return [{ label: 'Dashboard', pageId: 'dashboard' }];
    }

    const currentNav = NAV_ITEMS.find((n) => n.id === currentPage);
    if (currentNav) {
      if (currentNav.group && currentNav.group !== 'OVERVIEW') {
        crumbs.push({ label: currentNav.group, isCategory: true });
      }
      crumbs.push({ label: currentNav.label, pageId: currentNav.id });
    }

    if (currentPage === 'employee-profile' && pageParams.employeeName) {
      crumbs.push({ label: pageParams.employeeName, isCurrent: true });
    } else if (currentPage === 'enrollment-wizard') {
      crumbs.push({ label: 'Enroll Face Biometrics', isCurrent: true });
    }

    return crumbs;
  }, [currentPage, pageParams]);

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        pageParams,
        navigate,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        getBreadcrumbs,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default NavigationContext;
