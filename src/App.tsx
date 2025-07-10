
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Header as SharedHeader } from "./components/shared/Header";
import { Header as LandingHeader } from "./components/landing/Header";
import { Footer } from "./components/landing/Footer";
import { AuthProvider } from "./context/AuthContext";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { ConsultantRoute } from "./components/auth/ConsultantRoute";
import AdminDashboardPage from "./pages/AdminDashboard";
import DashboardPage from './pages/DashboardPage';
import ConsultantProfilePage from './pages/ConsultantProfilePage';
import ConsultantsPage from './pages/ConsultantsPage';
import ChatListPage from "./pages/ChatListPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import BookingPage from "./pages/BookingPage";
import BillingPage from "./pages/BillingPage";
import ConsultantDashboardPage from "./pages/ConsultantDashboardPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import ClientPage from "./pages/ClientPage";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const { user, loading, roles } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        Loading...
      </div>
    );
  }

  // Redirect logged-in users from public root pages to their primary dashboard
  if (user && (location.pathname === '/' || location.pathname === '/auth')) {
    if (roles.includes('admin')) {
      return <Navigate to="/admin" replace />;
    }
    if (roles.includes('consultant') && !roles.includes('client')) {
      return <Navigate to="/consultant-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const publicPaths = ['/', '/client', '/consultants', '/contact', '/privacy', '/terms', '/auth', '/update-password'];
  const isPublicPage = publicPaths.includes(location.pathname);

  const showLandingHeader = isPublicPage && !user;
  const showFooter = isPublicPage;

  return (
    <div className="flex flex-col min-h-screen">
      {showLandingHeader ? <LandingHeader /> : <SharedHeader />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:roomId" element={<ChatRoomPage />} />
          </Route>
          <Route element={<ConsultantRoute />}>
            <Route path="/consultant-dashboard" element={<ConsultantDashboardPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/consultants/:id" element={<ConsultantProfilePage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

const App = () => {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      const hideTimeout = setTimeout(() => {
        preloader.classList.add('hidden');
      }, 10); // Reduced delay for faster fade-out start

      const removeTimeout = setTimeout(() => {
        preloader.remove();
      }, 510); // 10ms delay + 500ms transition

      return () => {
        clearTimeout(hideTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
