import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import Navbar from "../components/Navbar";
import { getProducts, searchProducts } from "../services/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // ✅ separate state
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
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

      <div className="products-grid">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;