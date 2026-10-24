import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Profile from './pages/Profile';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public pages every URL works (a logged-in user gets bounced to their dashboard). */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

      {/* Admin pages — the guard checks the session before loading the layout. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="requests" element={<PlaceholderPage title="Request Approval" stage={8} />} />
        <Route path="borrowed" element={<PlaceholderPage title="Borrowed Equipment" stage={8} />} />
        <Route path="returns" element={<PlaceholderPage title="Equipment Returns" stage={8} />} />
        <Route path="inventory" element={<PlaceholderPage title="Inventory" stage={6} />} />
        <Route path="inventory/:id" element={<PlaceholderPage title="Equipment Details" stage={6} />} />
        <Route path="facilities" element={<PlaceholderPage title="Facilities" stage={6} />} />
        <Route path="history" element={<PlaceholderPage title="Borrowing History" stage={9} />} />
        <Route path="users" element={<PlaceholderPage title="Users" stage={9} />} />
        <Route path="reports" element={<PlaceholderPage title="Reports" stage={9} />} />
      </Route>

      {/* Student pages */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <AppLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="equipment" element={<PlaceholderPage title="Equipments" stage={6} />} />
        <Route path="equipment/:id" element={<PlaceholderPage title="Equipment Details" stage={6} />} />
        <Route path="request/new" element={<PlaceholderPage title="Borrowing Request" stage={7} />} />
        <Route path="requests" element={<PlaceholderPage title="My Requests" stage={7} />} />
        <Route path="history" element={<PlaceholderPage title="My History" stage={9} />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
