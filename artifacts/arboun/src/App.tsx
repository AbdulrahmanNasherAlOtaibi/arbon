import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Deals from "@/pages/Deals";
import CreateDeal from "@/pages/CreateDeal";
import DealDetail from "@/pages/DealDetail";
import OpenDispute from "@/pages/OpenDispute";
import Templates from "@/pages/Templates";
import Profile from "@/pages/Profile";
import TransferMarketplace from "@/pages/TransferMarketplace";
import MyListings from "@/pages/MyListings";
import TransferRequests from "@/pages/TransferRequests";
import Landing from "@/pages/Landing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const appRoutes = ["/deals", "/templates", "/profile", "/transfers", "/dashboard"];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/deals" component={Deals} />
      <Route path="/deals/new" component={CreateDeal} />
      <Route path="/deals/:id/dispute">
        {(params) => <OpenDispute id={Number(params.id)} />}
      </Route>
      <Route path="/deals/:id">
        {(params) => <DealDetail id={Number(params.id)} />}
      </Route>
      <Route path="/templates" component={Templates} />
      <Route path="/profile" component={Profile} />
      <Route path="/transfers/marketplace" component={TransferMarketplace} />
      <Route path="/transfers/my-listings" component={MyListings} />
      <Route path="/transfers/requests" component={TransferRequests} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAppRoute = location !== "/" && appRoutes.some(r => location === r || location.startsWith(r + "/"));
  return isAppRoute ? <Layout><Router /></Layout> : <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
