import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { JsonUpdatePage } from './pages/JsonUpdate';
import { HistoryPage } from './pages/History';
import { MergeRequestsPage } from './pages/MergeRequests';
import { RepositoriesPage } from './pages/Repositories';
import { SettingsPage } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function AppLayout() {
  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/json-update" element={<JsonUpdatePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/merge-requests" element={<MergeRequestsPage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function LoginWrapper() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginWrapper />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
            <ToastContainer />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
