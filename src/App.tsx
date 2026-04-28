import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import HomePage from "./pages/Home";
import FornecedoresPage from "./pages/Fornecedores";
import ImportadorasHub from "./pages/importadoras/ImportadorasHub";
import ImportadorasCategorias from "./pages/importadoras/ImportadorasCategorias";
import ImportadorasNicho from "./pages/importadoras/ImportadorasNicho";
import ImportadorasFornecedor from "./pages/importadoras/ImportadorasFornecedor";
import ImportadorasBusca from "./pages/importadoras/ImportadorasBusca";
import ImportadorasFavoritos from "./pages/importadoras/ImportadorasFavoritos";
import BolsasProtected from "./pages/bolsas/BolsasProtected";
import EcosystemProtected from "./components/EcosystemProtected";
import BolsasHub from "./pages/bolsas/BolsasHub";
import BolsasLista from "./pages/bolsas/BolsasLista";
import BolsasBusca from "./pages/bolsas/BolsasBusca";
import BolsasFavoritos from "./pages/bolsas/BolsasFavoritos";
import EstruturePage from "./pages/Estruture";
import VendasPage from "./pages/Vendas";
import VendasMarketplacesPage from "./pages/VendasMarketplaces";
import DominioSitePage from "./pages/DominioSite";
import AbrirMeiPage from "./pages/AbrirMei";
import LogoMarcaPage from "./pages/LogoMarca";
import RegistrarMarcaPage from "./pages/RegistrarMarca";
import GestaoPage from "./pages/Gestao";
import PricingLayout from "./components/precificacao/PricingLayout";
import PrecificacaoHub from "./pages/gestao/PrecificacaoHub";
import PrecificacaoSimulador from "./pages/gestao/PrecificacaoSimulador";
import PrecificacaoCanais from "./pages/gestao/PrecificacaoCanais";
import PrecificacaoConfiguracoes from "./pages/gestao/PrecificacaoConfiguracoes";
import SophPage from "./pages/Soph";
import AcessosPage from "./pages/Acessos";
import ContaPage from "./pages/Conta";
import TermosPage from "./pages/Termos";
import PrivacidadePage from "./pages/Privacidade";
import CookiesPage from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import ObrigadoPage from "./pages/Obrigado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/obrigado" element={<ObrigadoPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/fornecedores" element={<FornecedoresPage />} />
              <Route path="/fornecedores/importadoras-25" element={<EcosystemProtected><ImportadorasHub /></EcosystemProtected>} />
              <Route path="/fornecedores/importadoras-25/categorias" element={<EcosystemProtected><ImportadorasCategorias /></EcosystemProtected>} />
              <Route path="/fornecedores/importadoras-25/categoria/:slug" element={<EcosystemProtected><ImportadorasNicho /></EcosystemProtected>} />
              <Route path="/fornecedores/importadoras-25/fornecedor/:id" element={<EcosystemProtected><ImportadorasFornecedor /></EcosystemProtected>} />
              <Route path="/fornecedores/importadoras-25/busca" element={<EcosystemProtected><ImportadorasBusca /></EcosystemProtected>} />
              <Route path="/fornecedores/importadoras-25/favoritos" element={<EcosystemProtected><ImportadorasFavoritos /></EcosystemProtected>} />
              {/* Nicho: Bolsas, Mochilas e Malas */}
              <Route path="/fornecedores/bolsas-mochilas-malas" element={<BolsasProtected><BolsasHub /></BolsasProtected>} />
              <Route path="/fornecedores/bolsas-mochilas-malas/lista" element={<BolsasProtected><BolsasLista /></BolsasProtected>} />
              <Route path="/fornecedores/bolsas-mochilas-malas/busca" element={<BolsasProtected><BolsasBusca /></BolsasProtected>} />
              <Route path="/fornecedores/bolsas-mochilas-malas/favoritos" element={<BolsasProtected><BolsasFavoritos /></BolsasProtected>} />
              <Route path="/fornecedores/bolsas-mochilas-malas/fornecedor/:id" element={<BolsasProtected><ImportadorasFornecedor /></BolsasProtected>} />
              <Route path="/estruture" element={<EcosystemProtected><EstruturePage /></EcosystemProtected>} />
              <Route path="/vendas" element={<EcosystemProtected><VendasPage /></EcosystemProtected>} />
              <Route path="/vendas/marketplaces" element={<EcosystemProtected><VendasMarketplacesPage /></EcosystemProtected>} />
              <Route path="/vendas/dominio-site" element={<EcosystemProtected><DominioSitePage /></EcosystemProtected>} />
              <Route path="/estrutura/abrir-mei" element={<EcosystemProtected><AbrirMeiPage /></EcosystemProtected>} />
              <Route path="/estrutura/logo-marca" element={<EcosystemProtected><LogoMarcaPage /></EcosystemProtected>} />
              <Route path="/estrutura/registrar-marca" element={<EcosystemProtected><RegistrarMarcaPage /></EcosystemProtected>} />
              <Route path="/gestao" element={<EcosystemProtected><GestaoPage /></EcosystemProtected>} />
              <Route path="/gestao/precificacao" element={<EcosystemProtected><PricingLayout /></EcosystemProtected>}>
                <Route index element={<PrecificacaoHub />} />
                <Route path="simulador" element={<PrecificacaoSimulador />} />
                <Route path="canais" element={<PrecificacaoCanais />} />
                <Route path="configuracoes" element={<PrecificacaoConfiguracoes />} />
              </Route>
              <Route path="/soph" element={<EcosystemProtected><SophPage /></EcosystemProtected>} />
              <Route path="/acessos" element={<AcessosPage />} />
              <Route path="/conta" element={<ContaPage />} />
              <Route path="/termos" element={<TermosPage />} />
              <Route path="/privacidade" element={<PrivacidadePage />} />
              <Route path="/cookies" element={<CookiesPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
