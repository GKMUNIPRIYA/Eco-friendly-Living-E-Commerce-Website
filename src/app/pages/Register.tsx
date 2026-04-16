import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Validation helpers
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => !phone || /^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''));
const validatePincode = (pin: string) => !pin || /^\d{6}$/.test(pin);
const validatePassword = (pw: string) => pw.length >= 6 && /[A-Z]/.test(pw) && /\d/.test(pw);

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length < 2) errs.firstName = 'First name required (min 2 chars)';
    if (lastName.trim() && lastName.trim().length < 2) errs.lastName = 'Last name must be at least 2 chars if provided';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email';
    if (phone && !validatePhone(phone)) errs.phone = 'Invalid phone (10-15 digits)';
    if (pincode && !validatePincode(pincode)) errs.pincode = 'Pincode must be 6 digits';
    if (!password) errs.password = 'Password is required';
    else if (!validatePassword(password)) errs.password = 'Min 6 chars, 1 uppercase, 1 number';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);

    try {
      const res: any = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
      });

      if (res?.requiresVerification) {
        const params = new URLSearchParams({ email: res.email || email });
        if (res.devCode) params.set('code', res.devCode);
        navigate(`/verify-email?${params.toString()}`);
      } else if (res?.token && res?.user) {
        setSuccess('Registration successful! Logging you in...');
        login(res.token, res.user);
        setTimeout(() => navigate('/'), 1500);
      } else {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? <span className="text-red-500 text-xs mt-0.5 block">{fieldErrors[field]}</span> : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
        <p className="text-sm mb-4">
          Already have one?{' '}
          <a href="/login" className="text-[#6B8E23] hover:underline">
            Sign in
          </a>
        </p>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="off"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.firstName ? 'border-red-400' : ''}`} />
              <FieldError field="firstName" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="off"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.lastName ? 'border-red-400' : ''}`} />
              <FieldError field="lastName" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off"
              className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.email ? 'border-red-400' : ''}`} />
            <FieldError field="email" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="off"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.phone ? 'border-red-400' : ''}`} />
              <FieldError field="phone" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" autoComplete="off"
              className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bengaluru" autoComplete="off"
                className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Karnataka" autoComplete="off"
                className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode</label>
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="560001" autoComplete="off"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.pincode ? 'border-red-400' : ''}`} />
              <FieldError field="pincode" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.password ? 'border-red-400' : ''}`} />
              <FieldError field="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password"
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.confirmPassword ? 'border-red-400' : ''}`} />
              <FieldError field="confirmPassword" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#6B8E23] text-white py-2 rounded hover:bg-[#5B7A1E]">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
