import { Toaster } from "@/components/ui/toaster";
import { HeroUIProvider } from "@heroui/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import LandingAlt from "./pages/LandingAlt";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAppStore } from "@/store";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HeroUIProvider>
          <ThemeApplier>
            <BrowserRouter>
              <Routes>
                {/* <Route path="/" element={<Landing />} /> */}
                <Route path="/" element={<LandingAlt />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeApplier>
        </HeroUIProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

const ThemeApplier = ({ children }: { children?: React.ReactNode }) => {
  const theme = useAppStore((s) => s.appSettings.theme);

  // apply persisted theme immediately on mount to avoid FOUC
  useEffect(() => {
    try {
      const raw = localStorage.getItem("app-store");
      if (raw) {
        const parsed = JSON.parse(raw);
        const persistedTheme = parsed?.state?.appSettings?.theme;
        const root = document.documentElement;
        if (persistedTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
};
