import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import Transparency from './pages/Transparency';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import KYCRequests from './pages/admin/KYCRequests';
import ContactMessages from './pages/admin/ContactMessages';
import RoleManagement from './pages/admin/RoleManagement';
import PendingRoles from './pages/admin/PendingRoles';
import FiatMintRequests from './pages/admin/FiatMintRequests';
import ProofOfReserves from './pages/admin/ProofOfReserves';
import ExchangeRates from './pages/admin/ExchangeRates';
import TransactionList from './pages/TransactionList';
import ProtectedRoute from './components/ProtectedRoute';
import TokenMinting from './pages/TokenMinting';
import CMSPages from './pages/admin/CMSPages';
import AdminPendingTransactions from './pages/admin/PendingTransactions';
import LiveExchangeRatesPage from "./pages/LiveExchangeRates";
import DynamicPage from './pages/DynamicPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/live-exchange-rates" element={<LiveExchangeRatesPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/token-minting" element={<TokenMinting />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/cms-pages" element={<CMSPages />} />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/kyc-requests"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <KYCRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contact-messages"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ContactMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/role-management"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pending-roles"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <PendingRoles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fiat-requests"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <FiatMintRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reserves"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ProofOfReserves />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exchange-rates"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ExchangeRates />
                  </ProtectedRoute>
                }
              />
               <Route
                path="/admin/pending-transactions"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPendingTransactions />
                  </ProtectedRoute>
                }
              />
              {/* Legal Pages */}
              <Route path="/legal/:slug" element={<DynamicPage />} />

              {/* Dynamic CMS Pages */}
              <Route path="/page/:slug" element={<DynamicPage />} />
              
              {/* Legal Pages */}
              <Route path="/legal/:slug" element={<DynamicPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}