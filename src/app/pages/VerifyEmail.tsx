import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const initialCode = searchParams.get('code') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [fallbackCode, setFallbackCode] = useState(initialCode);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < text.length; i++) {
            newOtp[i] = text[i];
        }
        setOtp(newOtp);
        const nextIndex = Math.min(text.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res: any = await authAPI.verifyEmail({ email, code });
            if (res?.success) {
                setSuccess('Email verified successfully! Redirecting to login...');
                setFallbackCode('');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err: any) {
            setError(err?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true);
        setError('');
        try {
            const res: any = await authAPI.resendVerification(email);
            if (res?.devCode) {
                setFallbackCode(res.devCode);
            }
            setSuccess(res?.message || 'New verification code sent!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => setSuccess(''), 4000);
        } catch (err: any) {
            setError(err?.message || 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">No email provided.</p>
                    <a href="/login" className="text-[#6B8E23] hover:underline mt-2 inline-block">Go to Login</a>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B8E23]/10 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-[#6B8E23]" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                    <p className="text-gray-500 text-sm mb-1">We've sent a 6-digit verification code to</p>
                    <p className="text-[#6B8E23] font-semibold text-sm mb-4">{email}</p>

                    {/* Fallback code display when email couldn't be sent */}
                    {fallbackCode && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                            <div className="flex items-center gap-2 justify-center text-amber-700 text-xs mb-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Email service unavailable. Use this code:</span>
                            </div>
                            <div className="text-2xl font-bold tracking-[6px] text-amber-800">{fallbackCode}</div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-2 mb-4 text-sm flex items-center gap-2 justify-center">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    {/* OTP Input */}
                    <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#6B8E23] focus:outline-none transition"
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white py-3 rounded-xl font-semibold hover:from-[#5B7A1E] hover:to-[#6B8E23] transition-all shadow-lg disabled:opacity-60 mb-4"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <div className="text-sm text-gray-500">
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resending || countdown > 0}
                            className="text-[#6B8E23] font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                        >
                            <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
