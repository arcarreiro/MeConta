
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role } from './types';
import { Store } from './services/store';
import { Loader2 } from 'lucide-react';

// Components
import Login from './pages/Login/index';
import Dashboard from './pages/Dashboard/index';
import AdminPanel from './pages/AdminPanel/index';
import UserManagement from './pages/UserManagement/index';
import MonitorPanel from './pages/MonitorPanel/index';
import StudentPanel from './pages/StudentPanel/index';
import ReportView from './pages/ReportView/index';
import Profile from './pages/Profile/index';
import MonitorReportView from './pages/MonitorReportView/index';
import TrajectoryReportView from './pages/TrajectoryReportView/index';
import CourseReportView from './pages/CourseReportView/index';
import StudentDetails from './pages/StudentDetails/index';
import { PageLayout } from './components/Layout/PageLayout/index';


const PrivateRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: Role[] }) => {
  const user = Store.getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Store.init().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <PageLayout><Dashboard /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <PageLayout><Profile /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <PageLayout><AdminPanel /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <PageLayout><UserManagement /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/student/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <PageLayout><StudentDetails /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/monitor" element={
          <PrivateRoute allowedRoles={[Role.MONITOR, Role.ADMIN]}>
            <PageLayout><MonitorPanel /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/student" element={
          <PrivateRoute allowedRoles={[Role.STUDENT]}>
            <PageLayout><StudentPanel /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/report/:id" element={
          <PrivateRoute>
            <PageLayout><ReportView /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/monitor-report/:id" element={
          <PrivateRoute allowedRoles={[Role.MONITOR, Role.ADMIN]}>
            <PageLayout><MonitorReportView /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/trajectory-report/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN, Role.STUDENT]}>
            <PageLayout><TrajectoryReportView /></PageLayout>
          </PrivateRoute>
        } />
        <Route path="/course-report/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <PageLayout><CourseReportView /></PageLayout>
          </PrivateRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
