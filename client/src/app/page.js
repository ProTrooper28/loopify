'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const categories = [
    { id: 'cameras', label: 'Cameras', icon: '📷', color: 'from-blue-500 to-cyan-500' },
    { id: 'tripods', label: 'Tripods', icon: '📐', color: 'from-emerald-500 to-teal-500' },
    { id: 'microphones', label: 'Microphones', icon: '🎙️', color: 'from-purple-500 to-pink-500' },
    { id: 'lighting', label: 'Lighting', icon: '💡', color: 'from-amber-500 to-orange-500' },
    { id: 'lab-equipment', label: 'Lab Gear', icon: '🔬', color: 'from-red-500 to-rose-500' },
    { id: 'musical-instruments', label: 'Music', icon: '🎵', color: 'from-indigo-500 to-violet-500' },
];

const features = [
    { title: 'Verified Students', desc: 'Only campus-verified users can rent or list.', icon: '🎓' },
    { title: 'Secure Deposits', desc: 'Auto-refunded deposits protect both parties.', icon: '🔒' },
    { title: 'Instant Access', desc: 'Need something now? Rent within minutes.', icon: '⚡' },
    { title: 'Photo Proof', desc: 'Handover photos prevent disputes automatically.', icon: '📸' },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* BG effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent" />
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Trusted by 2,000+ students across campuses
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
                            <span className="text-white">Rent campus gear</span>
                            <br />
                            <span className="gradient-text">in minutes.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Cameras, tripods, lab equipment, and more — from verified students in your university.
                            Secure deposits, instant booking, and photo-verified handovers.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Link href="/explore" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                                Browse Equipment
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                            {!user && (
                                <Link href="/signup" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                                    Start Listing
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-heading text-center mb-12">Popular Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/explore?category=${cat.id}`} className="glass-card-hover p-6 text-center group">
                                <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                                <p className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">{cat.label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-heading text-center mb-4">Built for Trust</h2>
                    <p className="text-dark-400 text-center mb-12 max-w-xl mx-auto">Every feature designed to make peer-to-peer rentals safe, fast, and hassle-free.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group">
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-dark-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-heading text-center mb-12">How Loopify Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '01', title: 'Find & Book', desc: 'Browse gear near you, pick your dates, and request a booking.' },
                            { step: '02', title: 'Pay Securely', desc: 'Pay rental + deposit. Your deposit is auto-refunded on return.' },
                            { step: '03', title: 'Pickup & Return', desc: 'Take a photo at pickup and return for proof of condition.' },
                        ].map((s, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
                                    {s.step}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                                <p className="text-sm text-dark-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="glass-card p-10 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                            <p className="text-dark-300 mb-8 max-w-lg mx-auto">Join your campus community. List your idle gear or rent what you need — all within minutes.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/signup" className="btn-primary text-lg px-8 py-4">Create Account</Link>
                                <Link href="/explore" className="btn-secondary text-lg px-8 py-4">Explore Listings</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">L</div>
                            <span className="text-lg font-bold text-white">Loopify</span>
                        </div>
                        <div className="flex gap-6 text-sm text-dark-400">
                            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                            <span>Privacy</span>
                            <span>Terms</span>
                            <span>Support</span>
                        </div>
                        <p className="text-sm text-dark-500">© 2026 Loopify. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
