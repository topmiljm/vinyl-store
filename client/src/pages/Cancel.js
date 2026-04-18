import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="success-page">
      <h1>❌ Payment Cancelled</h1>
      <p>Your order was not completed.</p>

      <Link to="/">
        <button>Return to Store</button>
      </Link>
    </div>
  );
};

export default Cancel;