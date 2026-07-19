import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translations, t } from '../utils/translations.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* Can size options with pricing */
const CAN_SIZES = [
  { value: '20L', price: 70, popular: true },
  { value: '15L', price: 55, popular: false },
  { value: '10L', price: 40, popular: false },
  { value: '5L',  price: 25, popular: false },
];

function OrderForm() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const tr = translations[language];

  // Synchronous auth check — read token immediately
  const token = localStorage.getItem('accessToken');

  // Redirect unauthenticated users before the form renders
  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { message: 'Login first' } });
    }
  }, [token, navigate]);

  // Render nothing while the redirect is in-flight
  if (!token) return null;

  // Date helper — tomorrow's date in YYYY-MM-DD
  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Pre-fill area from signed-in user's profile (read-only)
  const getUserArea = () => {
    try {
      const cached = localStorage.getItem('userProfile');
      if (cached) return JSON.parse(cached).area || '';
    } catch {}
    return '';
  };

  /* ── Form state ── */
  const [cans,               setCans]               = useState(1);
  const [canSize,            setCanSize]            = useState('20L');
  const [deliveryDate,       setDeliveryDate]       = useState(getTomorrowDateString());
  const [timeSlot,           setTimeSlot]           = useState('Morning 7am-10am');
  const [area]                                      = useState(getUserArea);
  const [specialInstructions,setSpecialInstructions]= useState('');
  const [isRecurring,        setIsRecurring]        = useState(false);
  const [frequencyDays,      setFrequencyDays]      = useState(7);
  const [loading,            setLoading]            = useState(false);
  const [orderPlaced,        setOrderPlaced]        = useState(false);
  const [placedOrder,        setPlacedOrder]        = useState(null);
  const [errors,             setErrors]             = useState({});
  const [apiError,           setApiError]           = useState('');

  /* ── Derived pricing ── */
  const selectedSize   = CAN_SIZES.find(s => s.value === canSize) || CAN_SIZES[0];
  const pricePerCan    = selectedSize.price;
  const totalPrice     = cans * pricePerCan;

  /* ── Validation ── */
  const validateForm = () => {
    const e = {};
    if (cans < 1)           e.cans         = tr.order_err_cans;
    if (!deliveryDate) {
      e.deliveryDate = tr.order_err_date_req;
    } else {
      const sel = new Date(deliveryDate); sel.setHours(0,0,0,0);
      const tom = new Date(getTomorrowDateString()); tom.setHours(0,0,0,0);
      if (sel < tom) e.deliveryDate = tr.order_err_date_past;
    }
    if (!area.trim())       e.area         = tr.order_err_area;
    if (isRecurring && frequencyDays < 1)
                            e.frequencyDays = tr.order_err_freq;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handlePlaceOrderSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    // token is already available from the top-level scope guard
    if (!token) { navigate('/login', { state: { message: 'Login first' } }); return; }

    setApiError('');
    setLoading(true);

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const orderBody = {
      quantity:             cans,
      can_size:             canSize,
      delivery_date:        deliveryDate,
      time_slot:            timeSlot,
      area,
      special_instructions: specialInstructions,
      is_recurring:         isRecurring,
      recurring_days:       isRecurring ? frequencyDays : 0,
    };

    try {
      const orderRes  = await fetch(`${API_URL}/orders`, { method: 'POST', headers, body: JSON.stringify(orderBody) });
      if (orderRes.status === 401) { localStorage.removeItem('accessToken'); navigate('/login', { state: { message: 'Login first' } }); return; }
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to place order. Please try again.');

      if (isRecurring) {
        const recRes  = await fetch(`${API_URL}/recurring-orders`, {
          method: 'POST', headers,
          body: JSON.stringify({ quantity: cans, can_size: canSize, time_slot: timeSlot, area, frequency_days: frequencyDays }),
        });
        if (recRes.status === 401) { localStorage.removeItem('accessToken'); navigate('/login', { state: { message: 'Login first' } }); return; }
        const recData = await recRes.json();
        if (!recRes.ok) throw new Error(recData.message || 'Order placed but failed to set recurring schedule.');
      }

      setPlacedOrder(orderData.data || orderData);
      setOrderPlaced(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFFFF] relative">
      {/* Language Toggle floating top-right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-water-blue text-water-blue text-xs font-bold hover:bg-water-blue hover:text-white transition-all duration-200"
          style={{ borderColor: '#4FC3F7', color: '#4FC3F7' }}
        >
          🌐 <span>{tr.lang_current}</span>
          <span className="opacity-60">|</span>
          <span className="opacity-80">{tr.lang_toggle}</span>
        </button>
      </div>

      <div className="w-full max-w-md p-6 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-xl shadow-md flex flex-col items-center">

        {/* Header */}
        <div className="mb-4 text-center flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-2">
            <rect x="10" y="2" width="4" height="2" rx="0.5" fill="#4FC3F7" />
            <path d="M11 4h2v2h-2z" />
            <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
            <path d="M7 14c1.5-0.75 2.5 0.75 4 0s2.5-0.75 4 0 2.5 0.75 4 0" />
            <path d="M7 17.5c1.5-0.75 2.5 0.75 4 0s2.5-0.75 4 0 2.5 0.75 4 0" />
          </svg>
          <h1 className="text-2xl font-bold text-[#3E2723] mb-1">{tr.brand_name}</h1>
          <p className="text-sm text-[#3E2723]/80">{tr.brand_tagline}</p>
        </div>

        {/* ── Success screen ── */}
        {orderPlaced ? (
          <div className="w-full text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#3E2723]">{tr.order_placed_title}</h2>
            <p className="text-sm text-[#3E2723]/90">
              {tr.order_placed_desc}
            </p>
            <div className="p-4 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-lg text-left text-sm text-[#3E2723] space-y-1">
              <div className="font-bold uppercase tracking-wider text-xs border-b border-[#3E2723]/30 pb-1 mb-2">
                {tr.order_ref}
              </div>
              {placedOrder?.id && (
                <div>{tr.order_id}: <span className="font-semibold text-[#4FC3F7]">#{placedOrder.id}</span></div>
              )}
              <div>{tr.order_quantity}: <span className="font-semibold">{cans} {language === 'kn' ? 'ಕ್ಯಾನ್(ಗಳು)' : 'Can(s)'}</span></div>
              <div>{tr.order_can_size_ref}: <span className="font-semibold">{canSize}</span></div>
              <div>{tr.order_price_ref}: <span className="font-semibold">₹{pricePerCan}</span></div>
              <div className="font-bold text-[#3E2723] border-t border-[#3E2723]/20 pt-1 mt-1">
                {tr.order_total}: <span className="text-[#4FC3F7]">₹{totalPrice}</span>
              </div>
              <div>{tr.order_date_ref}: <span className="font-semibold">{deliveryDate}</span></div>
              <div>{tr.order_slot_ref}: <span className="font-semibold">
                {timeSlot === 'Morning 7am-10am' ? tr.order_slot_morning :
                 timeSlot === 'Afternoon 12pm-3pm' ? tr.order_slot_afternoon : tr.order_slot_evening}
              </span></div>
              <div>{tr.order_locality_ref}: <span className="font-semibold">{area}</span></div>
              {isRecurring && (
                <div className="text-[#4FC3F7] font-semibold">
                  {t(tr, 'order_recurring_ref', { days: frequencyDays })}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-[#FFFFFF] text-[#4FC3F7] font-bold rounded-lg border-2 border-[#4FC3F7] hover:bg-[#F0F9FF] active:scale-95 transition-all outline-none"
              >{tr.order_my_orders}</button>
              <button
                onClick={() => { setOrderPlaced(false); setPlacedOrder(null); setApiError(''); setCans(1); setCanSize('20L'); setIsRecurring(false); }}
                className="flex-1 py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-[#0288D1] active:scale-95 transition-all outline-none focus:ring-2 focus:ring-[#4FC3F7]"
              >{tr.order_book_another}</button>
            </div>
          </div>

        ) : (
          /* ── Order form ── */
          <form onSubmit={handlePlaceOrderSubmit} className="w-full space-y-4">
            <h2 className="text-lg font-bold text-[#3E2723] text-center border-b border-[#3E2723]/20 pb-2">
              {tr.order_title}
            </h2>

            {/* Number of Cans */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.order_num_cans}</label>
              <input
                id="cans-input"
                type="number"
                min="1"
                value={cans}
                onChange={(e) => setCans(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              />
              {errors.cans && <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.cans}</span>}
            </div>

            {/* Can Size Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-2">{tr.order_can_size}</label>
              <div className="grid grid-cols-2 gap-2">
                {CAN_SIZES.map((size) => {
                  const selected = canSize === size.value;
                  return (
                    <label
                      key={size.value}
                      htmlFor={`can-size-${size.value}`}
                      className={`relative flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 cursor-pointer transition-all select-none ${
                        selected
                          ? 'border-[#4FC3F7] bg-[#f0f9ff]'
                          : 'border-[#3E2723]/30 bg-[#FFFFFF] hover:border-[#4FC3F7]/60'
                      }`}
                    >
                      <input
                        id={`can-size-${size.value}`}
                        type="radio"
                        name="can_size"
                        value={size.value}
                        checked={selected}
                        onChange={() => setCanSize(size.value)}
                        className="sr-only"
                      />
                      {/* Popular badge */}
                      {size.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#4FC3F7] text-[#FFFFFF] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {tr.order_most_popular}
                        </span>
                      )}
                      {/* Selected checkmark */}
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4FC3F7] flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2">
                            <polyline points="1.5 5 4 7.5 8.5 2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <span className={`text-base font-bold ${selected ? 'text-[#4FC3F7]' : 'text-[#3E2723]'}`}>
                        {size.value} Can
                      </span>
                      <span className={`text-sm font-semibold mt-0.5 ${selected ? 'text-[#3E2723]' : 'text-[#3E2723]/70'}`}>
                        ₹{size.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.order_delivery_date}</label>
              <input
                id="delivery-date-input"
                type="date"
                min={getTomorrowDateString()}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              />
              {errors.deliveryDate && <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.deliveryDate}</span>}
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.order_time_slot}</label>
              <select
                id="time-slot-select"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              >
                <option value="Morning 7am-10am">{tr.order_slot_morning}</option>
                <option value="Afternoon 12pm-3pm">{tr.order_slot_afternoon}</option>
                <option value="Evening 5pm-8pm">{tr.order_slot_evening}</option>
              </select>
            </div>

            {/* Delivery Area — read-only from user profile */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">
                {tr.order_area}
                <span className="ml-2 text-xs font-normal text-[#3E2723]/60 inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {tr.order_area_note}
                </span>
              </label>
              <input
                type="text"
                value={area}
                readOnly
                className="w-full px-4 py-2 bg-[#f0f9ff] border border-[#4FC3F7] rounded-lg text-base text-[#3E2723] cursor-not-allowed select-none"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.order_special}</label>
              <textarea
                rows="2"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder={tr.order_special_placeholder}
              />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between border-t border-[#3E2723]/20 pt-3">
              <span className="text-sm font-semibold text-[#3E2723]">{tr.order_recurring_toggle}</span>
              <button
                type="button"
                id="recurring-toggle"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                  isRecurring ? 'bg-[#4FC3F7]' : 'bg-[#FFFFFF] border border-[#3E2723]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold ${
                  isRecurring ? 'translate-x-6 bg-[#FFFFFF] text-[#4FC3F7]' : 'translate-x-0 bg-[#3E2723] text-[#FFFFFF]'
                }`}>
                  {isRecurring ? (language === 'kn' ? 'ಹೌದು' : 'YES') : (language === 'kn' ? 'ಇಲ್ಲ' : 'NO')}
                </div>
              </button>
            </div>

            {/* Frequency Days (shown only when recurring) */}
            {isRecurring && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-semibold text-[#3E2723] mb-1">{tr.order_recurring_freq}</label>
                <input
                  type="number"
                  min="1"
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
                />
                {errors.frequencyDays && (
                  <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.frequencyDays}</span>
                )}
              </div>
            )}

            {/* ── Order Summary ── */}
            <div className="border-t border-[#3E2723]/30 pt-3 text-[#3E2723]">
              <div className="text-xs font-bold uppercase tracking-wider mb-2">{tr.order_summary}</div>
              <div className="bg-[#FFFFFF] p-3 border border-[#3E2723]/30 rounded-lg text-sm text-[#3E2723] space-y-1.5">
                <div className="flex justify-between">
                  <span>{tr.order_quantity}</span>
                  <span className="font-semibold">{cans} {language === 'kn' ? 'ಕ್ಯಾನ್(ಗಳು)' : 'Can(s)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr.order_can_size_label}</span>
                  <span className="font-semibold">{canSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr.order_price_per_can}</span>
                  <span className="font-semibold">₹{pricePerCan}</span>
                </div>
                <div className="flex justify-between">
                  <span>{tr.order_schedule}</span>
                  <span className="font-semibold text-xs">
                    {deliveryDate || '—'} · {timeSlot === 'Morning 7am-10am' ? tr.order_slot_morning :
                                          timeSlot === 'Afternoon 12pm-3pm' ? tr.order_slot_afternoon : tr.order_slot_evening}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{tr.order_location}</span>
                  <span className="font-semibold">{area || '—'}</span>
                </div>
                {isRecurring && (
                  <div className="text-[#4FC3F7] font-semibold text-xs">
                    {t(tr, 'order_recurring_label', { days: frequencyDays })}
                  </div>
                )}
                {/* Total price row */}
                <div className="flex justify-between items-center border-t border-[#3E2723]/20 pt-2 mt-1">
                  <span className="font-bold text-[#3E2723]">{tr.order_total}</span>
                  <span className="text-lg font-bold text-[#4FC3F7]">₹{totalPrice}</span>
                </div>
                <div className="text-xs text-[#3E2723]/60 text-right">
                  {cans} × ₹{pricePerCan} = ₹{totalPrice}
                </div>
              </div>
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-[#f0f9ff] border border-[#4FC3F7] text-[#3E2723]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC3F7" strokeWidth="2" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              id="place-order-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-[#0288D1] active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-[#4FC3F7] shadow-md"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
                : isRecurring ? tr.order_btn_recurring : tr.order_btn
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OrderForm;
