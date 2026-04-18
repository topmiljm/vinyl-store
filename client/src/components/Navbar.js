import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = ({ onSearch, onReset, onCartClick }) => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      if (term.trim()) {
        onSearch(term);
      } else {
        onReset();
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [term, onSearch, onReset]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Vinyl Store 🎵</h2>

      <input
        type="text"
        placeholder="Search albums..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-email">{user.email}</span>
            <button className="navbar-btn" onClick={() => navigate("/orders")}>
              My Orders
            </button>
            <button className="navbar-btn2" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="navbar-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}

        <div className="cart-indicator" onClick={onCartClick}>
          🛒 Cart ({itemCount})
        </div>
      </div>
    </nav>
  );
};

export default Navbar;