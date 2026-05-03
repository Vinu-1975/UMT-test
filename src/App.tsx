import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import HomePage from "@/pages/Home";
import ReportsPage from "@/pages/Reports";
import SessionsPage from "@/pages/Sessions";
import VdiUsersPage from "@/pages/VdiUsers";
import DomainsPage from "@/pages/Domains";
import NotFoundPage from "@/pages/NotFound";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/vdi" element={<VdiUsersPage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
