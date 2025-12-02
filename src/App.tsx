import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import RoutePlanner from "./pages/RoutePlanner";
import Weather from "./pages/Weather";
import AIAnalyst from "./pages/AIAnalyst";
import EmergencySOS from "./pages/EmergencySOS";
import Places from "./pages/Places";
import MoreMenu from "./pages/MoreMenu";
import Deals from "./pages/Deals";
import Budget from "./pages/Budget";
import Visa from "./pages/Visa";
import Analytics from "./pages/Analytics";
import Journal from "./pages/Journal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/plan" element={
              <ProtectedRoute>
                <AppLayout><RoutePlanner /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <AppLayout><Weather /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai" element={
              <ProtectedRoute>
                <AppLayout><AIAnalyst /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/sos" element={
              <ProtectedRoute>
                <AppLayout><EmergencySOS /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/places" element={
              <ProtectedRoute>
                <AppLayout><Places /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/more" element={
              <ProtectedRoute>
                <AppLayout><MoreMenu /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/deals" element={
              <ProtectedRoute>
                <AppLayout><Deals /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <AppLayout><Budget /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/visa" element={
              <ProtectedRoute>
                <AppLayout><Visa /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout><Analytics /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/journal" element={
              <ProtectedRoute>
                <AppLayout><Journal /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
