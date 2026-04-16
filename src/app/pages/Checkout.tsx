import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { toFullUrl } from '../utils/imageUrl';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';

export default function Checkout() {
  const { cart, getCartSubtotal, getCartDiscount, getCartTotal, getItemDiscount, clearCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const MERCHANT_UPI_ID = 'skcita11uit007@okaxis';
  const MERCHANT_NAME = 'TerraKind';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'upi_qr' | 'verifying'>('form');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Countdown timer logic for the QR page
  useEffect(() => {
    if (checkoutStep !== 'upi_qr' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutStep, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Skip the wait and simulate detection (Demo Trigger)
  const simulateInstantSuccess = () => {
    handleConfirmUpi();
  };

  // REAL-TIME AUTO-DETECTION: Polls the server every 3 seconds
  // Once the payment "success" is detected (via simulated backend or trigger), redirects.
  useEffect(() => {
    let interval: any;
    if (activeOrderId && (checkoutStep === 'upi_qr' || checkoutStep === 'verifying')) {
      interval = setInterval(async () => {
        try {
          const resp: any = await ordersAPI.getById(activeOrderId);
          if (resp.success && resp.data.status === 'confirmed') {
            clearInterval(interval);
            clearCart();
            setCheckoutStep('verifying');
            setTimeout(() => {
              navigate(`/order-confirmation/${activeOrderId}`);
            }, 1000);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeOrderId, checkoutStep, navigate, clearCart]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setUpiIdCopied(true);
    setTimeout(() => setUpiIdCopied(false), 2000);
  };

  // Auto-fill form with registered user details
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.postalCode || '',
      }));
    }
  }, [user]);

  // immediate guard (placed after all hooks)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderData = {
      products: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        discount: getItemDiscount(item),
      })),
      customerInfo: {
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      },
      paymentInfo: { method: formData.paymentMethod === 'card' ? 'credit-card' : formData.paymentMethod === 'upi' ? 'upi' : 'cod' },
      shippingInfo: { method: 'standard' },
    };

    try {
      const resp: any = await ordersAPI.create(orderData);
      if (resp.success) {
        const orderId = resp.order?._id || resp.data?._id || resp.orderId;
        
        if (formData.paymentMethod === 'upi') {
          setActiveOrderId(orderId);
          setCheckoutStep('upi_qr');
        } else {
          clearCart();
          navigate(orderId ? `/order-confirmation/${orderId}` : '/');
        }
      } else {
        alert('Failed to place order: ' + (resp.error?.message || ''));
      }
    } catch (error: any) {
      alert('Unexpected error: ' + error.message);
    }
  };

  const handleConfirmUpi = async () => {
    if (!activeOrderId) return;
    setIsVerifying(true);
    setCheckoutStep('verifying');
    
    try {
      // 1. Tell the backend payment is done
      await ordersAPI.confirmUpi(activeOrderId);
      
      // 2. Clear cart and navigate IMMEDIATELY for a smooth "Success" message
      clearCart();
      
      // 3. Small delay to show the "Verifying" animation before success
      setTimeout(() => {
        navigate(`/order-confirmation/${activeOrderId}`);
      }, 1500);
    } catch (error: any) {
      alert('Verification failed: ' + error.message);
      setIsVerifying(false);
      setCheckoutStep('upi_qr');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = getCartSubtotal();
  const tax = Math.round(subtotal * 0.18);
  const total = getCartTotal(); // Use central calculation including discounts

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2">
            {checkoutStep === 'verifying' ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-[#6B8E23]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#6B8E23] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-[#5B6F1E] mb-2">Verifying Payment...</h2>
                <p className="text-gray-500">Processing your order successfully. Please wait.</p>
              </div>
            ) : checkoutStep === 'upi_qr' ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center flex flex-col items-center min-h-[400px] animate-in fade-in zoom-in">
                <div className="flex justify-between w-full mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 2: Secure Payment</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    Expires in {formatTime(timeLeft)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[#5B6F1E] mb-2">Scan QR & Pay</h2>
                <div className="bg-white p-4 border-4 border-[#F5F5DC] rounded-3xl shadow-xl my-6">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${MERCHANT_UPI_ID}&pn=${MERCHANT_NAME}&am=${total}&cu=INR`)}`} 
                    alt="Scan to Pay" 
                    className="w-56 h-56"
                  />
                </div>
                <div className="text-3xl font-black text-[#5B6F1E] mb-6">₹{total}</div>
                
                <div className="w-full max-w-md space-y-4">
                  <div className="bg-[#F5F5DC] p-4 rounded-2xl flex items-center justify-center gap-3 animate-pulse border border-[#6B8E23]/20">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8E23] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6B8E23]"></span>
                    </span>
                    <span className="text-[#6B8E23] font-bold text-sm">Securely Waiting for Payment...</span>
                  </div>

                  <button 
                    onClick={simulateInstantSuccess}
                    disabled={isVerifying}
                    className="w-full bg-[#6B8E23] text-white py-4 rounded-full font-bold hover:bg-[#5B6F1E] transition-all shadow-lg text-lg uppercase flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Verify Payment Status'
                    )}
                  </button>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 max-w-xs">
                  <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    Scan the QR code and complete your payment on GPay/PhonePe. 
                    Once done, click <strong>"Verify Payment Status"</strong> above or wait for automatic detection.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-8">
                  {/* Contact Info */}
                  <section>
                    <h2 className="text-xl font-bold text-[#5B6F1E] mb-4">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input type="text" name="fullName" placeholder="Full Name *" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                      <input type="email" name="email" placeholder="Email *" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                      <input type="tel" name="phone" placeholder="Phone Number *" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section>
                    <h2 className="text-xl font-bold text-[#5B6F1E] mb-4">Shipping Address</h2>
                    <textarea name="address" placeholder="Address *" required rows={2} value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23] mb-4" />
                    <div className="grid md:grid-cols-3 gap-4">
                      <input type="text" name="city" placeholder="City *" required value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                      <input type="text" name="state" placeholder="State *" required value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                      <input type="text" name="pincode" placeholder="Pincode *" required value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
                    </div>
                  </section>

                  {/* Payment Method */}
                  <section>
                    <h2 className="text-xl font-bold text-[#5B6F1E] mb-4">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives at the door', icon: '💵' },
                        { value: 'upi', label: 'Online UPI Payment', desc: 'Pay instantly via GPay, PhonePe, or any UPI app', icon: '📱' },
                      ].map((method) => (
                        <label key={method.value} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${formData.paymentMethod === method.value ? 'border-[#6B8E23] bg-[#F5F5DC]/30' : 'border-gray-100 hover:border-gray-200'}`}>
                          <input type="radio" name="paymentMethod" value={method.value} checked={formData.paymentMethod === method.value} onChange={handleChange} className="w-5 h-5 accent-[#6B8E23]" />
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <span className="block font-bold text-gray-800">{method.label}</span>
                            <span className="block text-xs text-gray-500 mt-0.5">{method.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </section>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-[#6B8E23] text-white py-4 rounded-full font-bold hover:bg-[#5B6F1E] transition-all text-lg shadow-lg active:scale-95 flex items-center justify-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      {formData.paymentMethod === 'upi' ? 'Proceed to Payment' : 'Confirm Order Successfully'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed px-4">
                      By placing this order, you agree to TerraKind's Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#5B6F1E] mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (18%)</span><span>₹{tax}</span></div>
                <div className="flex justify-between text-xl font-bold text-[#5B6F1E] pt-4 border-t mt-4">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
