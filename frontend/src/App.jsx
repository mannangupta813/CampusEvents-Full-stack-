import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRegistrations from './pages/MyRegistrations';
import QrPass from './pages/QrPass';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Attendance from './pages/Attendance';
import AdminDashboard from './pages/AdminDashboard';

// Route Guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Student Authenticated Routes */}
              <Route 
                path="/my-registrations" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
                    <MyRegistrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/qr-pass/:id" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                    <QrPass />
                  </ProtectedRoute>
                } 
              />

              {/* Organizer Routes */}
              <Route 
                path="/organizer" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-event" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                    <CreateEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-event/:id" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                    <EditEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                    <Attendance />
                  </ProtectedRoute>
                } 
              />

              {/* Super Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

