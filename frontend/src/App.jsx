import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Dashboard } from './pages/Dashboard';
import { Recognition } from './pages/Recognition';
import { Attendance } from './pages/Attendance';
import { Employees } from './pages/Employees';
import { Enrollment } from './pages/Enrollment';
import { AccessControl } from './pages/AccessControl';
import { SystemAdmin } from './pages/SystemAdmin';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'recognition':
        return <Recognition />;
      case 'attendance':
        return <Attendance />;
      case 'employees':
        return <Employees setActiveTab={setActiveTab} />;
      case 'enrollment':
        return <Enrollment />;
      case 'access':
        return <AccessControl />;
      case 'devices':
      case 'system':
      case 'settings':
        return <SystemAdmin />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <main className="flex-1 p-6 w-full overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
