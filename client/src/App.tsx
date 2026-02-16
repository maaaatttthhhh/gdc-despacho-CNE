import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Dashboard from "./pages/Dashboard";
import ProcesosPracticas from "./pages/ProcesosPracticas";
import InfLogos from "./pages/InfLogos";
import Revocatorias from "./pages/Revocatorias";
import InfOrdinarios from "./pages/InfOrdinarios";
import Salvamentos from "./pages/Salvamentos";
import Archivados from "./pages/Archivados";
import Autos from "./pages/Autos";
import Oficios from "./pages/Oficios";
import Alertas from "./pages/Alertas";
import AdminUsuarios from "./pages/AdminUsuarios";
import ConfigSemaforo from "./pages/ConfigSemaforo";
import ImportarExcel from "./pages/ImportarExcel";
import DashboardLayout from "./components/DashboardLayout";
import { Loader2 } from "lucide-react";

function AuthenticatedRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/procesos-practicas" component={ProcesosPracticas} />
        <Route path="/inf-logos" component={InfLogos} />
        <Route path="/revocatorias" component={Revocatorias} />
        <Route path="/inf-ordinarios" component={InfOrdinarios} />
        <Route path="/salvamentos" component={Salvamentos} />
        <Route path="/archivados" component={Archivados} />
        <Route path="/autos" component={Autos} />
        <Route path="/oficios" component={Oficios} />
        <Route path="/alertas" component={Alertas} />
        <Route path="/admin-usuarios" component={AdminUsuarios} />
        <Route path="/config-semaforo" component={ConfigSemaforo} />
        <Route path="/importar-excel" component={ImportarExcel} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2340] to-[#1B3A5C]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#D4A843] animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Cargando sistema...</p>
        </div>
      </div>
    );
  }

if (!isAuthenticated) {
  return <AuthenticatedRouter />;
}


  return <AuthenticatedRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
