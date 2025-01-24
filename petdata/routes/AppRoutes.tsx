// src/routes/AppRoutes.tsx
import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import RedirectToDashboardOrLogin from "./RedirectToDashboardOrLogin";
import PageLoadingSkelton from "../components/PageLoadingSkelton";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Appointments = lazy(() => import("../pages/appointments/page"));
const AppointmentCalendar = lazy(
  () => import("../pages/appointments/Calendar")
);
const AppointmentUnconfirmed = lazy(
  () => import("../pages/appointments/Unconfirmed")
);
const SmartMonitor = lazy(() => import("../pages/SmartMonitor"));

const AppRoutes: React.FC = () => (
  <Router>
    <RedirectToDashboardOrLogin>
      <Routes>
        {/* 根路徑重定向 */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* 公共路由 */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoadingSkelton />}>
              <Login />
            </Suspense>
          }
        />

        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoadingSkelton />}>
              <Register />
            </Suspense>
          }
        />

        {/* 受保護的路由，使用 Layout 組件包裹 */}
        <Route
          path="smart-monitor"
          element={
            <Suspense fallback={<PageLoadingSkelton />}>
              <SmartMonitor />
            </Suspense>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          
        </Route>

        {/* 其他公共路由 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RedirectToDashboardOrLogin>
  </Router>
);

export default AppRoutes;
