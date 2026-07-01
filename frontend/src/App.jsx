import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MoodTracker from './pages/MoodTracker.jsx';
import JournalPage from './pages/JournalPage.jsx';
import AIChat from './pages/AIChat.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import HabitTracker from './pages/HabitTracker.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import ResourceDetail from './pages/ResourceDetail.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Website Pages (Navbar + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />

            {/* Guest-only auth routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Secure authenticated user routes (Navbar + Sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/companion" element={<AIChat />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/habits" element={<HabitTracker />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
