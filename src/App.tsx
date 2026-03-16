import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import GetQuote from "./pages/GetQuote";

// Service Pages
import GeneralParcel from "./pages/services/GeneralParcel";
import FullTruckLoad from "./pages/services/FullTruckLoad";

// Request Pages
import GeneralParcelRequest from "./pages/request/GeneralParcelRequest";
import FullTruckLoadRequest from "./pages/request/FullTruckLoadRequest";

// Dashboard Pages
import CustomerDashboard from "./pages/customer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quote" element={<GetQuote />} />

            {/* Service Routes */}
            <Route path="/services/general-parcel" element={<GeneralParcel />} />
            <Route path="/services/full-truck-load" element={<FullTruckLoad />} />

            {/* Protected Request Routes */}
            <Route
              path="/request/general-parcel"
              element={
                <ProtectedRoute>
                  <GeneralParcelRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request/full-truck-load"
              element={
                <ProtectedRoute>
                  <FullTruckLoadRequest />
                </ProtectedRoute>
              }
            />

            {/* Protected Customer Dashboard */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
