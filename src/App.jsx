import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import Personnel from "./pages/Personnel";
import Facilities from "./pages/Facilities";
import Incidents from "./pages/Incidents";
import Terminal from "./pages/Terminal";
import SCPFile from "./pages/SCPFile.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AccountGate from "./components/auth/AccountGate.jsx";
import PendingAccess from "./pages/PendingAccess.jsx";
import AccessDenied from "./pages/AccessDenied.jsx";
import Admin from "./pages/Admin.jsx";
import AdminRoute from "./components/auth/adminRoute.jsx";

function App() {
  return (
    <Routes>
      {/* PUBLIC AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED SITE-19 ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/database"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Database />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/database/:scpId"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <SCPFile />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/personnel"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Personnel />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/facilities"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Facilities />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Incidents />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      <Route
        path="/terminal"
        element={
          <ProtectedRoute>
            <AccountGate>
              <MainLayout>
                <Terminal />
              </MainLayout>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      {/* ACCOUNT STATUS ROUTES */}
      <Route
        path="/pending"
        element={
          <ProtectedRoute>
            <PendingAccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/access-denied"
        element={
          <ProtectedRoute>
            <AccessDenied />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AccountGate>
                <MainLayout>
                  <Admin />
                </MainLayout>
              </AccountGate>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;