'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', university: '' });
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await signup({ name: form.name, email: form.email, password: form.password, university: form.university });
            toast.success('Account created! Check your email for verification.');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">L</div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-dark-400 mt-2">Join your campus community on Loopify</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                            <input type="text" value={form.name} onChange={update('name')} placeholder="John Doe" required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Campus Email</label>
                            <input type="email" value={form.email} onChange={update('email')} placeholder="you@university.edu" required className="input-field" />
                            <p className="text-xs text-dark-500 mt-1">Use your .edu email for campus verification</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">University</label>
                            <input type="text" value={form.university} onChange={update('university')} placeholder="Delhi University" required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                            <input type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required minLength={6} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Confirm Password</label>
                            <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" required className="input-field" />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-dark-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
