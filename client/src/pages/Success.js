import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

const Success = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart(); // Clear cart on success page load
  }, [clearCart]);

  return (
    <div className="success-page">
      <h1>✅ Payment Successful</h1>
      <p>Thanks for your purchase!</p>

      <Link to="/">
        <button>Back to Store</button>
      </Link>
    </div>
  );
};

export default Success;