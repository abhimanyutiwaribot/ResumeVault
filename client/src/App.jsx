import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Wait for Firebase to initialize
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen until Firebase is initialized
  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-spinner"></span>
          Initializing...
        </div>
      </div>
    );
  }

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-spinner"></span>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
