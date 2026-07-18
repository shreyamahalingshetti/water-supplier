import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * OrderForm Component for Jal Seva
 * Adheres strictly to the 3-color scheme:
 * 1. Light water blue (#4FC3F7) - accents, buttons, highlights, water can svg
 * 2. White (#FFFFFF) - background, card
 * 3. Warm brown (#3E2723) - headings, labels, summary details, secondary text
 */
function OrderForm() {
  const navigate = useNavigate();

  // Date helper to get tomorrow's date string in YYYY-MM-DD format
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Form states
  const [cans, setCans] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState(getTomorrowDateString());
  const [timeSlot, setTimeSlot] = useState('Morning 7am-10am');
  const [area, setArea] = useState('Indiranagar'); // Default pre-filled locality
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequencyDays, setFrequencyDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);  // API response data
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const tempErrors = {};
    if (cans < 1) {
      tempErrors.cans = 'Number of cans must be at least 1';
    }
    if (!deliveryDate) {
      tempErrors.deliveryDate = 'Delivery date is required';
    } else {
      const selected = new Date(deliveryDate);
      const tomorrow = new Date(getTomorrowDateString());
      // Reset hours to compare dates only
      selected.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      if (selected < tomorrow) {
        tempErrors.deliveryDate = 'Delivery date cannot be today or in the past';
      }
    }
    if (!area.trim()) {
      tempErrors.area = 'Delivery area is required';
    }
    if (isRecurring && frequencyDays < 1) {
      tempErrors.frequencyDays = 'Delivery frequency must be at least 1 day';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Guard: token must exist
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setApiError('');
    setLoading(true);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const orderBody = {
      quantity:              cans,
      delivery_date:         deliveryDate,
      time_slot:             timeSlot,
      area,
      special_instructions:  specialInstructions,
      is_recurring:          isRecurring,
      recurring_days:        isRecurring ? frequencyDays : 0,
    };


    try {
      // Step 1 — Create the order
      const orderRes = await fetch(`${API_URL}/orders`, {
        method:  'POST',
        headers: authHeaders,
        body:    JSON.stringify(orderBody),
      });

      if (orderRes.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to place order. Please try again.');
      }

      // Step 2 — If recurring, also create the schedule
      if (isRecurring) {
        const recRes = await fetch(`${API_URL}/recurring-orders`, {
          method:  'POST',
          headers: authHeaders,
          body: JSON.stringify({
            quantity:      cans,
            time_slot:     timeSlot,
            area,
            frequency_days: frequencyDays,
          }),
        });

        if (recRes.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
        }

        const recData = await recRes.json();
        if (!recRes.ok) {
          throw new Error(recData.message || 'Order placed but failed to set recurring schedule.');
        }
      }

      // Success
      setPlacedOrder(orderData.data || orderData);
      setOrderPlaced(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFFFF]">
      <div className="w-full max-w-md p-6 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-xl shadow-md flex flex-col items-center">
        
        {/* Header & Logo */}
        <div className="mb-4 text-center flex flex-col items-center">
          {/* Water Can SVG Illustration */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4FC3F7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 mb-2 text-[#4FC3F7]"
          >
            {/* Can Spout Cap */}
            <rect x="10" y="2" width="4" height="2" rx="0.5" fill="#4FC3F7" />
            {/* Can Neck */}
            <path d="M11 4h2v2h-2z" />
            {/* Can Main Body */}
            <path d="M7 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" />
            {/* Water Levels */}
            <path d="M7 14c1.5-0.75 2.5 0.75 4 0s2.5-0.75 4 0 2.5 0.75 4 0" />
            <path d="M7 17.5c1.5-0.75 2.5 0.75 4 0s2.5-0.75 4 0 2.5 0.75 4 0" />
          </svg>
          <h1 className="text-2xl font-bold text-[#3E2723] mb-1">Jal Seva</h1>
          <p className="text-sm text-[#3E2723]/80">Fresh water, delivered to your door</p>
        </div>

        {orderPlaced ? (
          <div className="w-full text-center space-y-4">
            {/* Success icon */}
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#3E2723]">Order Placed!</h2>
            <p className="text-sm text-[#3E2723]/90">
              Your water delivery request has been recorded. We will send a WhatsApp notification shortly.
            </p>
            <div className="p-4 bg-[#FFFFFF] border border-[#3E2723]/30 rounded-lg text-left text-sm text-[#3E2723] space-y-1">
              <div className="font-bold uppercase tracking-wider text-xs border-b border-[#3E2723]/30 pb-1 mb-2">
                Booking Reference
              </div>
              {placedOrder?.id && (
                <div>Order ID: <span className="font-semibold text-[#4FC3F7]">#{placedOrder.id}</span></div>
              )}
              <div>Cans: <span className="font-semibold">{cans}</span></div>
              <div>Date: <span className="font-semibold">{deliveryDate}</span></div>
              <div>Slot: <span className="font-semibold">{timeSlot}</span></div>
              <div>Locality: <span className="font-semibold">{area}</span></div>
              {isRecurring && (
                <div className="text-[#4FC3F7] font-semibold">★ Recurring: Every {frequencyDays} days</div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-[#FFFFFF] text-[#4FC3F7] font-bold rounded-lg border-2 border-[#4FC3F7] hover:bg-[#F0F9FF] active:scale-95 transition-all outline-none"
              >
                My Orders
              </button>
              <button
                onClick={() => {
                  setOrderPlaced(false);
                  setPlacedOrder(null);
                  setApiError('');
                  setCans(1);
                  setIsRecurring(false);
                }}
                className="flex-1 py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-[#0288D1] active:scale-95 transition-all outline-none focus:ring-2 focus:ring-[#4FC3F7]"
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrderSubmit} className="w-full space-y-4">
            <h2 className="text-lg font-bold text-[#3E2723] text-center border-b border-[#3E2723]/20 pb-2">
              Place Your Order
            </h2>

            {/* Number of Cans */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Number of Cans (20L)</label>
              <input
                type="number"
                min="1"
                value={cans}
                onChange={(e) => setCans(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              />
              {errors.cans && (
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.cans}</span>
              )}
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Delivery Date</label>
              <input
                type="date"
                min={getTomorrowDateString()}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              />
              {errors.deliveryDate && (
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.deliveryDate}</span>
              )}
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Preferred Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723]"
              >
                <option value="Morning 7am-10am">Morning 7am-10am</option>
                <option value="Afternoon 12pm-3pm">Afternoon 12pm-3pm</option>
                <option value="Evening 5pm-8pm">Evening 5pm-8pm</option>
              </select>
            </div>

            {/* Delivery Area/Locality */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Delivery Area/Locality</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder="Locality name"
              />
              {errors.area && (
                <span className="text-xs text-[#3E2723] mt-1 block font-semibold">* {errors.area}</span>
              )}
            </div>

            {/* Special Instructions (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-[#3E2723] mb-1">Special Instructions (Optional)</label>
              <textarea
                rows="2"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#3E2723] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] focus:border-[#4FC3F7] transition-all text-base outline-none text-[#3E2723] placeholder-[#3E2723]/50"
                placeholder="e.g. Leave near the gate, ring bell twice"
              />
            </div>

            {/* Recurring Order Toggle Switch */}
            <div className="flex items-center justify-between border-t border-[#3E2723]/20 pt-3">
              <span className="text-sm font-semibold text-[#3E2723]">Set as Recurring Order?</span>
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                  isRecurring ? 'bg-[#4FC3F7]' : 'bg-[#FFFFFF] border border-[#3E2723]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-[9px] font-bold ${
                    isRecurring
                      ? 'translate-x-6 bg-[#FFFFFF] text-[#4FC3F7]'
                      : 'translate-x-0 bg-[#3E2723] text-[#FFFFFF]'
                  }`}
                >
                  {isRecurring ? 'YES' : 'NO'}
                </div>
              </button>
            </div>

            {/* Recurring Frequency Frequency Days */}
            {isRecurring && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-semibold text-[#3E2723] mb-1">Deliver every X days</label>
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

            {/* Dynamic Summary Section */}
            <div className="border-t border-[#3E2723]/30 pt-3 text-[#3E2723]">
              <div className="text-xs font-bold uppercase tracking-wider mb-2">Order Summary</div>
              <div className="bg-[#FFFFFF] p-3 border border-[#3E2723]/30 rounded-lg text-xs space-y-1">
                <div>Quantity: <span className="font-semibold">{cans} Can(s)</span></div>
                <div>Schedule: <span className="font-semibold">{deliveryDate || 'Select Date'} | {timeSlot}</span></div>
                <div>Location: <span className="font-semibold">{area || 'Select Area'}</span></div>
                {isRecurring && (
                  <div className="text-[#4FC3F7] font-semibold">
                    ★ Recurring subscription: Delivers every {frequencyDays} days
                  </div>
                )}
              </div>
            </div>

            {/* API error banner */}
            {apiError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {apiError}
              </div>
            )}

            {/* Place Order Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4FC3F7] text-[#FFFFFF] font-bold rounded-lg hover:bg-[#0288D1] active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-[#4FC3F7] shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin" />
              ) : (
                isRecurring ? 'Place Recurring Order' : 'Place Order'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OrderForm;
