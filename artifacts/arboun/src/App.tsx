import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
