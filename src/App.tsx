import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/Dashboard';
import TokenMinting from './pages/TokenMinting';
import TransactionList from './pages/TransactionList';
import ProtectedRoute from './components/ProtectedRoute';
import CMSPages from './pages/admin/CMSPages';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/token-minting" element={<TokenMinting />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/cms" element={<CMSPages />} />

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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}