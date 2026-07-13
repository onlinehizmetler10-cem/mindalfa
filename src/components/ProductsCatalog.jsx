import React, { useEffect } from "react";

export default function ProductsCatalog({ products, onOpenRequestWithProduct, onBack, lang, t }) {
  // Scroll to top on page load/mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="catalog-container container animate-fade">
      <header className="catalog-header">
        <button className="btn-secondary back-btn" onClick={onBack}>
          &larr; {lang === "tr" ? "Ana Sayfaya Dön" : "Back to Home"}
        </button>
        <h1 className="gradient-text">{t.catalogTitle}</h1>
        <p className="catalog-subtitle">{t.catalogSubtitle}</p>
      </header>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card glass">
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              <div className="product-footer">
                <span className="product-price text-primary">{product.price}</span>
                <button 
                  className="btn-primary" 
                  onClick={() => onOpenRequestWithProduct(product.name)}
                >
                  {t.btnGetInfo}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Footer */}
      <footer className="footer catalog-footer">
        <div className="footer-content">
          <div className="footer-brand font-mono">
            <span className="gradient-text brand-font">MINDALFA</span>
          </div>
          <div className="footer-links">
            <p>© {new Date().getFullYear()} MINDALFA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
