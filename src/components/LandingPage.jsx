import React, { useState, useEffect } from "react";
import logoImg from "../assets/logo.png";

const prompts = [
  "create_billing_dashboard.jsx",
  "mql5_rsi_grid_bot.mq5",
  "accounting_ledger_api.py"
];

const snippets = [
  `import { useState, useEffect } from 'react';

export function BillingDashboard({ userId }) {
  const [invoices, setInvoices] = useState([]);
  
  useEffect(() => {
    api.getInvoices(userId)
       .then(res => setInvoices(res.data));
  }, [userId]);

  return (
    <div className="billing-grid glass">
      {invoices.map(inv => (
        <InvoiceCard key={inv.id} data={inv} />
      ))}
    </div>
  );
}`,
  `#property copyright "MindAlfa"
#property version   "3.00"

input double Lots = 0.01;
input int RSI_Period = 14;

void OnTick()
{
   double rsi = iRSI(_Symbol, _Period, RSI_Period);
   if(rsi < 30 && PositionsTotal() == 0) {
      trade.Buy(Lots, _Symbol);
   }
   if(rsi > 70 && PositionsTotal() == 0) {
      trade.Sell(Lots, _Symbol);
   }
}`,
  `from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

app = FastAPI()

@app.get("/ledger/{company_id}")
def get_ledger(company_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.company_id == company_id
    ).all()
    return {"status": "success", "data": transactions}`
];

export default function LandingPage({ onOpenRequest, products = [], onOpenRequestWithProduct, lang, t }) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [status, setStatus] = useState("idle"); // idle -> typing_prompt -> thinking -> writing_code -> done
  const [typedPrompt, setTypedPrompt] = useState("");
  const [visibleCode, setVisibleCode] = useState("");

  // Prompt typing and coding simulation loop
  useEffect(() => {
    if (status === "idle") {
      const timeout = setTimeout(() => {
        setStatus("typing_prompt");
      }, 1000);
      return () => clearTimeout(timeout);
    }

    if (status === "typing_prompt") {
      const fullText = `generate --spec ${prompts[promptIdx]}`;
      if (typedPrompt.length < fullText.length) {
        const timeout = setTimeout(() => {
          setTypedPrompt(fullText.slice(0, typedPrompt.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setStatus("thinking");
        }, 800);
        return () => clearTimeout(timeout);
      }
    }

    if (status === "thinking") {
      const timeout = setTimeout(() => {
        setStatus("writing_code");
      }, 1500);
      return () => clearTimeout(timeout);
    }

    if (status === "writing_code") {
      const codeLines = snippets[promptIdx].split("\n");
      const currentLines = visibleCode.split("\n");
      
      if (visibleCode === "") {
        setVisibleCode(codeLines[0]);
      } else if (currentLines.length < codeLines.length) {
        const timeout = setTimeout(() => {
          setVisibleCode(prev => prev + "\n" + codeLines[currentLines.length]);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setStatus("done");
        }, 500);
        return () => clearTimeout(timeout);
      }
    }

    if (status === "done") {
      const timeout = setTimeout(() => {
        setStatus("idle");
        setTypedPrompt("");
        setVisibleCode("");
        setPromptIdx(prev => (prev + 1) % prompts.length);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [status, typedPrompt, visibleCode, promptIdx]);

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing-wrapper">
      {/* Welcome / Intro Cover Section */}
      <section id="welcome" className="welcome-section">
        <div className="welcome-glow"></div>
        <div className="welcome-content">
          <img src={logoImg} alt="MindAlfa Logo" className="welcome-logo" />
          <h1 className="welcome-brand gradient-text" data-text="MINDALFA">MINDALFA</h1>
          <p className="welcome-tagline">{t.tagline}</p>
          <div className="scroll-indicator" onClick={scrollToAbout}>
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section id="about" className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content container">
          <div className="hero-text-block">
            <span className="badge-promo">
              ✨ {t.tagline}
            </span>
            <h1 className="hero-title">
              {t.heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="gradient-text">
                {t.heroTitle.split(" ").slice(-2).join(" ")}
              </span>
            </h1>
            <p className="hero-desc">{t.heroSubtitle}</p>
            <div className="hero-buttons">
              <button className="btn-primary btn-large" onClick={onOpenRequest}>
                {t.ctaSubmitRequest} &rarr;
              </button>
              <button className="btn-secondary btn-large" onClick={scrollToServices}>
                {t.ctaExploreServices}
              </button>
            </div>
          </div>

          {/* Interactive AI Code Generator Console */}
          <div className="hero-widget-block">
            <div className="widget-card glass">
              <div className="widget-header">
                <div className="widget-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="widget-title font-mono">MindAlfa AI Coder v3.0</div>
                <div className="live-indicator">
                  <span className="pulse-dot"></span> AI ACTIVE
                </div>
              </div>
              <div className="widget-body terminal-body">
                <div className="terminal-prompt font-mono">
                  <span className="terminal-user">agent@mindalfa:~$</span> {typedPrompt}
                  {status === "typing_prompt" && <span className="cursor-blink">|</span>}
                </div>
                
                {status === "thinking" && (
                  <div className="terminal-thinking font-mono">
                    <span className="spinner">⚙️</span> Spec analiz ediliyor ve kod modülleri oluşturuluyor...
                  </div>
                )}
                
                {(status === "writing_code" || status === "done") && (
                  <div className="terminal-code-block font-mono">
                    <pre>
                      <code>
                        {visibleCode}
                      </code>
                    </pre>
                    {status === "writing_code" && <span className="cursor-blink">|</span>}
                  </div>
                )}
                
                {status === "done" && (
                  <div className="terminal-status font-mono text-completed">
                    ✓ Build başarılı. Kod derlendi (143ms).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="services-section container">
        <div className="section-header">
          <h2 className="gradient-text">{t.servicesTitle}</h2>
          <p>{t.servicesSubtitle}</p>
        </div>

        <div className="services-grid">
          {/* Card 1: Trading */}
          <div className="service-card glass">
            <div className="service-icon-bg">📈</div>
            <h3>{t.financialTitle}</h3>
            <p>{t.financialDesc}</p>
            <ul className="service-features font-mono">
              <li>&gt; MT4 & MT5 EA (MQL4/MQL5)</li>
              <li>&gt; Custom FX & Stock Bots</li>
              <li>&gt; API Integrations</li>
            </ul>
          </div>

          {/* Card 2: Enterprise Software */}
          <div className="service-card glass">
            <div className="service-icon-bg">📊</div>
            <h3>{t.enterpriseTitle}</h3>
            <p>{t.enterpriseDesc}</p>
            <ul className="service-features font-mono">
              <li>&gt; Ledger & Accounting</li>
              <li>&gt; ERP & CRM Modules</li>
              <li>&gt; Custom Local/Cloud DBs</li>
            </ul>
          </div>

          {/* Card 3: Custom Business App */}
          <div className="service-card glass">
            <div className="service-icon-bg">💻</div>
            <h3>{t.customTitle}</h3>
            <p>{t.customDesc}</p>
            <ul className="service-features font-mono">
              <li>&gt; Bespoke Web & Desktop</li>
              <li>&gt; Tailored Workflows</li>
              <li>&gt; Fullsource Delivery</li>
            </ul>
          </div>

          {/* Card 4: AI modules */}
          <div className="service-card glass">
            <div className="service-icon-bg">🧠</div>
            <h3>{t.aiTitle}</h3>
            <p>{t.aiDesc}</p>
            <ul className="service-features font-mono">
              <li>&gt; LLM integrations</li>
              <li>&gt; Automated data models</li>
              <li>&gt; Smart decision triggers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Satıştaki Ürünlerimiz Section */}
      <section id="products" className="products-section container">
        <div className="section-header text-center">
          <h2 className="gradient-text">{t.productsTitle}</h2>
          <p className="section-subtitle">{t.productsSubtitle}</p>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products glass text-center">
              <p>{t.adminNoProducts}</p>
            </div>
          ) : (
            products.map((product) => (
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
            ))
          )}
        </div>
      </section>

      {/* Support & Training Banner Section */}
      <section id="support" className="support-banner-section container">
        <div className="support-card glass gradient-border">
          <div className="support-content">
            <div className="support-badge">
              🔰 1 YEAR WARRANTY
            </div>
            <h2>{t.supportTitle}</h2>
            <p>{t.supportDesc}</p>
            <div className="support-benefits">
              <div className="benefit">
                <span className="benefit-icon">📞</span>
                <div>
                  <strong>7/24 Teknik Destek</strong>
                  <p>Hatalara karşı anında uzaktan bağlantı.</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🎓</span>
                <div>
                  <strong>Detaylı Personel Eğitimi</strong>
                  <p>Yazılımı verimli kullanmanız için eğitim seansları.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="support-visual-bg">
            <div className="glowing-circle"></div>
            <div className="support-shield">🛡️</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <span className="gradient-text font-weight-bold">{t.brandName}</span>
            <p>{t.tagline}</p>
          </div>
          <div className="footer-links">
            <p>© {new Date().getFullYear()} MindAlfa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
