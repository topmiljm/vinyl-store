import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import Cart from "../components/Cart";
import Navbar from "../components/Navbar";
import { getProducts, searchProducts } from "../services/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // ✅ separate state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = async (term) => {
    const data = await searchProducts(term);
    setSearchResults(data);
  };

  const handleReset = () => {
    setSearchResults([]); // ✅ just clear search results
  };

  // ✅ show search results if active, otherwise show DB products
  const displayedProducts = searchResults.length > 0 ? searchResults : products;

  return (
    <div className="store">
      <Navbar
        onSearch={handleSearch}
        onReset={handleReset}
        onCartClick={() => setIsCartOpen(true)}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {loading && (
        <p className="cold-start-note">
          Waking up the backend — first load can take up to 30s ☕
        </p>
      )}

      <div className="products-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
};

export default Home;