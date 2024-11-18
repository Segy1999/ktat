import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Booking from "./pages/Booking";
import Policy from "./pages/Policy";
import Contact from "./pages/Contact";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/admin/Login";
import AdminSetup from "./pages/admin/setup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;