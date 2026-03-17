'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') return router.push('/');
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [s, u, l, t] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers({}),
                adminAPI.getListings({}),
                adminAPI.getTransactions({})
            ]);
            setStats(s);
            setUsers(u.users || []);
            setListings(l.items || []);
            setTransactions(t.transactions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId) => {
        try {
            await adminAPI.banUser(userId);
            toast.success('User status updated');
            loadData();
        } catch (err) { toast.error(err.message); }
    };

    const handleRemoveListing = async (id) => {
        try {
            await adminAPI.removeListing(id);
            toast.success('Listing removed');
            loadData();
        } catch (err) { toast.error(err.message); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: 'Users' },
        { id: 'listings', label: 'Listings' },
        { id: 'transactions', label: 'Transactions' },
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <h1 className="section-heading">Admin Dashboard</h1>
                        <p className="text-dark-400 text-sm">Platform management & analytics</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-accent-500 text-white' : 'bg-white/5 text-dark-300 hover:bg-white/10'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">Total Users</p>
                            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">Total Items</p>
                            <p className="text-2xl font-bold text-primary-400">{stats.totalItems}</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">Total Bookings</p>
                            <p className="text-2xl font-bold text-accent-400">{stats.totalBookings}</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">Revenue</p>
                            <p className="text-2xl font-bold text-emerald-400">₹{stats.totalRevenue?.toLocaleString()}</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">Active Bookings</p>
                            <p className="text-2xl font-bold text-amber-400">{stats.activeBookings}</p>
                        </div>
                        <div className="glass-card p-4">
                            <p className="text-xs text-dark-400">New This Week</p>
                            <p className="text-2xl font-bold text-cyan-400">{stats.newUsersThisWeek}</p>
                        </div>
                    </div>
                )}

                {/* Users */}
                {activeTab === 'users' && (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">User</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Email</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">University</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Rating</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)}</div>
                                                    <span className="text-white">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-dark-300">{u.email}</td>
                                            <td className="px-4 py-3 text-dark-300">{u.university}</td>
                                            <td className="px-4 py-3 text-amber-400">{u.reputationScore?.toFixed(1)}</td>
                                            <td className="px-4 py-3">
                                                <span className={u.isBanned ? 'badge-red' : 'badge-green'}>{u.isBanned ? 'Banned' : 'Active'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleBan(u._id)} className={`text-xs ${u.isBanned ? 'btn-primary' : 'btn-danger'} !py-1 !px-3`}>
                                                    {u.isBanned ? 'Unban' : 'Ban'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Listings */}
                {activeTab === 'listings' && (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Item</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Owner</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Category</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Price</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listings.map(item => (
                                        <tr key={item._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 text-white">{item.name}</td>
                                            <td className="px-4 py-3 text-dark-300">{item.owner?.name}</td>
                                            <td className="px-4 py-3 text-dark-300 capitalize">{item.category}</td>
                                            <td className="px-4 py-3 text-primary-400">₹{item.hourlyPrice}/hr</td>
                                            <td className="px-4 py-3">
                                                <span className={item.status === 'active' ? 'badge-green' : item.status === 'deleted' ? 'badge-red' : 'badge-yellow'}>{item.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleRemoveListing(item._id)} className="text-xs btn-danger !py-1 !px-3">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Transactions */}
                {activeTab === 'transactions' && (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Date</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Payer</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Receiver</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Type</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Amount</th>
                                        <th className="text-left px-4 py-3 text-dark-400 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(txn => (
                                        <tr key={txn._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-4 py-3 text-dark-300">{new Date(txn.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-white">{txn.payer?.name}</td>
                                            <td className="px-4 py-3 text-dark-300">{txn.receiver?.name}</td>
                                            <td className="px-4 py-3"><span className="badge-primary capitalize">{txn.type}</span></td>
                                            <td className="px-4 py-3 text-primary-400 font-medium">₹{txn.amount}</td>
                                            <td className="px-4 py-3"><span className={txn.status === 'completed' ? 'badge-green' : 'badge-yellow'}>{txn.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
