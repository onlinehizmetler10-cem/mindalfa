import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import LandingPage from "./components/LandingPage";
import RequestForm from "./components/RequestForm";
import AdminPanel from "./components/AdminPanel";
import logoImg from "./assets/logo.png";

// Mock requests to prepopulate the admin dashboard with realistic data
const initialMockRequests = [
  {
    id: "1",
    name: "Ahmet",
    surname: "Yılmaz",
    phone: "05551112233",
    email: "ahmet.yilmaz@company.com",
    description: "Merhabalar, Binance ve Borsa İstanbul API'lerini kullanarak çalışacak, RSI ve MACD kesişimlerini takip eden bir al-sat robotu yaptırmak istiyoruz. Bulut tabanlı bir panel üzerinden kontrol edilebilmeli.",
    status: "new",
    date: "05.07.2026 14:15:30"
  },
  {
    id: "2",
    name: "Ayşe",
    surname: "Kaya",
    phone: "05324445566",
    email: "ayse.kaya@finance.co",
    description: "MetaTrader 5 üzerinde çalışacak ve hareketli ortalamaları (EMA) temel alan bir FX robotu (Expert Advisor) ihtiyacımız var. Zarar kes (SL) ve kar al (TP) seviyelerini dinamik olarak belirleyecek.",
    status: "in_progress",
    date: "04.07.2026 11:20:10"
  },
  {
    id: "3",
    name: "John",
    surname: "Smith",
    phone: "+1555019922",
    email: "jsmith@techcorp.com",
    description: "We need a custom lightweight accounting interface that syncs our daily invoices to Google Sheets and sends automatic reminders to clients whose payments are overdue.",
    status: "completed",
    date: "02.07.2026 09:05:44"
  }
];

// Mock products to prepopulate the catalog with premium items
const initialMockProducts = [
  {
    id: "p1",
    name: "MindAlfa Algo-Grid EA (MT5)",
    price: "499 $",
    description: "MetaTrader 5 üzerinde çalışan, akıllı RSI & Grid algoritmasına sahip, dinamik SL/TP yönetimi yapan tam otomatik forex robotu.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><circle cx="150" cy="90" r="50" fill="none" stroke="%2300f0ff" stroke-width="3" stroke-dasharray="8 4"/><path d="M120 90 L140 70 L160 110 L180 90" fill="none" stroke="%238b5cf6" stroke-width="4"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">GRID EA BOT</text></svg>`
  },
  {
    id: "p2",
    name: "MindAlfa AI-Ledger (ERP Connect)",
    price: "1.200 $",
    description: "Şirketinizin tüm fatura ve finansal verilerini yapay zeka ile sınıflandıran, otomatik rapor oluşturan akıllı ERP/Muhasebe modülü.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><rect x="110" y="50" width="80" height="80" rx="10" fill="none" stroke="%238b5cf6" stroke-width="3"/><path d="M130 90 L170 90 M130 75 L170 75 M130 105 L155 105" fill="none" stroke="%2300f0ff" stroke-width="3"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">AI LEDGER API</text></svg>`
  },
  {
    id: "p3",
    name: "MindAlfa Custom API Suite",
    price: "Fiyat Teklifi Alın",
    description: "İş süreçlerinize özel olarak tasarlanan, yüksek hızlı, güvenli ve ölçeklenebilir backend API entegrasyonu ve yönetim sistemi.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><path d="M100 90 L130 60 L100 30 M200 90 L170 60 L200 30 M160 30 L140 90" fill="none" stroke="%2300f0ff" stroke-width="3" transform="translate(0, 30)"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">CUSTOM API SUITE</text></svg>`
  }
];

export default function App() {
  const [lang, setLang] = useState("tr");
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultFormDesc, setDefaultFormDesc] = useState("");
  const [view, setView] = useState("landing"); // "landing" or "admin"
  const [alertMessage, setAlertMessage] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const t = translations[lang];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@mindalfa.com";
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

    if (loginEmail === adminEmail && loginPassword === adminPassword) {
      setIsAdminLoggedIn(true);
      setLoginError("");
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setLoginError(t.adminLoginError);
    }
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (view !== "landing") {
      setView("landing");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load requests & products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mindalfa_requests");
    if (saved) {
      setRequests(JSON.parse(saved));
    } else {
      setRequests(initialMockRequests);
      localStorage.setItem("mindalfa_requests", JSON.stringify(initialMockRequests));
    }

    const savedProds = localStorage.getItem("mindalfa_products");
    if (savedProds) {
      setProducts(JSON.parse(savedProds));
    } else {
      setProducts(initialMockProducts);
      localStorage.setItem("mindalfa_products", JSON.stringify(initialMockProducts));
    }
  }, []);

  // Save requests to localStorage when updated
  const saveRequests = (updatedList) => {
    setRequests(updatedList);
    localStorage.setItem("mindalfa_requests", JSON.stringify(updatedList));
  };

  // Save products to localStorage when updated
  const saveProducts = (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem("mindalfa_products", JSON.stringify(updatedList));
  };

  const handleAddRequest = (newRequest) => {
    const updated = [newRequest, ...requests];
    saveRequests(updated);
    setIsModalOpen(false);
    setDefaultFormDesc("");
    
    // Trigger custom success notification
    setAlertMessage(t.successAlert);
    setTimeout(() => setAlertMessage(""), 6000);
  };

  const handleUpdateStatus = (id, status) => {
    const updated = requests.map(req => 
      req.id === id ? { ...req, status } : req
    );
    saveRequests(updated);
  };

  const handleDeleteRequest = (id) => {
    const confirmDelete = window.confirm(
      lang === "tr" 
        ? "Bu talebi silmek istediğinize emin misiniz?" 
        : "Are you sure you want to delete this request?"
    );
    if (confirmDelete) {
      const updated = requests.filter(req => req.id !== id);
      saveRequests(updated);
    }
  };

  // Product CRUD Handlers
  const handleAddProduct = (newProd) => {
    const updated = [newProd, ...products];
    saveProducts(updated);
  };

  const handleEditProduct = (updatedProd) => {
    const updated = products.map(prod =>
      prod.id === updatedProd.id ? updatedProd : prod
    );
    saveProducts(updated);
  };

  const handleDeleteProduct = (id) => {
    const confirmDelete = window.confirm(
      lang === "tr"
        ? "Bu ürünü satılık listesinden silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this product from sale?"
    );
    if (confirmDelete) {
      const updated = products.filter(prod => prod.id !== id);
      saveProducts(updated);
    }
  };

  // Pre-fill form details with product request info
  const handleOpenRequestWithProduct = (productName) => {
    setDefaultFormDesc(
      lang === "tr"
        ? `"${productName}" ürününüz hakkında detaylı bilgi almak ve satın alma sürecini başlatmak istiyorum.`
        : `I would like to get detailed information about your "${productName}" product and start the purchase process.`
    );
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Alert Overlay Banner */}
      {alertMessage && (
        <div className="alert-banner glass slide-in">
          <div className="alert-icon">🎉</div>
          <div className="alert-content">
            <p>{alertMessage}</p>
          </div>
          <button className="alert-close" onClick={() => setAlertMessage("")}>&times;</button>
        </div>
      )}

      {view === "landing" ? (
        <>
          {/* Landing Page Navbar */}
          <nav className="navbar glass">
            <div className="container nav-content">
              <div className="logo" onClick={(e) => handleNavClick(e, "welcome")}>
                <img src={logoImg} alt="MindAlfa Logo" className="logo-img" />
                <span className="logo-text gradient-text">{t.brandName}</span>
              </div>

              <div className="nav-links">
                <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="nav-link">{t.navAbout}</a>
                <a href="#services" onClick={(e) => handleNavClick(e, "services")} className="nav-link">{t.navServices}</a>
                <a href="#products" onClick={(e) => handleNavClick(e, "products")} className="nav-link">{t.navProducts}</a>
                <a href="#support" onClick={(e) => handleNavClick(e, "support")} className="nav-link">{t.navSupport}</a>
              </div>
              
              <div className="nav-actions">
                {/* Secret Admin Button */}
                <button 
                  className="nav-link-btn" 
                  onClick={() => setView("admin")}
                  title={lang === "tr" ? "Yönetici Paneline Git" : "Go to Admin Panel"}
                >
                  🔒 Admin Panel
                </button>

                {/* Language Switcher */}
                <button 
                  className="lang-btn" 
                  onClick={() => setLang(lang === "tr" ? "en" : "tr")}
                >
                  🌐 {lang === "tr" ? "English" : "Türkçe"}
                </button>
                
                {/* Submit Request Button in Top Right */}
                <button 
                  id="submit-request-btn"
                  className="btn-primary" 
                  onClick={() => { setDefaultFormDesc(""); setIsModalOpen(true); }}
                >
                  {t.ctaSubmitRequest}
                </button>
              </div>
            </div>
          </nav>

          {/* Main Landing View */}
          <LandingPage 
            products={products}
            onOpenRequest={() => { setDefaultFormDesc(""); setIsModalOpen(true); }} 
            onOpenRequestWithProduct={handleOpenRequestWithProduct}
            lang={lang} 
            t={t} 
          />

          {/* Request Form Modal */}
          <RequestForm 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setDefaultFormDesc(""); }} 
            onSubmit={handleAddRequest} 
            defaultDesc={defaultFormDesc}
            lang={lang} 
            t={t} 
          />
        </>
      ) : (
        /* Admin Dashboard View with Password Guard */
        isAdminLoggedIn ? (
          <AdminPanel 
            requests={requests} 
            products={products}
            onUpdateStatus={handleUpdateStatus} 
            onDeleteRequest={handleDeleteRequest} 
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onBack={() => {
              setView("landing");
              setIsAdminLoggedIn(false); // Reset login status for demonstration
            }} 
            lang={lang} 
            t={t} 
          />
        ) : (
          <div className="login-overlay">
            <div className="login-card glass">
              <h2 className="gradient-text">{t.adminLoginTitle}</h2>
              <p className="login-subtitle">{t.adminLoginSubtitle}</p>
              
              {loginError && <div className="form-error">{loginError}</div>}
              
              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="loginEmail">{t.adminEmailLabel}</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }}
                    required
                    placeholder="admin@mindalfa.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="loginPassword">{t.adminPasswordLabel}</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                    required
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="login-actions">
                  <button type="button" className="btn-secondary" onClick={() => setView("landing")}>
                    &larr; {t.adminBackToSite}
                  </button>
                  <button type="submit" className="btn-primary">
                    {t.adminLoginBtn}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )
      )}
    </div>
  );
}
