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
        {products.map((product) => {
          const name = lang === "tr" ? product.name_tr : product.name_en || product.name_tr;
          const desc = lang === "tr" ? product.description_tr : product.description_en || product.description_tr;
          const price = lang === "tr" ? product.price_tr : product.price_en || product.price_tr;

          return (
            <div key={product.id} className="product-card glass">
              <div className="product-image-container">
                <img src={product.image} alt={name} className="product-image" />
              </div>
              <div className="product-info">
                <h3 className="product-name">{name}</h3>
                <p className="product-desc">{desc}</p>
                <div className="product-footer">
                  <span className="product-price text-primary">{price}</span>
                  <button 
                    className="btn-primary" 
                    onClick={() => onOpenRequestWithProduct(name)}
                  >
                    {t.btnGetInfo}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
