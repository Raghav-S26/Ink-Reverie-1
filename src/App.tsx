
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrowsePoems from "./pages/BrowsePoems";
import PoemDetail from "./pages/PoemDetail";
import Contests from "./pages/Contests";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import Auth from "./pages/Auth";
import SubmitPoem from "./pages/SubmitPoem";
import Profile from "./pages/Profile";
import AdminRoute from "./components/AdminRoute";
import CreateContest from "./pages/CreateContest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/poems" element={<BrowsePoems />} />
              <Route path="/poems/:id" element={<PoemDetail />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/submit-poem" element={<SubmitPoem />} />
              <Route path="/profile" element={<Profile />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/create-contest" element={<CreateContest />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
