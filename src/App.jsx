import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Tasks from "./pages/Tasks";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Public routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
