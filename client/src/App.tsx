import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Diagnosis from "./pages/Diagnosis";
import NetWorth from "./pages/NetWorth";
import Retirement from "./pages/Retirement";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";

function Router() {
  return (
    <AppShell>
      <Switch>
        {/* Public routes (Beranda & Diagnosis) */}
        <Route path="/" component={Home} />
        <Route path="/diagnosis" component={Diagnosis} />
        <Route path="/diagnosis-preview" component={Diagnosis} />
        <Route path="/diagnosis-preview/result" component={Diagnosis} />

        {/* User-protected routes (Memerlukan Login) */}
        <Route path="/networth">
          {() => (
            <ProtectedRoute>
              <NetWorth />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/retirement">
          {() => (
            <ProtectedRoute>
              <Retirement />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/pricing">
          {() => (
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          )}
        </Route>

        {/* Admin-only route (Memerlukan Role Admin/Owner) */}
        <Route path="/owner">
          {() => (
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          )}
        </Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
