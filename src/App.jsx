import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AccountGate from "./components/auth/AccountGate.jsx";
import AdminRoute from "./components/auth/adminRoute.jsx";

import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import SCPFile from "./pages/SCPFile.jsx";
import EditSCP from "./pages/EditSCP.jsx";

import Personnel from "./pages/Personnel";
import Facilities from "./pages/Facilities";
import Incidents from "./pages/Incidents";
import Terminal from "./pages/Terminal";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

import PendingAccess from "./pages/PendingAccess.jsx";
import AccessDenied from "./pages/AccessDenied.jsx";

import Admin from "./pages/Admin.jsx";

function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC AUTH ROUTES
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =========================
          COMMAND CENTER
      ========================= */}

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

      {/* =========================
          SCP DATABASE
      ========================= */}

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

      {/* SCP DETAIL */}

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

      {/* SCP EDIT — ADMIN ONLY */}

      <Route
        path="/database/:scpId/edit"
        element={
          <ProtectedRoute>
            <AccountGate>
              <AdminRoute>
                <MainLayout>
                  <EditSCP />
                </MainLayout>
              </AdminRoute>
            </AccountGate>
          </ProtectedRoute>
        }
      />

      {/* =========================
          SITE-19 OPERATIONS
      ========================= */}

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

      {/* =========================
          ACCOUNT STATUS
      ========================= */}

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

      {/* =========================
          ADMIN CONTROL
      ========================= */}

      <Route
  path="/database/:scpId/edit"
  element={
    <ProtectedRoute>
      <AccountGate>
        <AdminRoute>
          <MainLayout>
            <EditSCP />
          </MainLayout>
        </AdminRoute>
      </AccountGate>
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;