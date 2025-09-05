
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Snippets from "./pages/Snippets";
import Analysis from "./pages/Analysis";
import PromptsManagement from "./pages/PromptsManagement";
import TestChat from "./pages/TestChat";
import NotFound from "./pages/NotFound";
import Generate from "./pages/Generate";
import { YMLMaker } from "./pages/yml-maker/YMLMaker";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AppLayout } from "./components/layouts/AppLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={<AppLayout />}>
              <Route path="" element={<Index />} />
              <Route path="profile" element={<Profile />} />
              <Route path="snippets" element={<Snippets />} />
              <Route path="analyze/:snippetId" element={<Analysis />} />
              <Route path="yml-maker/:snippetId" element={<YMLMaker />} />
              <Route path="prompts" element={<PromptsManagement />} />
              <Route path="test-chat" element={<TestChat />} />
              <Route path="generate" element={<Generate />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
