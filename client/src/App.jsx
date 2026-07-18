import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/events" element={
              <ProtectedRoute><Events /></ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute><EventDetail /></ProtectedRoute>
            } />
            <Route path="/events/:id/edit" element={
              <ProtectedRoute adminOnly><EventForm /></ProtectedRoute>
            } />
            <Route path="/create-event" element={
              <ProtectedRoute adminOnly><EventForm /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            <Route path="*" element={
              <div className="not-found">
                <h1>404</h1>
                <p>Page not found</p>
                <a href="/events">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' },
          success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
          error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
