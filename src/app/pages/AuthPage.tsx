import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CaptchaImage from '../components/CaptchaImage';
import { RefreshCw } from 'lucide-react';

// Validation helpers
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => !phone || /^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''));
const validatePincode = (pin: string) => !pin || /^\d{6}$/.test(pin);
const validatePassword = (pw: string) => pw.length >= 6 && /[A-Z]/.test(pw) && /\d/.test(pw);

// Alphanumeric captcha generator
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captchaStr = '';
  for (let i = 0; i < 5; i++) {
    captchaStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { question: captchaStr, answer: captchaStr };
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const params = new URLSearchParams(location.search);
  const initialMode = params.get('mode') === 'signup' || location.pathname === '/register' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [rightActive, setRightActive] = useState(mode === 'signup');

  // fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Captcha state
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    setRightActive(mode === 'signup');
    setError('');
    setSuccess('');
    setFieldErrors({});
    if (mode === 'signin' || mode === 'signup') {
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
  }, [mode]);

  // JS Validation for Sign In
  const validateSignin = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!captchaInput) errs.captcha = 'Please solve the captcha';
    else if (captchaInput.toLowerCase().replace(/\s/g, '') !== captcha.answer.toLowerCase()) {
      errs.captcha = 'Incorrect answer, try again';
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // JS Validation for Sign Up
  const validateSignup = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) errs.firstName = 'First name is required (min 2 chars)';
    if (lastName.trim() && lastName.trim().length < 2) errs.lastName = 'Last name must be at least 2 chars if provided';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (phone && !validatePhone(phone)) errs.phone = 'Please enter a valid phone number (10-15 digits)';
    if (pincode && !validatePincode(pincode)) errs.pincode = 'Pincode must be exactly 6 digits';
    if (!password) errs.password = 'Password is required';
    else if (!validatePassword(password)) errs.password = 'Password must be min 6 chars with 1 uppercase and 1 number';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!captchaInput) errs.captcha = 'Please enter the characters';
    else if (captchaInput.toLowerCase().replace(/\s/g, '') !== captcha.answer.toLowerCase()) {
      errs.captcha = 'Incorrect characters, try again';
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateSignin()) return;
    setLoading(true);
    try {
      const res: any = await authAPI.login({ email, password });
      if (res && res.token) {
        if (res.user?.role === 'admin') {
          setError('This is an admin account. Please use the admin sign‑in page.');
          setLoading(false);
          return;
        }
        login(res.token, res.user || {});
        navigate('/');
      } else {
        setError('Login failed');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login error';
      // Check if the error response indicates unverified email
      if (msg.includes('verify your email') || msg.includes('EMAIL_NOT_VERIFIED')) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      if (msg.toLowerCase().includes('invalid email or password') || msg.toLowerCase().includes('no account')) {
        alert('No account found with that email. Please sign up.');
        setMode('signup');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const res: any = await authAPI.register({ firstName, lastName, email, password, confirmPassword, phone, dateOfBirth: dateOfBirth || undefined, address, city, state, pincode });
      if (res?.requiresVerification) {
        const params = new URLSearchParams({ email: res.email || email });
        if (res.devCode) params.set('code', res.devCode);
        navigate(`/verify-email?${params.toString()}`);
      } else {
        setSuccess('Registration successful! You can now sign in.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !validateEmail(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess('If an account exists, a reset code has been sent to your email.');
      setMode('reset');
    } catch (err: any) {
      setError(err?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!otp) { 
      setFieldErrors({ otp: 'Reset code is required' });
      return; 
    }
    if (!password || !validatePassword(password)) {
      setFieldErrors({ password: 'Password must be min 6 chars with 1 uppercase and 1 number' });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, password, confirmPassword });
      setSuccess('Password reset successful! You can now sign in with your new password.');
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
    } catch (err: any) {
      setError(err?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? <span className="text-red-500 text-xs mt-0.5 block">{fieldErrors[field]}</span> : null;

  return (
    <div className="auth-root min-h-screen flex items-center justify-center bg-gray-100 pt-24">
      <style>{`
        .container-auth { background: #fff; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22); position: relative; overflow: hidden; width: 100%; max-width: 768px; min-height: 650px; }
        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; overflow-y: auto; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        .container-auth.right-panel-active .sign-in-container { transform: translateX(100%); opacity: 0; z-index: 1; }
        .container-auth.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
        @keyframes show { 0%,49.99% { opacity:0; z-index:1 } 50%,100% { opacity:1; z-index:5 } }
        .overlay-container { position: absolute; top:0; left:50%; width:50%; height:100%; overflow:hidden; transition: transform 0.6s ease-in-out; z-index:100; }
        .container-auth.right-panel-active .overlay-container { transform: translateX(-100%); }
        .overlay { background: linear-gradient(to right, #6B8E23, #6B8E23); background-repeat:no-repeat; background-size:cover; color:#fff; position: relative; left:-100%; height:100%; width:200%; transform: translateX(0); transition: transform 0.6s ease-in-out; pointer-events: none; }
        .container-auth.right-panel-active .overlay { transform: translateX(50%); }
        .overlay-panel { position:absolute; display:flex; align-items:center; justify-content:center; flex-direction:column; padding: 0 40px; text-align:center; top:0; height:100%; width:50%; transition: transform 0.6s ease-in-out; pointer-events: auto; }
        .overlay-left { transform: translateX(-20%); }
        .container-auth.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right:0; transform: translateX(0); }
        .container-auth.right-panel-active .overlay-right { transform: translateX(20%); }
        .social { border:1px solid #ddd; border-radius:50%; display:inline-flex; justify-content:center; align-items:center; margin:0 5px; height:40px; width:40px; }
        .field-err input { border-color: #ef4444 !important; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .container-auth { min-height: 850px; display: flex; flex-direction: column; }
          .form-container { position: relative; width: 100% !important; height: auto !important; transform: none !important; opacity: 1 !important; z-index: 5 !important; }
          .sign-in-container, .sign-up-container { display: none; }
          .container-auth:not(.right-panel-active) .sign-in-container { display: flex; }
          .container-auth.right-panel-active .sign-up-container { display: flex; }
          .overlay-container { display: none; }
          .auth-root { padding-top: 10px; }
        }
      `}</style>

      <div className={`container-auth ${rightActive ? 'right-panel-active' : ''}`}>
        {/* Sign Up */}
        <div className="form-container sign-up-container flex items-start justify-center">
          <form onSubmit={handleSignup} className="h-full flex flex-col items-center justify-start py-10 px-6 w-full max-w-sm overflow-y-auto" autoComplete="off" noValidate>
            <h1 className="text-2xl font-bold mb-3">Create Account</h1>
            {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm mb-2 text-center">{success}</div>}
            <span className="mb-3 text-sm text-gray-500">Fill in your details to get started</span>
            <div className="w-full grid grid-cols-2 gap-2 mb-1">
              <div className={fieldErrors.firstName ? 'field-err' : ''}>
                <input placeholder="First name *" autoComplete="new-password" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="firstName" />
              </div>
              <div className={fieldErrors.lastName ? 'field-err' : ''}>
                <input placeholder="Last name" autoComplete="new-password" value={lastName} onChange={(e) => setLastName(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="lastName" />
              </div>
            </div>
            <div className={`w-full mb-1 ${fieldErrors.email ? 'field-err' : ''}`}>
              <input placeholder="Email *" type="email" autoComplete="new-password" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
              <FieldError field="email" />
            </div>
            <div className="w-full grid grid-cols-2 gap-2 mb-1">
              <div className={fieldErrors.phone ? 'field-err' : ''}>
                <input placeholder="Phone" type="tel" autoComplete="new-password" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="phone" />
              </div>
              <div>
                <input placeholder="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
              </div>
            </div>
            <div className="w-full mb-1">
              <input placeholder="Address" autoComplete="new-password" value={address} onChange={(e) => setAddress(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 mb-1">
              <input placeholder="City" autoComplete="new-password" value={city} onChange={(e) => setCity(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
              <input placeholder="State" autoComplete="new-password" value={state} onChange={(e) => setState(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
              <div className={fieldErrors.pincode ? 'field-err' : ''}>
                <input placeholder="Pincode" autoComplete="new-password" value={pincode} onChange={(e) => setPincode(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="pincode" />
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 mb-1">
              <div className={fieldErrors.password ? 'field-err' : ''}>
                <input placeholder="Password *" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="password" />
              </div>
              <div className={fieldErrors.confirmPassword ? 'field-err' : ''}>
                <input placeholder="Confirm Password *" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm" />
                <FieldError field="confirmPassword" />
              </div>
            </div>
            {/* Image Captcha */}
            <div className={`w-full mb-3 ${fieldErrors.captcha ? 'field-err' : ''} text-left`}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">What code is in the image?: <span className="text-orange-500">*</span></label>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-white border border-gray-200 p-1 rounded shadow-sm grow-0 shrink-0 w-[208px]">
                  <CaptchaImage text={captcha.question} />
                </div>
                <button 
                  type="button" 
                  onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); }} 
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition flex-shrink-0" 
                  title="Refresh Captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                placeholder="Enter the characters (without spaces)"
                type="text"
                autoComplete="off"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm"
              />
              <FieldError field="captcha" />
            </div>
            <button type="submit" disabled={loading} className="mt-2 bg-[#ff4b2b] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#ff3a1a] disabled:opacity-50 text-sm">{loading ? 'Creating...' : 'Sign Up'}</button>
            <div className="mt-4 md:hidden text-sm">
              Already have an account? <button type="button" onClick={() => { setMode('signin'); setRightActive(false); }} className="text-[#6B8E23] font-bold">Sign In</button>
            </div>
          </form>
        </div>

        {/* Sign In / Forgot Password / Reset Password */}
        <div className="form-container sign-in-container flex items-center justify-center">
          {mode === 'signin' && (
            <form onSubmit={handleSignin} className="h-full flex flex-col items-center justify-center p-8 w-full max-w-sm" autoComplete="off" noValidate>
              <h1 className="text-2xl font-bold mb-4">Sign in</h1>
              {error && <div className="text-red-600 text-sm mb-3 text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm mb-3 text-center">{success}</div>}

              <div className={`w-full mb-1 ${fieldErrors.email ? 'field-err' : ''}`}>
                <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300" />
                <FieldError field="email" />
              </div>
              <div className={`w-full mb-2 ${fieldErrors.password ? 'field-err' : ''}`}>
                <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300" />
                <FieldError field="password" />
              </div>
              {/* Image Captcha */}
              <div className={`w-full mb-4 ${fieldErrors.captcha ? 'field-err' : ''} text-left`}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">What code is in the image?: <span className="text-orange-500">*</span></label>
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-white border border-gray-200 p-1 rounded shadow-sm grow-0 shrink-0 w-[208px]">
                    <CaptchaImage text={captcha.question} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); }} 
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition flex-shrink-0" 
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                <input
                  placeholder="Enter the characters"
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-sm"
                />
                <FieldError field="captcha" />
              </div>
              <div className="w-full text-right mb-4">
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-gray-500 hover:text-[#6B8E23] hover:underline">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading} className="bg-[#ff4b2b] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#ff3a1a] transition-all active:scale-95 disabled:opacity-50">{loading ? 'Processing...' : 'Sign In'}</button>
              <div className="mt-6 md:hidden text-sm">
                Don't have an account? <button type="button" onClick={() => { setMode('signup'); setRightActive(true); }} className="text-[#6B8E23] font-bold">Sign Up</button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="h-full flex flex-col items-center justify-center p-8 w-full max-w-sm" autoComplete="off" noValidate>
              <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
              <p className="text-gray-500 text-sm mb-6 text-center">Enter your email address and we'll send you a 6-digit code to reset your password.</p>
              
              {error && <div className="text-red-600 text-sm mb-3 text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm mb-3 text-center">{success}</div>}

              <div className={`w-full mb-6 ${fieldErrors.email ? 'field-err' : ''}`}>
                <input placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300" />
                <FieldError field="email" />
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button type="submit" disabled={loading} className="bg-[#6B8E23] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#5B6F1E] transition-all active:scale-95 disabled:opacity-50 w-full">{loading ? 'Sending Code...' : 'Send Reset Code'}</button>
                <button type="button" onClick={() => setMode('signin')} className="text-sm text-gray-500 hover:text-[#6B8E23] py-2">Back to Sign In</button>
              </div>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="h-full flex flex-col items-center justify-center p-8 w-full max-w-sm" autoComplete="off" noValidate>
              <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
              <p className="text-gray-500 text-sm mb-6 text-center">We've sent a code to <strong>{email}</strong>. Enter it below with your new password.</p>

              {error && <div className="text-red-600 text-sm mb-3 text-center">{error}</div>}

              <div className={`w-full mb-3 ${fieldErrors.otp ? 'field-err' : ''}`}>
                <input placeholder="6-digit reset code" type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300 text-center font-bold tracking-widest text-lg" />
                <FieldError field="otp" />
              </div>

              <div className={`w-full mb-3 ${fieldErrors.password ? 'field-err' : ''}`}>
                <input placeholder="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300" />
                <FieldError field="password" />
              </div>

              <div className={`w-full mb-6 ${fieldErrors.confirmPassword ? 'field-err' : ''}`}>
                <input placeholder="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="p-2 w-full bg-gray-100 rounded border border-gray-300" />
                <FieldError field="confirmPassword" />
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button type="submit" disabled={loading} className="bg-[#6B8E23] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#5B6F1E] transition-all active:scale-95 disabled:opacity-50 w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
                <button type="button" onClick={() => setMode('signin')} className="text-sm text-gray-500 hover:text-[#6B8E23] py-2 text-center">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="max-w-xs mt-3">To keep connected with us please login with your personal info</p>
              <button className="mt-6 px-6 py-2 rounded-full border border-white text-white bg-transparent" onClick={() => { setMode('signin'); setRightActive(false); }}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="text-2xl font-bold">Hello, Friend!</h1>
              <p className="max-w-xs mt-3">Enter your personal details and start journey with us</p>
              <button className="mt-6 px-6 py-2 rounded-full border border-white text-white bg-transparent" onClick={() => { setMode('signup'); setRightActive(true); }}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}