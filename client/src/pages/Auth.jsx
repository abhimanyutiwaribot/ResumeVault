import React, { useState } from "react";
import { loginWithEmail, registerWithEmail, signInWithGoogle } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        alert("Logged in successfully");
      } else {
        await registerWithEmail(email, password);
        alert("Registered successfully");
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      alert("Google login successful");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="brand-header">
            <h1>Resume<span className="text-gradient">Vault</span></h1>
            <p className="brand-subtitle">Create ATS-friendly resumes with ease</p>
          </div>

          <div className="auth-form">
            <h2 className="form-title">{isLogin ? "Welcome back" : "Create account"}</h2>
            
            <div className="social-auth">
              <button onClick={handleGoogleLogin} className="auth-button google">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Continue with Google
              </button>
            </div>

            <div className="auth-divider">
              <hr />
              <span>or {isLogin ? "login with email" : "register with email"}</span>
              <hr />
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button onClick={handleAuth} className="auth-button primary">
              {isLogin ? "Login" : "Create Account"}
            </button>

            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
