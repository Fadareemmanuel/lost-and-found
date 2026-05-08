import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ItemsPage from "./pages/ItemsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewItemPage from "./pages/NewItemPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import AdminClaimsPage from "./pages/AdminClaimPage";
import NotificationsPage from "./pages/NotificationsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-brand-gray-bg">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<ItemsPage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/new"
                element={
                  <ProtectedRoute>
                    <NewItemPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/claims"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminClaimsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="border-t border-brand-gray-light bg-brand-white py-6 text-center text-xs text-brand-gray">
            LASU Lost &amp; Found — for campus use. Report suspicious listings to security.
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
