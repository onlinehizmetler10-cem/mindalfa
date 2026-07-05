import React, { useState } from "react";

export default function RequestForm({ isOpen, onClose, onSubmit, lang, t }) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    description: "",
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = (e) => {
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

    // Submit
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
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
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
              placeholder={t.fieldDescriptionPlaceholder}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.btnClose}
            </button>
            <button type="submit" className="btn-primary">
              {t.btnSend}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
