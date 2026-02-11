
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Role, User, RoundStatus } from './types';
import { Store } from './services/store';
import { 
  LogOut, 
  MessageSquare, 
  FileText,
  User as UserIcon,
  Settings,
  Loader2
} from 'lucide-react';

// Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/UserManagement';
import MonitorPanel from './pages/MonitorPanel';
import StudentPanel from './pages/StudentPanel';
import ReportView from './pages/ReportView';
import Profile from './pages/Profile';
import MonitorReportView from './pages/MonitorReportView';
import TrajectoryReportView from './pages/TrajectoryReportView';
import CourseReportView from './pages/CourseReportView';
import StudentDetails from './pages/StudentDetails';
import { BrandLogo } from './components/BrandLogo';


const PrivateRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: Role[] }) => {
  const user = Store.getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const Header = () => {
  const user = Store.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Store.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <Link to="/" className="flex items-center gap-3 group whitespace-nowrap shrink-0">
            <BrandLogo size="md" />
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Me<span className="text-violet-600">Conta</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3 md:space-x-6 shrink-0">
            <Link to="/profile" className="flex items-center space-x-2 text-slate-500 hover:text-violet-600 transition-all font-bold group">
               {user?.photoUrl ? (
                 <img src={user.photoUrl} className="w-9 h-9 rounded-full object-cover border-2 border-violet-100 group-hover:border-violet-600 transition-all" alt="Perfil" />
               ) : (
                 <div className="p-2 bg-slate-50 rounded-xl">
                   <UserIcon className="w-5 h-5" />
                 </div>
               )}
               <span className="hidden md:block text-sm">Perfil</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {children}
      </main>
    </div>
  );
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
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <Layout><AdminPanel /></Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <Layout><UserManagement /></Layout>
          </PrivateRoute>
        } />
        <Route path="/admin/student/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <Layout><StudentDetails /></Layout>
          </PrivateRoute>
        } />
        <Route path="/monitor" element={
          <PrivateRoute allowedRoles={[Role.MONITOR, Role.ADMIN]}>
            <Layout><MonitorPanel /></Layout>
          </PrivateRoute>
        } />
        <Route path="/student" element={
          <PrivateRoute allowedRoles={[Role.STUDENT]}>
            <Layout><StudentPanel /></Layout>
          </PrivateRoute>
        } />
        <Route path="/report/:id" element={
          <PrivateRoute>
            <Layout><ReportView /></Layout>
          </PrivateRoute>
        } />
        <Route path="/monitor-report/:id" element={
          <PrivateRoute allowedRoles={[Role.MONITOR, Role.ADMIN]}>
            <Layout><MonitorReportView /></Layout>
          </PrivateRoute>
        } />
        <Route path="/trajectory-report/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN, Role.STUDENT]}>
            <Layout><TrajectoryReportView /></Layout>
          </PrivateRoute>
        } />
        <Route path="/course-report/:id" element={
          <PrivateRoute allowedRoles={[Role.ADMIN]}>
            <Layout><CourseReportView /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
