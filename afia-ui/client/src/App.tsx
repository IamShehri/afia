import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { CommandPalette } from "./components/command/CommandPalette";
import { AppShell } from "./components/shell/AppShell";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Schedule from "./pages/Schedule";
import Inbox from "./pages/Inbox";
import Assistant from "./pages/Assistant";
import DocumentStudio from "./pages/DocumentStudio";
import MyResearch from "./pages/MyResearch";
import BatchProcess from "./pages/BatchProcess";
import ModelCompare from "./pages/ModelCompare";
import Deidentify from "./pages/Deidentify";
import Models from "./pages/Models";
import Insights from "./pages/Insights";
import { Loader2 } from "lucide-react";
import Settings from "./pages/Settings";

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!session) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/">{() => <PrivateRoute><Shell><Home /></Shell></PrivateRoute>}</Route>
      <Route path="/patients">{() => <PrivateRoute><Shell><Patients /></Shell></PrivateRoute>}</Route>
      <Route path="/patients/:id">
        {(params) => <PrivateRoute><Shell><PatientDetail id={params.id} /></Shell></PrivateRoute>}
      </Route>
      <Route path="/schedule">{() => <PrivateRoute><Shell><Schedule /></Shell></PrivateRoute>}</Route>
      <Route path="/inbox">{() => <PrivateRoute><Shell><Inbox /></Shell></PrivateRoute>}</Route>
      <Route path="/assistant">{() => <PrivateRoute><Shell><Assistant /></Shell></PrivateRoute>}</Route>
      <Route path="/documents">{() => <PrivateRoute><Shell><DocumentStudio /></Shell></PrivateRoute>}</Route>
      <Route path="/research">{() => <PrivateRoute><Shell><MyResearch /></Shell></PrivateRoute>}</Route>
      <Route path="/batch">{() => <PrivateRoute><Shell><BatchProcess /></Shell></PrivateRoute>}</Route>
      <Route path="/compare">{() => <PrivateRoute><Shell><ModelCompare /></Shell></PrivateRoute>}</Route>
      <Route path="/deidentify">{() => <PrivateRoute><Shell><Deidentify /></Shell></PrivateRoute>}</Route>
      <Route path="/models">{() => <PrivateRoute><Shell><Models /></Shell></PrivateRoute>}</Route>
      <Route path="/insights">{() => <PrivateRoute><Shell><Insights /></Shell></PrivateRoute>}</Route>
      <Route path="/settings">{() => <PrivateRoute><Shell><Settings /></Shell></PrivateRoute>}</Route>
      <Route path="/settings/:section">
        {(params) => <PrivateRoute><Shell><Settings /></Shell></PrivateRoute>}
      </Route>

      <Route path="/404">{() => <PrivateRoute><NotFound /></PrivateRoute>}</Route>
      <Route>{() => <PrivateRoute><NotFound /></PrivateRoute>}</Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider delayDuration={200} skipDelayDuration={0}>
          <AuthProvider>
            <WorkspaceProvider>
              <Toaster position="bottom-right" />
              <CommandPalette />
              <Router />
            </WorkspaceProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
