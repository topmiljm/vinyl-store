import { useCart } from "../context/CartContext";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const price = (product.price / 100).toFixed(2);

  const handleAddToCart = async () => {
    // ✅ Already a DB product — add directly
    if (product.id && product.id < 1000000) {
      addToCart(product);
      setAdded(true); // ✅ feedback for DB products too
      setTimeout(() => setAdded(false), 2000);
      return;
    }

    // 🔍 iTunes search result — upsert into DB first
    try {
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      const saved = await res.json();
      addToCart(saved);

      setAdded(true);
      setTimeout(() => setAdded(false), 2000); // Reset after 2 seconds

    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} />

      <h3>{product.title}</h3>
      <p>{product.artist}</p>

      <p>${price}</p>

      <button onClick={handleAddToCart} disabled={added}>
        {added ? "Added to Cart ✓" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;