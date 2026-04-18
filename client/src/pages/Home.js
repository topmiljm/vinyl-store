import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import Navbar from "../components/Navbar";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // ✅ separate state
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = async (term) => {
    const res = await fetch(`http://localhost:5000/search?term=${term}`);
    const data = await res.json();
    setSearchResults(data); // ✅ don't overwrite products
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