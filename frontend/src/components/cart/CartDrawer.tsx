import { useState, useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/useCart';
import { CartItem } from './CartItem';
import { BillSummary } from './BillSummary';
import { EmptyState } from '../common/EmptyState';

const DELIVERY_FEE = 40;
const PAYMENT_API = 'http://localhost:5000/api/payment';

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type ConfirmedOrder = {
  orderId: string;
  trackingUrl: string;
  totalAmount: number;
  itemCount: number;
};

function loadRazorpay(): Promise<boolean> {
  if ((window as any).Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(!!(window as any).Razorpay), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(!!(window as any).Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    billSummary,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const deliveryCharge = cart.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = billSummary.grandTotal + deliveryCharge;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = async () => {
    setCheckoutError('');
    const name = customerName.trim();
    const phone = customerPhone.replace(/\D/g, '');
    const email = customerEmail.trim();
    const address = deliveryAddress.trim();

    if (!name) {
      setCheckoutError('Please enter your full name.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setCheckoutError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckoutError('Please enter a valid email address.');
      return;
    }
    if (!address) {
      setCheckoutError('Please enter your full delivery address.');
      return;
    }

    setIsCheckingOut(true);
    try {
      // The backend validates itemsTotal against menu item prices. Existing GST and
      // bill charges are included in deliveryFee so the amount matches the displayed total.
      const itemsTotal = billSummary.itemTotal;
      const deliveryFee = billSummary.grandTotal - billSummary.itemTotal + deliveryCharge;
      const createResponse = await fetch(`${PAYMENT_API}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsTotal, deliveryFee }),
      });
      const paymentOrder = await createResponse.json();
      if (!createResponse.ok || !paymentOrder.success) {
        throw new Error(paymentOrder.message || 'Could not start payment. Please try again.');
      }

      const placeOrder = async (payment: RazorpayResponse) => {
        const orderResponse = await fetch(`${PAYMENT_API}/verify-and-place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            deliveryAddress: address,
            items: cart,
            itemsTotal,
            deliveryFee,
            totalAmount: grandTotal,
          }),
        });
        const result = await orderResponse.json();
        if (orderResponse.status !== 201 || !result.success || !result.order) {
          throw new Error(result.message || 'Could not confirm your order. Please contact the restaurant.');
        }
        setConfirmedOrder({
          orderId: result.order.orderId,
          trackingUrl: result.order.trackingUrl,
          totalAmount: grandTotal,
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
        clearCart();
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#c59b27', '#9b111e', '#f5d99b'],
          });
        } catch {
          // Ignore celebration failures; the confirmed order remains visible.
        }
      };

      const sdkReady = await loadRazorpay();
      if (!sdkReady) {
        throw new Error('Razorpay checkout could not be loaded. Please try again.');
      }

      new (window as any).Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        name: 'NFC Orders',
        description: 'Prepaid food order',
        order_id: paymentOrder.razorpayOrderId,
        handler: async (payment: RazorpayResponse) => {
          try {
            await placeOrder({
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
          } catch (error) {
            setCheckoutError(error instanceof Error ? error.message : 'Could not confirm your order.');
          } finally {
            setIsCheckingOut(false);
          }
        },
        modal: { ondismiss: () => setIsCheckingOut(false) },
        theme: { color: '#9b111e' },
      }).open();
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Could not start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleResetAfterOrder = () => {
    setConfirmedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryAddress('');
    setIsCartOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex justify-end animate-fadeIn"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-stone-100 h-full flex flex-col shadow-luxury border-l border-stone-200 animate-slideUp sm:animate-none overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-red-800 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-50 tracking-wide">Your Order</h3>
              <p className="text-[11px] text-amber-200/80 font-medium">
                Delivery Order
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">Payment Confirmed</span>
              <h3 className="font-serif font-black text-2xl text-stone-900">Order Received!</h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Your order token is <span className="font-bold text-stone-800">{confirmedOrder.orderId}</span>.
              </p>
            </div>
            <div className="w-full bg-white rounded-2xl p-4 border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex justify-between font-medium text-stone-600">
                <span>Total Items:</span><span className="font-bold text-stone-900">{confirmedOrder.itemCount} items</span>
              </div>
              <div className="flex justify-between font-serif text-sm">
                <span className="font-bold text-stone-900">Amount:</span>
                <span className="font-black text-brand-red-800">₹{confirmedOrder.totalAmount}</span>
              </div>
            </div>
            {confirmedOrder.trackingUrl && (
              <a
                href={confirmedOrder.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl border border-amber-600 text-amber-800 hover:bg-amber-50 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Track Live Order
              </a>
            )}
            <button
              onClick={handleResetAfterOrder}
              className="w-full py-3 rounded-xl bg-brand-red-700 hover:bg-brand-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
            >Start New Order</button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState type="cart" onAction={() => setIsCartOpen(false)} actionText="Explore Dishes" />
          </div>
        ) : (
          <>
            <div className="bg-white px-4 py-3 border-b border-stone-200 space-y-2 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    aria-label="Full Name"
                    autoComplete="name"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit Phone"
                    aria-label="10-digit Phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Customer Email"
                  aria-label="Customer Email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Full Address (flat/house number, street, landmark)"
                  aria-label="Full delivery address"
                  autoComplete="street-address"
                  rows={2}
                  className="w-full resize-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => <CartItem key={item.uniqueKey} item={item} />)}
              <div className="pt-2"><BillSummary bill={billSummary} diningMode="delivery" /></div>
              {deliveryCharge > 0 && (
                <div className="px-1 flex justify-between text-xs font-semibold text-stone-600">
                  <span>Delivery Charge</span><span className="text-stone-900">₹{deliveryCharge}</span>
                </div>
              )}
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="leading-snug">Food is prepared fresh to order. Real-time kitchen tracking available upon ordering.</p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-stone-200 shadow-luxury space-y-3 shrink-0 safe-bottom">
              {checkoutError && <p role="alert" className="text-xs text-red-700 font-medium">{checkoutError}</p>}
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-stone-500">Grand Total</span>
                <span className="font-serif font-black text-xl text-stone-900">₹{grandTotal}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={isCheckingOut}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-bold text-sm tracking-wide shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>{isCheckingOut ? 'Connecting to Payment…' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
