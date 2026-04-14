import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Leaf, Shield, RefreshCw } from 'lucide-react';
import CaptchaImage from '../components/CaptchaImage';

// Validation helpers
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Alphanumeric captcha generator
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captchaStr = '';
  for (let i = 0; i < 5; i++) { // user image showed 5 characters
    captchaStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { question: captchaStr, answer: captchaStr };
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Captcha state
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  // JS Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    /* 
    if (!captchaInput) errs.captcha = 'Please solve the captcha';
    else if (captchaInput.toLowerCase().replace(/\s/g, '') !== captcha.answer.toLowerCase()) {
      errs.captcha = 'Incorrect answer, try again';
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
    */
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('[ADMIN LOGIN] Clearing stale tokens and attempting fresh login...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      const res: any = await authAPI.login({ email, password });
      if (res && res.token) {
        if (res.user?.role !== 'admin') {
          setError('You are not an admin. Please use the user login page.');
          setLoading(false);
          return;
        }
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user || {}));
        navigate('/admin');
      } else {
        setError('Login failed - no token received');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login error';
      if (msg.includes('not found') || msg.includes('password') || msg.includes('invalid') || msg.includes('Invalid')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('Cannot reach') || msg.includes('localhost:3000')) {
        setError('Backend server is not running. Please start the server on port 3000 and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? <span className="text-red-300 text-xs mt-1 block">{fieldErrors[field]}</span> : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B8E23] rounded-full mb-4 shadow-xl">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TerraKind</h1>
          <p className="text-green-200 mt-1 text-sm">Admin Control Panel</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#8FBC5A]" />
            <h2 className="text-xl font-bold text-white">Admin Sign In</h2>
          </div>

          <p className="text-sm mb-6 text-green-100">
            Restricted area. Regular users should{' '}
            <a href="/login" className="underline text-[#8FBC5A] hover:text-white transition">
              sign in here
            </a>.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off" noValidate>
            <div>
              <label className="block text-sm font-medium text-green-100 mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="new-password"
                placeholder="admin@terrakind.com"
                className="block w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#8FBC5A] focus:bg-white/20 transition"
              />
              <FieldError field="email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-100 mb-2">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="block w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#8FBC5A] focus:bg-white/20 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError field="password" />
            </div>

            {/* Alphanumeric Captcha */}
            <div>
              <label className="block text-sm font-medium text-green-100 mb-2">What code is in the image? *</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded grow-0 shrink-0 w-[208px]">
                    <CaptchaImage text={captcha.question} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); }} 
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition flex-shrink-0" 
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
                <input
                  placeholder="Enter the characters (without spaces)"
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="block w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#8FBC5A] focus:bg-white/20 transition"
                />
              </div>
              <FieldError field="captcha" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white py-3 rounded-xl font-semibold hover:from-[#5B7A1E] hover:to-[#6B8E23] transition-all shadow-lg disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
