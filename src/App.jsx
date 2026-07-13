import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import LandingPage from "./components/LandingPage";
import RequestForm from "./components/RequestForm";
import AdminPanel from "./components/AdminPanel";
import ProductsCatalog from "./components/ProductsCatalog";
import { supabase } from "./supabaseClient";
import logoImg from "./assets/logo.png";

// Mock requests to prepopulate if needed locally (not used for seeding requests to database to keep admin panel clean)
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
  }
];

// Mock products to automatically seed the database if it is empty
const initialMockProducts = [
  {
    id: "p1",
    name_tr: "MindAlfa Algo-Grid EA (MT5)",
    name_en: "MindAlfa Algo-Grid EA (MT5)",
    price_tr: "499 $",
    price_en: "499 $",
    description_tr: "MetaTrader 5 üzerinde çalışan, akıllı RSI & Grid algoritmasına sahip, dinamik SL/TP yönetimi yapan tam otomatik forex robotu.",
    description_en: "An automated forex trading robot for MetaTrader 5, featuring a smart RSI & Grid algorithm with dynamic SL/TP management.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><circle cx="150" cy="90" r="50" fill="none" stroke="%2300f0ff" stroke-width="3" stroke-dasharray="8 4"/><path d="M120 90 L140 70 L160 110 L180 90" fill="none" stroke="%238b5cf6" stroke-width="4"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">GRID EA BOT</text></svg>`
  },
  {
    id: "p2",
    name_tr: "MindAlfa AI-Ledger (ERP Connect)",
    name_en: "MindAlfa AI-Ledger (ERP Connect)",
    price_tr: "1.200 $",
    price_en: "1,200 $",
    description_tr: "Şirketinizin tüm fatura ve finansal verilerini yapay zeka ile sınıflandıran, otomatik rapor oluşturan akıllı ERP/Muhasebe modülü.",
    description_en: "A smart ERP/accounting module that classifies your business invoices and financial data using AI, generating automated reports.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><rect x="110" y="50" width="80" height="80" rx="10" fill="none" stroke="%238b5cf6" stroke-width="3"/><path d="M130 90 L170 90 M130 75 L170 75 M130 105 L155 105" fill="none" stroke="%2300f0ff" stroke-width="3"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">AI LEDGER API</text></svg>`
  },
  {
    id: "p3",
    name_tr: "MindAlfa Custom API Suite",
    name_en: "MindAlfa Custom API Suite",
    price_tr: "Fiyat Teklifi Alın",
    price_en: "Get a Quote",
    description_tr: "İş süreçlerinize özel olarak tasarlanan, yüksek hızlı, güvenli ve ölçeklenebilir backend API entegrasyonu ve yönetim sistemi.",
    description_en: "A high-speed, secure, and scalable backend API integration and management system custom-designed for your business workflows.",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230b0b1a" rx="10"/><path d="M100 90 L130 60 L100 30 M200 90 L170 60 L200 30 M160 30 L140 90" fill="none" stroke="%2300f0ff" stroke-width="3" transform="translate(0, 30)"/><text x="50%25" y="170" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23ffffff">CUSTOM API SUITE</text></svg>`
  }
];

export default function App() {
  const [lang, setLang] = useState("tr");
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultFormDesc, setDefaultFormDesc] = useState("");
  const [view, setView] = useState("landing"); // "landing", "products" or "admin"
  const [alertMessage, setAlertMessage] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("mindalfa_admin_logged_in") === "true";
  });
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
      sessionStorage.setItem("mindalfa_admin_logged_in", "true");
      setLoginError("");
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setLoginError(t.adminLoginError);
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("mindalfa_admin_logged_in");
    setView("landing");
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

  // Fetch Requests and Products from Supabase on mount
  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests from Supabase:", err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;

      // If database has 0 products, seed it with the mock premium products
      if (!data || data.length === 0) {
        const seedData = initialMockProducts.map((p, index) => ({
          name_tr: p.name_tr,
          name_en: p.name_en,
          price_tr: p.price_tr,
          price_en: p.price_en,
          description_tr: p.description_tr,
          description_en: p.description_en,
          image: p.image,
          sort_order: index
        }));

        const { error: seedErr } = await supabase
          .from("products")
          .insert(seedData);

        if (seedErr) throw seedErr;
        
        // Refetch fresh seeded products
        const { data: seededProds } = await supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true });
        
        setProducts(seededProds || []);
      } else {
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products from Supabase:", err.message);
    }
  };

  // Insert client request to database (and mail triggers implicitly through UI submit)
  const handleAddRequest = async (newRequest) => {
    try {
      const { error } = await supabase
        .from("requests")
        .insert([
          {
            name: newRequest.name,
            surname: newRequest.surname,
            phone: newRequest.phone,
            email: newRequest.email,
            description: newRequest.description,
            status: newRequest.status,
            date: newRequest.date
          }
        ]);

      if (error) throw error;
      fetchRequests();
      setIsModalOpen(false);
      setDefaultFormDesc("");
      
      // Trigger success banner
      setAlertMessage(t.successAlert);
      setTimeout(() => setAlertMessage(""), 6000);
    } catch (err) {
      console.error("Error saving request to Supabase:", err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      fetchRequests();
    } catch (err) {
      console.error("Error updating request status:", err.message);
    }
  };

  const handleDeleteRequest = async (id) => {
    const confirmDelete = window.confirm(
      lang === "tr" 
        ? "Bu talebi silmek istediğinize emin misiniz?" 
        : "Are you sure you want to delete this request?"
    );
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from("requests")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchRequests();
      } catch (err) {
        console.error("Error deleting request:", err.message);
      }
    }
  };

  // Product CRUD database methods
  const handleAddProduct = async (newProd) => {
    try {
      const maxOrder = products.length > 0 ? Math.max(...products.map(p => p.sort_order || 0)) : 0;
      const { error } = await supabase
        .from("products")
        .insert([
          {
            name_tr: newProd.name_tr,
            name_en: newProd.name_en,
            price_tr: newProd.price_tr,
            price_en: newProd.price_en,
            description_tr: newProd.description_tr,
            description_en: newProd.description_en,
            image: newProd.image,
            sort_order: maxOrder + 1
          }
        ]);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error("Error adding product to Supabase:", err.message);
    }
  };

  const handleEditProduct = async (updatedProd) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name_tr: updatedProd.name_tr,
          name_en: updatedProd.name_en,
          price_tr: updatedProd.price_tr,
          price_en: updatedProd.price_en,
          description_tr: updatedProd.description_tr,
          description_en: updatedProd.description_en,
          image: updatedProd.image
        })
        .eq("id", updatedProd.id);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error("Error editing product in Supabase:", err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      lang === "tr"
        ? "Bu ürünü satılık listesinden silmek istediğinize emin misiniz?"
        : "Are you sure you want to delete this product from sale?"
    );
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);

        if (error) throw error;
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product from Supabase:", err.message);
      }
    }
  };

  // Reorder products dynamically and write sequential orders back to Database
  const saveProducts = async (updatedList) => {
    // Optimistic UI update
    setProducts(updatedList);

    try {
      // Loop update each product order index
      for (let i = 0; i < updatedList.length; i++) {
        await supabase
          .from("products")
          .update({ sort_order: i })
          .eq("id", updatedList[i].id);
      }
      fetchProducts();
    } catch (err) {
      console.error("Error updating product sort order:", err.message);
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

      {view === "admin" ? (
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
            onReorderProducts={saveProducts}
            onBack={() => setView("landing")}
            onLogout={handleLogout}
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
      ) : (
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

          {/* Conditional page render based on view state */}
          {view === "landing" ? (
            <LandingPage 
              products={products}
              onOpenRequest={() => { setDefaultFormDesc(""); setIsModalOpen(true); }} 
              onOpenRequestWithProduct={handleOpenRequestWithProduct}
              onViewAllProducts={() => setView("products")}
              lang={lang} 
              t={t} 
            />
          ) : (
            <ProductsCatalog 
              products={products}
              onOpenRequestWithProduct={handleOpenRequestWithProduct}
              onBack={() => setView("landing")}
              lang={lang}
              t={t}
            />
          )}

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
      )}
    </div>
  );
}
