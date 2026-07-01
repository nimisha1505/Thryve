import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 bg-transparent overflow-y-auto w-full">
          <div className="max-w-[1440px] w-full mx-auto page-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
