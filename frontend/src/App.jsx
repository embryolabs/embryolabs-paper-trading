// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage"; 

import { Toaster } from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';

import { useAuthStore } from "./store/authStore";

import CombinedDashboard from "./pages/CombinedDashboard";
import StockDetails from "./components/StockDetails"; 

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }
    if (!user?.isVerified) {
        return <Navigate to='/verify-email' replace />;
    }
    return children;
};

// Redirect authenticated users away from auth pages
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    if (isAuthenticated && user?.isVerified) {
        return <Navigate to='/' replace />;
    }
    return children;
};

function App() {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
          </Spinner>
      </div>
  ); // REPLACE WITH SPINNER FROM TIKTOK

    return (
        <div className="">
            {/* Routes */}
            <Routes>
                {/* Authentication Routes */}
                <Route path="/signup" element={
                    <RedirectAuthenticatedUser>
                        <SignUpPage />
                    </RedirectAuthenticatedUser>
                } />
                <Route path="/login" element={
                    <RedirectAuthenticatedUser>
                        <LoginPage />
                    </RedirectAuthenticatedUser>
                } />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/forgot-password" element={
                    <RedirectAuthenticatedUser>
                        <ForgotPasswordPage />
                    </RedirectAuthenticatedUser>
                } />
                <Route path="/reset-password/:token" element={
                    <RedirectAuthenticatedUser>
                        <ResetPasswordPage />
                    </RedirectAuthenticatedUser>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <CombinedDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={ // Add the Profile route
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/stocks/:symbol" element={
                    <ProtectedRoute>
                        <StockDetails />
                    </ProtectedRoute>
                } /> {/* Add the StockDetails route */}

                {/* Catch-All Route */}
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster />
        </div>
    );
}

export default App;
