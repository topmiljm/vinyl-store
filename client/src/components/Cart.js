import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createCheckoutSession } from "../services/api";

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, total, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { user } = useAuth(); // ✅ add this
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    setLoading(true);
    console.log("sending userId:", user ? user.id : null);
    try {
      const res = await createCheckoutSession(cart, user ? user.id : null);

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose}></div>}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <span>
                {item.title}
              </span>

              <div className="quantity-controls">
                <button onClick={() => decreaseQuantity(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.id)}>+</button>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}

        <h3>Total: ${(total / 100).toFixed(2)}</h3>

        <button onClick={checkout} disabled={cart.length === 0 || loading}>
          {loading ? "Redirecting..." : "Checkout"}
        </button>

        <p className="payment-hint">
          Fast checkout with Apple Pay / Google Pay
        </p>
        <button
          className="navbar-btn2"
          onClick={clearCart}
          disabled={cart.length === 0}
        >
          Clear Cart
        </button>
      </div>
    </>
  );
};

export default Cart;