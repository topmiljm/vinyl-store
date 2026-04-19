import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const handleBackToStore = () => {
    clearCart();
    navigate("/");
  };

  return (
    <div className="success-page">
      <h1>✅ Payment Successful</h1>
      <p>Thanks for your purchase!</p>

      <button onClick={handleBackToStore}>Back to Store</button>
    </div>
  );
};

export default Success;