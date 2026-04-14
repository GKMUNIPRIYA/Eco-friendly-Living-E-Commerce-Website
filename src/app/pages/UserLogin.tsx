import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await authAPI.login({ email, password });
      if (res && res.token) {
        // If this is an admin account, ask them to use the admin login page instead
        if (res.user?.role === 'admin') {
          setError('This is an admin account. Please use the admin login page.');
          setLoading(false);
          return;
        }

        localStorage.setItem('authToken', res.token);
        localStorage.setItem('authUser', JSON.stringify(res.user || {}));
        navigate('/'); // go to user-facing site
      } else {
        setError('Login failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Sign In to Your Account</h2>
        <p className="text-sm mb-4">
          Don't have an account?{' '}
          <a href="/register" className="text-[#6B8E23] hover:underline">
            Sign up
          </a>
        </p>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B8E23] text-white py-2 rounded hover:bg-[#5B7A1E]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

