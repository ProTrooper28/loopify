'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">L</div>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-dark-400 mt-2">Sign in to your Loopify account</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@university.edu" required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" required minLength={6}
                                className="input-field"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-dark-400">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link>
                        </p>
                    </div>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-dark-500 text-center mb-3">Demo Accounts</p>
                        <div className="space-y-2">
                            {[
                                { email: 'aarav@university.edu', label: 'Aarav (Owner)' },
                                { email: 'priya@university.edu', label: 'Priya (User)' },
                                { email: 'admin@loopify.com', label: 'Admin' }
                            ].map(demo => (
                                <button
                                    key={demo.email}
                                    type="button"
                                    onClick={() => { setEmail(demo.email); setPassword(demo.email.includes('admin') ? 'admin123' : 'password123'); }}
                                    className="w-full text-left px-3 py-2 text-xs text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    {demo.label}: <code className="text-primary-400">{demo.email}</code>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
