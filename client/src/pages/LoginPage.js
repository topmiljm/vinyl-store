import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      login(data.token, data.email);
      navigate("/");
    } catch (err) {
      setError("Unable to connect to server");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>{isRegister ? "Create Account" : "Sign In"}</h2>

        <input
          type="email"
          placeholder="Email"
          maxLength={50}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          maxLength={25}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="login-register-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <p className="toggle-auth">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? " Sign in" : " Register"}
          </span>
        </p>
        <Link to="/">
          <span className="back-btn">Back to Store</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;