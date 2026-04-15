import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Processes from "./pages/Processes";
import Generate from "./pages/Generate";
import Settings from "./pages/Settings";
import Workflows from "./pages/Workflows";
import Team from "./pages/Team";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="processes" element={<Processes />} />
            <Route path="generate" element={<Generate />} />
            <Route path="settings" element={<Settings />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
