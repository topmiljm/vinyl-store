const SkeletonCard = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton-shimmer skeleton-image" />
      <div className="skeleton-shimmer skeleton-line skeleton-title" />
      <div className="skeleton-shimmer skeleton-line skeleton-artist" />
      <div className="skeleton-shimmer skeleton-line skeleton-price" />
      <div className="skeleton-shimmer skeleton-button" />
    </div>
  );
};

export default SkeletonCard;