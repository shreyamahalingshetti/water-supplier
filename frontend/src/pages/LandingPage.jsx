import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translations } from '../utils/translations.js';

/* ─────────────────────────────────────────────
   SVG Illustrations & Icons (inline, no deps)
───────────────────────────────────────────── */
const WaterCanIllustration = () => (
  <svg viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto drop-shadow-2xl">
    <rect x="60" y="100" width="200" height="260" rx="20" fill="#4FC3F7" opacity="0.15" />
    <rect x="60" y="100" width="200" height="260" rx="20" stroke="#4FC3F7" strokeWidth="3" fill="white" />
    <clipPath id="canClip"><rect x="60" y="100" width="200" height="260" rx="20" /></clipPath>
    <rect x="60" y="240" width="200" height="120" fill="#4FC3F7" opacity="0.35" clipPath="url(#canClip)" />
    <path d="M60 245 Q100 235 140 245 Q180 255 220 245 Q250 238 260 245 L260 260 L60 260 Z" fill="#4FC3F7" opacity="0.5" clipPath="url(#canClip)" />
    <path d="M200 120 Q250 120 250 160 Q250 200 200 200" stroke="#4FC3F7" strokeWidth="14" strokeLinecap="round" fill="none" />
    <rect x="110" y="70" width="100" height="40" rx="10" fill="#4FC3F7" />
    <rect x="130" y="55" width="60" height="20" rx="8" fill="#0288D1" />
    <rect x="85" y="145" width="150" height="80" rx="10" fill="#4FC3F7" opacity="0.15" stroke="#4FC3F7" strokeWidth="1.5" />
    <text x="160" y="178" textAnchor="middle" fill="#8D6E63" fontSize="14" fontWeight="bold" fontFamily="Inter,sans-serif">JAL SEVA</text>
    <text x="160" y="198" textAnchor="middle" fill="#8D6E63" fontSize="11" fontFamily="Inter,sans-serif">20 Litres</text>
    <ellipse cx="85" cy="310" rx="8" ry="12" fill="#4FC3F7" opacity="0.5" />
    <ellipse cx="235" cy="320" rx="6" ry="9" fill="#4FC3F7" opacity="0.4" />
    <ellipse cx="50" cy="270" rx="5" ry="7" fill="#4FC3F7" opacity="0.3" />
  </svg>
);

const DropletIcon = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L6 10C4 13 4 18 8 20.5C10 21.7 14 21.7 16 20.5C20 18 20 13 18 10L12 2Z"
      fill="#4FC3F7" stroke="#4FC3F7" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

const WaveBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 200" preserveAspectRatio="none">
      <path d="M0,100 C360,180 720,20 1080,100 C1260,140 1380,80 1440,100 L1440,200 L0,200 Z" fill="#4FC3F7" />
    </svg>
    <svg className="absolute bottom-0 left-0 w-full opacity-6" viewBox="0 0 1440 200" preserveAspectRatio="none">
      <path d="M0,140 C480,60 960,200 1440,120 L1440,200 L0,200 Z" fill="#4FC3F7" />
    </svg>
  </div>
);

/* ─── Language Toggle Button ─── */
const LangToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  const tr = translations[language];
  return (
    <button
      onClick={toggleLanguage}
      title="Switch language / ಭಾಷೆ ಬದಲಿಸಿ"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-water-blue text-water-blue text-xs font-bold hover:bg-water-blue hover:text-white transition-all duration-200 shrink-0"
    >
      🌐 <span>{tr.lang_current}</span>
      <span className="opacity-60">|</span>
      <span className="opacity-80">{tr.lang_toggle}</span>
    </button>
  );
};

/* ─── Navbar ─── */
const Navbar = () => {
  const { language } = useLanguage();
  const tr = translations[language];
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOrderNow = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { message: 'Login first' } });
    } else {
      navigate('/place-order');
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: tr.nav_home, href: '#hero' },
    { label: tr.nav_how_it_works, href: '#how-it-works' },
    { label: tr.nav_products, href: '#products' },
    { label: tr.nav_contact, href: '#footer' },
  ];

  const scrollTo = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg shadow-water-blue/10' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-water-blue rounded-full flex items-center justify-center shadow-md">
              <DropletIcon size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-warm-brown tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Jal <span className="text-water-blue">Seva</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-warm-brown text-sm font-medium hover:text-water-blue transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-water-blue group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Desktop CTA + Lang toggle */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-water-blue border-2 border-water-blue rounded-full hover:bg-water-blue hover:text-white transition-all duration-200"
            >
              {tr.nav_login}
            </Link>
            <button
              onClick={handleOrderNow}
              className="px-5 py-2 text-sm font-semibold text-white bg-water-blue rounded-full hover:bg-water-blue-dark shadow-md hover:shadow-lg transition-all duration-200"
            >
              {tr.nav_order_now}
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 text-warm-brown"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                : <><line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" /><line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" /><line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" /></>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-water-blue/20 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-2 py-2 text-warm-brown font-medium hover:text-water-blue transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2 flex-wrap">
              <LangToggle />
              <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-water-blue border-2 border-water-blue rounded-full hover:bg-water-blue hover:text-white transition-all">{tr.nav_login}</Link>
              <button onClick={handleOrderNow} className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-water-blue rounded-full hover:bg-water-blue-dark transition-all">{tr.nav_order_now}</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ─── Hero Section ─── */
const HeroSection = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const tr = translations[language];

  const handleOrderNow = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { message: 'Login first' } });
    } else {
      navigate('/place-order');
    }
  };
  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-white pt-16 overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-water-blue opacity-5 -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-water-blue opacity-8 translate-y-1/3 -translate-x-1/4" />
      <WaveBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-water-blue/10 border border-water-blue/30 text-water-blue text-sm font-semibold px-4 py-2 rounded-full">
              <DropletIcon size={16} />
              <span>{tr.hero_badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-warm-brown leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {tr.hero_title_1}{' '}
              <span className="text-water-blue relative">
                {tr.hero_title_2}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M0 8 Q75 0 150 8 Q225 16 300 8" stroke="#4FC3F7" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>{' '}
              {tr.hero_title_3}
            </h1>

            <p className="text-lg text-warm-brown/70 leading-relaxed max-w-lg">
              {tr.hero_subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleOrderNow}
                className="group inline-flex items-center gap-2 px-8 py-4 text-white font-bold bg-water-blue rounded-full shadow-lg shadow-water-blue/30 hover:bg-water-blue-dark hover:shadow-xl hover:shadow-water-blue/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                {tr.hero_order_now}
              </button>
              <button
                onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 text-water-blue font-bold border-2 border-water-blue rounded-full hover:bg-water-blue/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                {tr.hero_how_it_works}
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: '✓', key: 'hero_badge_pure' },
                { icon: '🚚', key: 'hero_badge_delivery' },
                { icon: '💧', key: 'hero_badge_price' },
              ].map(({ icon, key }) => (
                <div key={key} className="flex items-center gap-2 bg-white border border-water-blue/20 rounded-full px-4 py-2 shadow-sm hover:shadow-md hover:border-water-blue/50 transition-all duration-200">
                  <span className="text-base">{icon}</span>
                  <span className="text-warm-brown text-sm font-semibold">{tr[key]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-water-blue opacity-10 blur-3xl" />
            </div>
            <div className="relative w-72 lg:w-80 animate-[float_4s_ease-in-out_infinite]">
              <WaterCanIllustration />
            </div>
            <div className="absolute top-4 -left-4 lg:-left-8 bg-white rounded-2xl shadow-xl p-3 border border-water-blue/15 animate-[float_5s_ease-in-out_infinite_0.5s]">
              <p className="text-xs text-warm-brown/60 font-medium">{tr.hero_happy_customers}</p>
              <p className="text-2xl font-extrabold text-warm-brown">2,500+</p>
            </div>
            <div className="absolute bottom-8 -right-2 lg:-right-6 bg-white rounded-2xl shadow-xl p-3 border border-water-blue/15 animate-[float_5s_ease-in-out_infinite_1s]">
              <p className="text-xs text-warm-brown/60 font-medium">{tr.hero_cans_delivered}</p>
              <p className="text-2xl font-extrabold text-water-blue">50K+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── How It Works ─── */
const HowItWorksSection = () => {
  const { language } = useLanguage();
  const tr = translations[language];

  const steps = [
    {
      icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>),
      title: tr.hiw_step1_title,
      desc: tr.hiw_step1_desc,
    },
    {
      icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>),
      title: tr.hiw_step2_title,
      desc: tr.hiw_step2_desc,
    },
    {
      icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2"><path d="M12 2L6 10C4 13 4 18 8 20.5C10 21.7 14 21.7 16 20.5C20 18 20 13 18 10L12 2Z" /></svg>),
      title: tr.hiw_step3_title,
      desc: tr.hiw_step3_desc,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-3">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="0.5" fill="#4FC3F7" /></pattern></defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-water-blue/10 text-water-blue text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <DropletIcon size={16} />
            {tr.hiw_badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-warm-brown mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {tr.hiw_title}
          </h2>
          <p className="text-warm-brown/60 max-w-xl mx-auto text-lg">
            {tr.hiw_subtitle}
          </p>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 flex flex-col items-center text-center group px-4">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-water-blue/10 border-2 border-water-blue/30 flex items-center justify-center group-hover:bg-water-blue/20 group-hover:border-water-blue group-hover:scale-110 transition-all duration-300 shadow-lg shadow-water-blue/10">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-water-blue text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-warm-brown mb-3">{step.title}</h3>
                <p className="text-warm-brown/60 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-16 mt-8">
                  <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                    <path d="M0 12 Q12 4 24 12 Q36 20 48 12" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 2" />
                    <path d="M40 6 L48 12 L40 18" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/place-order"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold bg-water-blue rounded-full shadow-lg shadow-water-blue/30 hover:bg-water-blue-dark hover:-translate-y-0.5 transition-all duration-200"
          >
            {tr.hiw_cta}
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─── Products Section ─── */
const CanSVG = ({ label }) => (
  <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-24 mx-auto">
    <rect x="15" y="25" width="70" height="90" rx="8" fill="white" stroke="#4FC3F7" strokeWidth="2" />
    <rect x="15" y="55" width="70" height="60" rx="0" fill="#4FC3F7" opacity="0.2" clipPath="url(#cc)" />
    <clipPath id="cc"><rect x="15" y="25" width="70" height="90" rx="8" /></clipPath>
    <path d="M15 58 Q30 50 50 58 Q70 66 85 58" stroke="#4FC3F7" strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M65 30 Q85 30 85 50 Q85 70 65 70" stroke="#4FC3F7" strokeWidth="5" strokeLinecap="round" fill="none" />
    <rect x="30" y="10" width="40" height="18" rx="5" fill="#4FC3F7" />
    <rect x="38" y="3" width="24" height="10" rx="4" fill="#0288D1" />
    <text x="50" y="45" textAnchor="middle" fill="#8D6E63" fontSize="11" fontWeight="bold" fontFamily="Inter,sans-serif">{label}</text>
  </svg>
);

const ProductsSection = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleOrderNow = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { message: 'Login first' } });
    } else {
      navigate('/place-order');
    }
  };
  const tr = translations[language];

  const products = [
    { size: '20L', price: '₹70', popular: true, descKey: 'products_desc_20l' },
    { size: '15L', price: '₹55', popular: false, descKey: 'products_desc_15l' },
    { size: '10L', price: '₹40', popular: false, descKey: 'products_desc_10l' },
    { size: '5L',  price: '₹25', popular: false, descKey: 'products_desc_5l' },
  ];

  return (
    <section id="products" className="py-24 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 Q360,64 720,32 Q1080,0 1440,48 L1440,64 L0,64 Z" fill="#F0F9FF" opacity="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-water-blue/10 text-water-blue text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <DropletIcon size={16} />
            {tr.products_badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-warm-brown mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {tr.products_title}
          </h2>
          <p className="text-warm-brown/60 max-w-xl mx-auto">
            {tr.products_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.size}
              className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-default
                ${p.popular ? 'border-water-blue shadow-water-blue/20' : 'border-water-blue/20 hover:border-water-blue/60'}`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-water-blue text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                  {tr.products_most_popular}
                </div>
              )}
              <CanSVG label={p.size} />
              <h3 className="text-2xl font-extrabold text-warm-brown mt-4 mb-1">{p.size} Can</h3>
              <p className="text-warm-brown/60 text-sm mb-4">{tr[p.descKey]}</p>
              <div className="text-3xl font-extrabold text-water-blue mb-6">{p.price}</div>
              <button
                onClick={handleOrderNow}
                className={`w-full py-3 rounded-full text-sm font-bold transition-all duration-200
                  ${p.popular
                    ? 'bg-water-blue text-white hover:bg-water-blue-dark shadow-md hover:shadow-lg'
                    : 'border-2 border-water-blue text-water-blue hover:bg-water-blue hover:text-white'
                  }`}
              >
                {tr.products_order_now}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Why Choose Us ─── */
const WhyChooseUsSection = () => {
  const { language } = useLanguage();
  const tr = translations[language];

  const features = [
    {
      icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
      titleKey: 'why_local_title', descKey: 'why_local_desc',
    },
    {
      icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>),
      titleKey: 'why_hygienic_title', descKey: 'why_hygienic_desc',
    },
    {
      icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
      titleKey: 'why_regular_title', descKey: 'why_regular_desc',
    },
    {
      icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>),
      titleKey: 'why_customer_title', descKey: 'why_customer_desc',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-water-blue/5 via-white to-water-blue/3 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-water-blue/10 text-water-blue text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <DropletIcon size={16} />
            {tr.why_badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-warm-brown mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {tr.why_title}
          </h2>
          <p className="text-warm-brown/60 max-w-xl mx-auto">{tr.why_subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.titleKey} className="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-water-blue/10 hover:border-water-blue/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-water-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
              <div className="w-14 h-14 bg-water-blue rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-warm-brown mb-2">{tr[f.titleKey]}</h3>
              <p className="text-warm-brown/60 text-sm leading-relaxed">{tr[f.descKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Stats Banner ─── */
const StatsBanner = () => {
  const { language } = useLanguage();
  const tr = translations[language];

  const stats = [
    { value: '2,500+', labelKey: 'stats_customers' },
    { value: '50,000+', labelKey: 'stats_cans' },
    { value: '5 ' + (language === 'kn' ? 'ವರ್ಷ' : 'Years'), labelKey: 'stats_years' },
    { value: '99.8%', labelKey: 'stats_satisfaction' },
  ];

  return (
    <section className="py-16 bg-water-blue relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
          <circle cx="20" cy="50" r="40" fill="white" />
          <circle cx="180" cy="50" r="40" fill="white" />
          <circle cx="100" cy="80" r="30" fill="white" />
        </svg>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, labelKey }) => (
            <div key={labelKey} className="space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">{value}</div>
              <div className="text-white/80 text-sm font-medium">{tr[labelKey]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Footer ─── */
const Footer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const tr = translations[language];

  const handleOrderNow = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { message: 'Login first' } });
    } else {
      navigate('/place-order');
    }
  };

  return (
    <footer id="footer" className="bg-warm-brown text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 overflow-hidden h-10">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 Q360,40 720,20 Q1080,0 1440,30 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-water-blue rounded-full flex items-center justify-center">
                <DropletIcon size={20} />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Jal <span className="text-water-blue">Seva</span>
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{tr.footer_tagline}</p>
            <div className="inline-flex items-center gap-3 bg-water-blue/20 border border-water-blue/40 rounded-2xl px-4 py-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <p className="text-water-blue text-xs font-semibold">{tr.footer_call_us}</p>
                <p className="text-white font-bold">+91 98765 43210</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-water-blue font-bold text-sm uppercase tracking-widest mb-5">{tr.footer_quick_links}</h4>
            <ul className="space-y-3">
              {[
                { label: tr.nav_home, href: '#hero' },
                { label: tr.nav_how_it_works, href: '#how-it-works' },
                { label: tr.footer_our_products, href: '#products' },
                { label: tr.nav_login, href: '/login', isRoute: true },
                { label: tr.footer_place_order, href: '/place-order', isRoute: true },
              ].map(({ label, href, isRoute }) =>
                isRoute ? (
                  <li key={label}>
                    <Link to={href} className="text-white/70 hover:text-water-blue text-sm transition-colors duration-200 flex items-center gap-1">
                      <span className="text-water-blue">›</span> {label}
                    </Link>
                  </li>
                ) : (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="text-white/70 hover:text-water-blue text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                      <span className="text-water-blue">›</span> {label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-water-blue font-bold text-sm uppercase tracking-widest mb-5">{tr.footer_delivery_hours}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                [tr.footer_mon_fri, '7:00 AM – 8:00 PM'],
                [tr.footer_saturday, '7:00 AM – 6:00 PM'],
                [tr.footer_sunday, '9:00 AM – 4:00 PM'],
              ].map(([day, time]) => (
                <li key={day} className="flex justify-between gap-4">
                  <span>{day}</span>
                  <span className="text-white font-medium">{time}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleOrderNow}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-water-blue text-white text-sm font-bold rounded-full hover:bg-water-blue-dark transition-all duration-200 shadow-lg"
            >
              {tr.footer_order_now}
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>{tr.footer_copyright.replace('{year}', new Date().getFullYear())}</p>
          <p className="italic text-water-blue/80">{tr.footer_tagline}</p>
        </div>
      </div>
    </footer>
  );
};

/* ─── Scroll-to-top ─── */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-water-blue text-white rounded-full shadow-xl hover:bg-water-blue-dark hover:scale-110 transition-all duration-200 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  ) : null;
};

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', scrollBehavior: 'smooth' }}>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ProductsSection />
      <WhyChooseUsSection />
      <StatsBanner />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
