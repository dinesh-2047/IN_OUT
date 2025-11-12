import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoadingSpinner from './components/LoadingSpinner'
import CursorAnimation from './components/CursorAnimation'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import StudentDashboard from './pages/StudentDashboard'
import ApproverDashboard from './pages/ApproverDashboard'
import SecurityDashboard from './pages/SecurityDashboard'

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          !user ? (
            <Auth />
          ) : (
            <Navigate
              to={
                user.role === 'student'
                  ? '/student-dashboard'
                  : user.role === 'security'
                  ? '/security-dashboard'
                  : ['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden'].includes(
                      user.role
                    )
                  ? '/approver-dashboard'
                  : '/'
              }
              replace
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          !user ? (
            <Auth />
          ) : (
            <Navigate
              to={
                user.role === 'student'
                  ? '/student-dashboard'
                  : user.role === 'security'
                  ? '/security-dashboard'
                  : ['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden'].includes(
                      user.role
                    )
                  ? '/approver-dashboard'
                  : '/'
              }
              replace
            />
          )
        }
      />
      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute allowedRoles={['student']}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/approver-dashboard"
        element={
          <PrivateRoute
            allowedRoles={['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden']}
          >
            <ApproverDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <PrivateRoute
            allowedRoles={['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden']}
          >
            <ApproverDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/warden-dashboard"
        element={
          <PrivateRoute
            allowedRoles={['teacher', 'class_incharge', 'classincharge', 'hod', 'dean', 'vc', 'warden']}
          >
            <ApproverDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/security-dashboard"
        element={
          <PrivateRoute allowedRoles={['security']}>
            <SecurityDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <CursorAnimation />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

