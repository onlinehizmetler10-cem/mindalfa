import React, { useState, useEffect } from "react";

export default function RequestForm({ isOpen, onClose, onSubmit, lang, t, defaultDesc }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        description: defaultDesc || "",
      }));
    }
  }, [isOpen, defaultDesc]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const { name, surname, phone, email, description } = formData;
    if (!name.trim() || !surname.trim() || !phone.trim() || !email.trim() || !description.trim()) {
      setError(t.validationError);
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(lang === "tr" ? "Lütfen geçerli bir e-posta adresi girin." : "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Access key can be defined in .env as VITE_WEB3FORMS_KEY
      const apiKey = import.meta.env.VITE_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE";
      
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: apiKey,
          name: `${name} ${surname}`,
          email: email,
          phone: phone,
          message: description,
          subject: `Yeni Proje Talebi - ${name} ${surname}`,
          from_name: "MindAlfa Web Portal",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Trigger parent state update (saves to local list)
        onSubmit({
          id: Date.now().toString(),
          ...formData,
          status: "new",
          date: new Date().toLocaleString(lang === "tr" ? "tr-TR" : "en-US"),
        });

        // Reset form
        setFormData({
          name: "",
          surname: "",
          phone: "",
          email: "",
          description: "",
        });
        setError("");
      } else {
        setError(lang === "tr" ? "Gönderim başarısız oldu. Lütfen tekrar deneyin." : "Failed to send. Please try again.");
      }
    } catch (err) {
      console.error("Web3Forms API error:", err);
      setError(lang === "tr" ? "Bir bağlantı hatası oluştu. Lütfen internetinizi kontrol edin." : "A connection error occurred. Please check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isSubmitting ? null : onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
          &times;
        </button>
        
        <h2 className="gradient-text">{t.formTitle}</h2>
        <p className="modal-subtitle">{t.formSubtitle}</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t.fieldName}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={lang === "tr" ? "Örn. Ahmet" : "e.g. John"}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="surname">{t.fieldSurname}</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={lang === "tr" ? "Örn. Yılmaz" : "e.g. Doe"}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">{t.fieldPhone}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder={lang === "tr" ? "Örn. 05551234567" : "e.g. +15551234567"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.fieldEmail}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t.fieldDescription}</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder={t.fieldDescriptionPlaceholder}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              {t.btnClose}
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (lang === "tr" ? "Gönderiliyor..." : "Sending...") : t.btnSend}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
