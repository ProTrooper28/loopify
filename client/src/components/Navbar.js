'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
                            L
                        </div>
                        <span className="text-xl font-bold text-white">Loop<span className="text-primary-400">ify</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/explore" className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium">
                            Explore
                        </Link>
                        {user && (
                            <>
                                <Link href="/create-listing" className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium">
                                    List Item
                                </Link>
                                <Link href="/dashboard" className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/chat" className="px-4 py-2 text-dark-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium">
                                    Messages
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Auth / Profile */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                        {user.profilePhoto ? (
                                            <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-sm text-dark-200">{user.name?.split(' ')[0]}</span>
                                    <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl animate-fade-in">
                                        <div className="px-3 py-2 border-b border-white/10 mb-1">
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-dark-400">{user.email}</p>
                                        </div>
                                        <Link href="/profile" className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setProfileOpen(false)}>
                                            Profile
                                        </Link>
                                        <Link href="/dashboard" className="block px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setProfileOpen(false)}>
                                            Dashboard
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link href="/admin" className="block px-3 py-2 text-sm text-accent-400 hover:bg-white/5 rounded-lg" onClick={() => setProfileOpen(false)}>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { logout(); setProfileOpen(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="btn-secondary text-sm !py-2">Log in</Link>
                                <Link href="/signup" className="btn-primary text-sm !py-2">Sign up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-dark-300 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden glass-card mx-4 mb-4 p-4 animate-slide-up">
                    <Link href="/explore" className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Explore</Link>
                    {user ? (
                        <>
                            <Link href="/create-listing" className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>List Item</Link>
                            <Link href="/dashboard" className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                            <Link href="/chat" className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Messages</Link>
                            <Link href="/profile" className="block px-4 py-3 text-dark-200 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Profile</Link>
                            {user.role === 'admin' && <Link href="/admin" className="block px-4 py-3 text-accent-400 hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Admin</Link>}
                            <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg">Log out</button>
                        </>
                    ) : (
                        <div className="flex gap-2 mt-2 px-4">
                            <Link href="/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Log in</Link>
                            <Link href="/signup" className="btn-primary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Sign up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
