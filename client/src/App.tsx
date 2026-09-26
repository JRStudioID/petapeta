import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppShell from "./components/AppShell";
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
        <Route path="/" component={Home} />
        <Route path="/diagnosis" component={Diagnosis} />
        <Route path="/diagnosis-preview" component={Diagnosis} />
        <Route path="/diagnosis-preview/result" component={Diagnosis} />
        <Route path="/networth" component={NetWorth} />
        <Route path="/retirement" component={Retirement} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/owner" component={Admin} />
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
