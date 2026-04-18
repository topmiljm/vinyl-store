import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      const res = await fetch("http://localhost:5000/orders/my-orders", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) return <p className="loading">Loading orders...</p>;

  return (
    <div className="orders-page">
      <h2>Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span>Order #{order.id}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.title} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))
      )}
      <Link to="/">
        <span className="back-btn">Back to Store</span>
      </Link>
    </div>
  );
};

export default OrdersPage;