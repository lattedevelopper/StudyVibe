import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import HomeworkDetail from "./pages/HomeworkDetail";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const hideNavigation = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/homework/:id" element={<HomeworkDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideNavigation && <BottomNav />}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
