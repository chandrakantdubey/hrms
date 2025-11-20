import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./layouts/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import { Toaster } from "./components/ui/sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/ui/loader";

const LoginPage = lazy(() => import("./pages/Login"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Leaves = lazy(() => import("./pages/Leaves"));
const Team = lazy(() => import("./pages/Team"));
const Requests = lazy(() => import("./pages/Requests"));

const Approvals = lazy(() => import("./pages/Approvals"));

const Employees = lazy(() => import("./pages/Employees"));
const AddEmployee = lazy(() => import("./pages/AddEmployee"));
const Employee = lazy(() => import("./pages/Employee"));
const Announcements = lazy(() => import("./pages/Announcements"));

const Payroll = lazy(() => import("./pages/Payroll"));
const Masters = lazy(() => import("./pages/Masters"));

const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router basename="/hrms">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/leaves" element={<Leaves />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/requests" element={<Requests />} />

                  <Route path="/approvals" element={<Approvals />} />

                  <Route path="/employees" element={<Employees />} />
                  <Route path="/employees/:id" element={<Employee />} />
                  <Route path="/add-employee" element={<AddEmployee />} />
                  <Route path="/announcements" element={<Announcements />} />

                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/masters" element={<Masters />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
