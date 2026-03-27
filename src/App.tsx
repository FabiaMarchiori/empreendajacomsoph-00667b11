import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "./pages/Home";
import FornecedoresPage from "./pages/Fornecedores";
import ImportadorasHub from "./pages/importadoras/ImportadorasHub";
import ImportadorasCategorias from "./pages/importadoras/ImportadorasCategorias";
import ImportadorasNicho from "./pages/importadoras/ImportadorasNicho";
import ImportadorasFornecedor from "./pages/importadoras/ImportadorasFornecedor";
import ImportadorasBusca from "./pages/importadoras/ImportadorasBusca";
import ImportadorasFavoritos from "./pages/importadoras/ImportadorasFavoritos";
import EstruturePage from "./pages/Estruture";
import VendasPage from "./pages/Vendas";
import VendasMarketplacesPage from "./pages/VendasMarketplaces";
import DominioSitePage from "./pages/DominioSite";
import AbrirMeiPage from "./pages/AbrirMei";
import LogoMarcaPage from "./pages/LogoMarca";
import RegistrarMarcaPage from "./pages/RegistrarMarca";
import GestaoPage from "./pages/Gestao";
import SophPage from "./pages/Soph";
import AcessosPage from "./pages/Acessos";
import ContaPage from "./pages/Conta";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/fornecedores" element={<FornecedoresPage />} />
            <Route path="/fornecedores/importadoras-25" element={<ImportadorasHub />} />
            <Route path="/fornecedores/importadoras-25/categorias" element={<ImportadorasCategorias />} />
            <Route path="/fornecedores/importadoras-25/categoria/:slug" element={<ImportadorasNicho />} />
            <Route path="/fornecedores/importadoras-25/fornecedor/:id" element={<ImportadorasFornecedor />} />
            <Route path="/fornecedores/importadoras-25/busca" element={<ImportadorasBusca />} />
            <Route path="/fornecedores/importadoras-25/favoritos" element={<ImportadorasFavoritos />} />
            <Route path="/estruture" element={<EstruturePage />} />
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/vendas/marketplaces" element={<VendasMarketplacesPage />} />
            <Route path="/vendas/dominio-site" element={<DominioSitePage />} />
            <Route path="/estrutura/abrir-mei" element={<AbrirMeiPage />} />
            <Route path="/estrutura/logo-marca" element={<LogoMarcaPage />} />
            <Route path="/estrutura/registrar-marca" element={<RegistrarMarcaPage />} />
            <Route path="/gestao" element={<GestaoPage />} />
            <Route path="/soph" element={<SophPage />} />
            <Route path="/acessos" element={<AcessosPage />} />
            <Route path="/conta" element={<ContaPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
