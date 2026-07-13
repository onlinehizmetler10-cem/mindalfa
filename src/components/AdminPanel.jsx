import React, { useState } from "react";

export default function AdminPanel({ 
  requests, 
  products, 
  onUpdateStatus, 
  onDeleteRequest, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct, 
  onReorderProducts,
  onBack, 
  lang, 
  t 
}) {
  const [activeTab, setActiveTab] = useState("requests"); // "requests" or "products"
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Drag and Drop reordering states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // Product form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name_tr: "",
    name_en: "",
    price_tr: "",
    price_en: "",
    description_tr: "",
    description_en: "",
    image: ""
  });
  const [productError, setProductError] = useState("");

  // Drag and drop event handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, index) => {
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedList = [...products];
    const [removed] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(index, 0, removed);

    onReorderProducts(reorderedList);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Compute stats for requests
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === "new").length;
  const activeCount = requests.filter(r => r.status === "in_progress").length;
  const completedCount = requests.filter(r => r.status === "completed").length;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new": return "badge badge-new";
      case "in_progress": return "badge badge-progress";
      case "completed": return "badge badge-completed";
      case "archived": return "badge badge-archived";
      default: return "badge";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new": return t.statusNew;
      case "in_progress": return t.statusInProgress;
      case "completed": return t.statusCompleted;
      case "archived": return t.statusArchived;
      default: return status;
    }
  };

  // Image Upload and Sıkıştırma (Canvas API)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Sıkıştırılacak maksimum çözünürlük (300x200px)
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Düşük boyut için JPEG formatında 0.6 kalitesinde sıkıştır (Yaklaşık 10-15KB)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
        setProductForm(prev => ({
          ...prev,
          image: compressedBase64
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({ 
      name_tr: "", 
      name_en: "", 
      price_tr: "", 
      price_en: "", 
      description_tr: "", 
      description_en: "", 
      image: "" 
    });
    setProductError("");
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({ 
      name_tr: product.name_tr || "", 
      name_en: product.name_en || "", 
      price_tr: product.price_tr || "", 
      price_en: product.price_en || "", 
      description_tr: product.description_tr || "", 
      description_en: product.description_en || "", 
      image: product.image || ""
    });
    setProductError("");
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const { name_tr, name_en, price_tr, price_en, description_tr, description_en, image } = productForm;

    if (!name_tr.trim() || !price_tr.trim() || !description_tr.trim()) {
      setProductError(t.adminValidationProductError);
      return;
    }

    // Dynamic fallbacks: if English is not provided, use the Turkish text
    const finalNameEn = name_en.trim() || name_tr.trim();
    const finalPriceEn = price_en.trim() || price_tr.trim();
    const finalDescEn = description_en.trim() || description_tr.trim();

    // Default image if none selected
    const finalImage = image || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><circle cx="150" cy="100" r="40" fill="none" stroke="%238b5cf6" stroke-width="3"/><text x="50%25" y="105" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2300f0ff">GÖRSEL YOK</text></svg>`;

    if (editingProduct) {
      onEditProduct({
        id: editingProduct.id,
        name_tr: name_tr.trim(),
        name_en: finalNameEn,
        price_tr: price_tr.trim(),
        price_en: finalPriceEn,
        description_tr: description_tr.trim(),
        description_en: finalDescEn,
        image: finalImage
      });
    } else {
      onAddProduct({
        id: Date.now().toString(),
        name_tr: name_tr.trim(),
        name_en: finalNameEn,
        price_tr: price_tr.trim(),
        price_en: finalPriceEn,
        description_tr: description_tr.trim(),
        description_en: finalDescEn,
        image: finalImage
      });
    }

    setIsProductModalOpen(false);
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1 className="gradient-text">
            <span className="brand-font">MINDALFA</span> {lang === "tr" ? "Yönetim Paneli" : "Management Panel"}
          </h1>
          <p className="admin-subtitle">{t.adminSubtitle}</p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          &larr; {t.adminBackToSite}
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          📋 {t.adminTabRequests}
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🛍️ {t.adminTabProducts}
        </button>
      </div>

      {activeTab === "requests" ? (
        <>
          {/* Admin Stats Grid */}
          <div className="stats-grid animate-fade">
            <div className="stat-card glass">
              <h3>{t.statsTotal}</h3>
              <p className="stat-number text-primary">{totalCount}</p>
            </div>
            <div className="stat-card glass">
              <h3>{t.statsNewCount}</h3>
              <p className="stat-number text-new">{newCount}</p>
            </div>
            <div className="stat-card glass">
              <h3>{t.statsActive}</h3>
              <p className="stat-number text-progress">{activeCount}</p>
            </div>
            <div className="stat-card glass">
              <h3>{t.statsDone}</h3>
              <p className="stat-number text-completed">{completedCount}</p>
            </div>
          </div>

          <div className="admin-main animate-fade">
            {/* Requests List */}
            <div className="requests-list-container glass">
              {requests.length === 0 ? (
                <div className="no-requests">{t.adminNoRequests}</div>
              ) : (
                <div className="requests-table-wrapper">
                  <table className="requests-table">
                    <thead>
                      <tr>
                        <th>{t.adminRequestFrom}</th>
                        <th>{t.adminContactInfo}</th>
                        <th>{t.adminStatus}</th>
                        <th>{t.adminDate}</th>
                        <th>{t.adminActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr 
                          key={req.id} 
                          className={`request-row ${selectedRequest?.id === req.id ? 'active-row' : ''}`}
                          onClick={() => setSelectedRequest(req)}
                        >
                          <td>
                            <div className="client-name">{req.name} {req.surname}</div>
                          </td>
                          <td>
                            <div className="client-email">{req.email}</div>
                            <div className="client-phone">{req.phone}</div>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(req.status)}>
                              {getStatusText(req.status)}
                            </span>
                          </td>
                          <td className="request-date">{req.date}</td>
                          <td>
                            <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                              {req.status === "new" && (
                                <button 
                                  className="btn-action btn-action-progress" 
                                  onClick={() => onUpdateStatus(req.id, "in_progress")}
                                  title={t.actionInProgress}
                                >
                                  ⚙️
                                </button>
                              )}
                              {req.status !== "completed" && req.status !== "archived" && (
                                <button 
                                  className="btn-action btn-action-complete" 
                                  onClick={() => onUpdateStatus(req.id, "completed")}
                                  title={t.actionComplete}
                                >
                                  ✅
                                </button>
                              )}
                              {req.status !== "archived" && (
                                <button 
                                  className="btn-action btn-action-archive" 
                                  onClick={() => onUpdateStatus(req.id, "archived")}
                                  title={t.actionArchive}
                                >
                                  📦
                                </button>
                              )}
                              <button 
                                className="btn-action btn-action-delete" 
                                onClick={() => {
                                  onDeleteRequest(req.id);
                                  if (selectedRequest?.id === req.id) setSelectedRequest(null);
                                }}
                                title={t.actionDelete}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Request Detail Panel */}
            <div className="request-detail-panel glass">
              {selectedRequest ? (
                <div className="detail-content">
                  <h3>{t.formTitle} Detayı</h3>
                  <hr className="divider" />
                  
                  <div className="detail-group">
                    <label>{t.adminRequestFrom}</label>
                    <div className="detail-value highlighted-text">{selectedRequest.name} {selectedRequest.surname}</div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <label>{t.fieldPhone}</label>
                      <div className="detail-value">{selectedRequest.phone}</div>
                    </div>
                    <div className="detail-group">
                      <label>{t.fieldEmail}</label>
                      <div className="detail-value">{selectedRequest.email}</div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-group">
                      <label>{t.adminStatus}</label>
                      <div>
                        <span className={getStatusBadgeClass(selectedRequest.status)}>
                          {getStatusText(selectedRequest.status)}
                        </span>
                      </div>
                    </div>
                    <div className="detail-group">
                      <label>{t.adminDate}</label>
                      <div className="detail-value">{selectedRequest.date}</div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <label>{t.fieldDescription}</label>
                    <div className="detail-value desc-box">{selectedRequest.description}</div>
                  </div>

                  <div className="detail-footer-actions">
                    {selectedRequest.status === "new" && (
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          onUpdateStatus(selectedRequest.id, "in_progress");
                          setSelectedRequest({ ...selectedRequest, status: "in_progress" });
                        }}
                      >
                        {t.actionInProgress}
                      </button>
                    )}
                    {selectedRequest.status !== "completed" && selectedRequest.status !== "archived" && (
                      <button 
                        className="btn-success" 
                        onClick={() => {
                          onUpdateStatus(selectedRequest.id, "completed");
                          setSelectedRequest({ ...selectedRequest, status: "completed" });
                        }}
                      >
                        {t.actionComplete}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="detail-empty">
                  <div className="empty-icon">📂</div>
                  <p>{lang === "tr" ? "Detayları görüntülemek için bir talebe tıklayın." : "Click a request to view details."}</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Products Management Tab View */
        <div className="admin-main-products animate-fade">
          <div className="products-manager-container glass">
            <div className="products-manager-header">
              <h3>{t.adminTabProducts}</h3>
              <button className="btn-primary" onClick={handleOpenAddModal}>
                ➕ {t.adminAddProduct}
              </button>
            </div>

            {products.length === 0 ? (
              <div className="no-requests">{t.adminNoProducts}</div>
            ) : (
              <div className="requests-table-wrapper">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>{t.adminProductImage}</th>
                      <th>{t.adminProductName}</th>
                      <th>{t.adminProductPrice}</th>
                      <th>{t.adminProductActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod, index) => (
                      <tr 
                        key={prod.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`product-drag-row ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                      >
                        <td className="drag-handle-cell">
                          <span className="drag-handle-icon" title={lang === "tr" ? "Sürükle" : "Drag"}>☰</span>
                        </td>
                        <td>
                          <div className="admin-product-thumb-container">
                            <img src={prod.image} alt="" className="admin-product-thumb" />
                          </div>
                        </td>
                        <td>
                          <div className="client-name">{prod.name_tr}</div>
                          <div className="text-dim font-mono" style={{ fontSize: "11px", opacity: 0.6 }}>EN: {prod.name_en}</div>
                          <div className="admin-product-desc-snippet">TR: {prod.description_tr}</div>
                          <div className="admin-product-desc-snippet" style={{ opacity: 0.5 }}>EN: {prod.description_en}</div>
                        </td>
                        <td>
                          <div className="admin-product-price-val font-weight-bold text-primary">{prod.price_tr}</div>
                          <div className="text-dim font-mono" style={{ fontSize: "11px", opacity: 0.6 }}>EN: {prod.price_en}</div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="btn-action btn-action-progress" 
                              onClick={() => handleOpenEditModal(prod)}
                              title={t.adminEditProduct}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-action btn-action-delete" 
                              onClick={() => onDeleteProduct(prod.id)}
                              title={t.actionDelete}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Form Modal (Add / Edit) */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsProductModalOpen(false)}>
              &times;
            </button>
            
            <h2 className="gradient-text">{editingProduct ? t.adminEditProduct : t.adminAddProduct}</h2>

            {productError && <div className="form-error">{productError}</div>}

            <form onSubmit={handleProductSubmit} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t.adminProductNameTR}</label>
                  <input
                    type="text"
                    value={productForm.name_tr}
                    onChange={(e) => setProductForm({ ...productForm, name_tr: e.target.value })}
                    required
                    placeholder="Örn. MindAlfa Trading Bot"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.adminProductNameEN}</label>
                  <input
                    type="text"
                    value={productForm.name_en}
                    onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                    placeholder="e.g. MindAlfa Trading Bot"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.adminProductPriceTR}</label>
                  <input
                    type="text"
                    value={productForm.price_tr}
                    onChange={(e) => setProductForm({ ...productForm, price_tr: e.target.value })}
                    required
                    placeholder="Örn. 500 $ veya 15.000 TL"
                  />
                </div>

                <div className="form-group">
                  <label>{t.adminProductPriceEN}</label>
                  <input
                    type="text"
                    value={productForm.price_en}
                    onChange={(e) => setProductForm({ ...productForm, price_en: e.target.value })}
                    placeholder="e.g. $500 or 15,000 TL"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.adminProductDescTR}</label>
                  <textarea
                    rows="3"
                    value={productForm.description_tr}
                    onChange={(e) => setProductForm({ ...productForm, description_tr: e.target.value })}
                    required
                    placeholder="Ürün Türkçe açıklaması..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>{t.adminProductDescEN}</label>
                  <textarea
                    rows="3"
                    value={productForm.description_en}
                    onChange={(e) => setProductForm({ ...productForm, description_en: e.target.value })}
                    placeholder="Product English description..."
                  ></textarea>
                </div>
              </div>

              <div className="form-group">
                <label>{t.adminProductImage}</label>
                <div className="admin-file-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id="product-file-input"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="product-file-input" className="btn-secondary text-center cursor-pointer">
                    📁 {t.adminSelectFile}
                  </label>
                  {productForm.image && (
                    <div className="admin-upload-preview-container">
                      <img src={productForm.image} alt="Preview" className="admin-upload-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsProductModalOpen(false)}>
                  {t.btnClose}
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? t.actionComplete : t.btnSend}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
