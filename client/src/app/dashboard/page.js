'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { itemsAPI, bookingsAPI, paymentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const statusColors = {
    requested: 'badge-yellow', approved: 'badge-primary', rejected: 'badge-red',
    active: 'badge-green', returned: 'badge-primary', completed: 'badge-green',
    disputed: 'badge-red', cancelled: 'badge-red'
};

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('bookings');
    const [myBookings, setMyBookings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return router.push('/login');
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bookings, listings, reqs, txns] = await Promise.all([
                bookingsAPI.getMyBookings().catch(() => []),
                itemsAPI.getMyListings().catch(() => []),
                bookingsAPI.getRequests().catch(() => []),
                paymentsAPI.getTransactions().catch(() => [])
            ]);
            setMyBookings(bookings);
            setMyListings(listings);
            setRequests(reqs);
            setTransactions(txns);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await bookingsAPI.approve(id);
            toast.success('Booking approved!');
            loadData();
        } catch (err) { toast.error(err.message); }
    };

    const handleReject = async (id) => {
        try {
            await bookingsAPI.reject(id);
            toast.success('Booking rejected');
            loadData();
        } catch (err) { toast.error(err.message); }
    };

    const handleComplete = async (id) => {
        try {
            await bookingsAPI.complete(id);
            toast.success('Booking completed! Deposit refund initiated.');
            loadData();
        } catch (err) { toast.error(err.message); }
    };

    const tabs = [
        { id: 'bookings', label: 'My Bookings', count: myBookings.length },
        { id: 'listings', label: 'My Listings', count: myListings.length },
        { id: 'requests', label: 'Requests', count: requests.filter(r => r.status === 'requested').length },
        { id: 'transactions', label: 'History', count: transactions.length },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="section-heading">Dashboard</h1>
                        <p className="text-dark-400 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <Link href="/create-listing" className="btn-primary">
                        <span className="hidden sm:inline">+ New Listing</span>
                        <span className="sm:hidden">+</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-card p-4">
                        <p className="text-xs text-dark-400">Active Listings</p>
                        <p className="text-2xl font-bold text-white">{myListings.filter(l => l.status === 'active').length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-xs text-dark-400">Active Bookings</p>
                        <p className="text-2xl font-bold text-primary-400">{myBookings.filter(b => ['requested', 'approved', 'active'].includes(b.status)).length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-xs text-dark-400">Pending Requests</p>
                        <p className="text-2xl font-bold text-amber-400">{requests.filter(r => r.status === 'requested').length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-xs text-dark-400">Reputation</p>
                        <div className="flex items-center gap-1">
                            <p className="text-2xl font-bold text-emerald-400">{user?.reputationScore?.toFixed(1) || '5.0'}</p>
                            <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-white/5 text-dark-300 hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                                    }`}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* My Bookings Tab */}
                    {activeTab === 'bookings' && (
                        myBookings.length === 0 ? (
                            <div className="text-center py-16 glass-card">
                                <p className="text-4xl mb-3">📦</p>
                                <p className="text-dark-300">No bookings yet</p>
                                <Link href="/explore" className="btn-primary mt-4 inline-block">Browse Equipment</Link>
                            </div>
                        ) : (
                            myBookings.map(booking => (
                                <div key={booking._id} className="glass-card p-5 flex flex-col sm:flex-row gap-4">
                                    <img src={booking.item?.photos?.[0] || 'https://placehold.co/100'} alt="" className="w-full sm:w-24 h-32 sm:h-24 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-white">{booking.item?.name}</h3>
                                            <span className={statusColors[booking.status]}>{booking.status}</span>
                                        </div>
                                        <p className="text-xs text-dark-400 mb-2">
                                            {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()} • {booking.duration} {booking.durationType === 'hourly' ? 'hr' : 'day'}(s)
                                        </p>
                                        <p className="text-sm text-dark-300">Owner: {booking.owner?.name}</p>
                                        <p className="text-sm font-medium text-primary-400 mt-1">₹{booking.totalAmount}</p>
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {/* My Listings Tab */}
                    {activeTab === 'listings' && (
                        myListings.length === 0 ? (
                            <div className="text-center py-16 glass-card">
                                <p className="text-4xl mb-3">📝</p>
                                <p className="text-dark-300">No listings yet</p>
                                <Link href="/create-listing" className="btn-primary mt-4 inline-block">Create Listing</Link>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myListings.map(item => (
                                    <div key={item._id} className="glass-card overflow-hidden">
                                        <div className="aspect-video relative">
                                            <img src={item.photos?.[0] || 'https://placehold.co/400x200'} alt="" className="w-full h-full object-cover" />
                                            <span className={`absolute top-3 right-3 ${item.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{item.status}</span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-white text-sm mb-1">{item.name}</h3>
                                            <p className="text-xs text-dark-400 capitalize mb-2">{item.category}</p>
                                            <p className="text-sm text-primary-400 font-medium">₹{item.hourlyPrice}/hr • ₹{item.dailyPrice}/day</p>
                                            <div className="flex gap-2 mt-3">
                                                <Link href={`/items/${item._id}`} className="text-xs btn-secondary !py-1.5 !px-3 flex-1 text-center">View</Link>
                                                <button
                                                    onClick={async () => {
                                                        await itemsAPI.updateStatus(item._id, item.status === 'active' ? 'paused' : 'active');
                                                        toast.success(`Listing ${item.status === 'active' ? 'paused' : 'activated'}`);
                                                        loadData();
                                                    }}
                                                    className="text-xs btn-secondary !py-1.5 !px-3 flex-1"
                                                >
                                                    {item.status === 'active' ? 'Pause' : 'Activate'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        requests.length === 0 ? (
                            <div className="text-center py-16 glass-card">
                                <p className="text-4xl mb-3">📬</p>
                                <p className="text-dark-300">No booking requests</p>
                            </div>
                        ) : (
                            requests.map(booking => (
                                <div key={booking._id} className="glass-card p-5 flex flex-col sm:flex-row gap-4">
                                    <img src={booking.item?.photos?.[0] || 'https://placehold.co/100'} alt="" className="w-full sm:w-24 h-32 sm:h-24 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-white">{booking.item?.name}</h3>
                                            <span className={statusColors[booking.status]}>{booking.status}</span>
                                        </div>
                                        <p className="text-xs text-dark-400 mb-1">
                                            From: <span className="text-white">{booking.borrower?.name}</span> (⭐ {booking.borrower?.reputationScore?.toFixed(1)})
                                        </p>
                                        <p className="text-xs text-dark-400">
                                            {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()} • ₹{booking.totalAmount}
                                        </p>
                                        {booking.status === 'requested' && (
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => handleApprove(booking._id)} className="text-xs btn-primary !py-1.5 !px-4">Approve</button>
                                                <button onClick={() => handleReject(booking._id)} className="text-xs btn-danger !py-1.5 !px-4">Reject</button>
                                            </div>
                                        )}
                                        {booking.status === 'returned' && (
                                            <button onClick={() => handleComplete(booking._id)} className="text-xs btn-primary !py-1.5 !px-4 mt-3">
                                                Confirm Return & Refund Deposit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        transactions.length === 0 ? (
                            <div className="text-center py-16 glass-card">
                                <p className="text-4xl mb-3">💳</p>
                                <p className="text-dark-300">No transactions yet</p>
                            </div>
                        ) : (
                            <div className="glass-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left px-4 py-3 text-dark-400 font-medium">Date</th>
                                                <th className="text-left px-4 py-3 text-dark-400 font-medium">Type</th>
                                                <th className="text-left px-4 py-3 text-dark-400 font-medium">Amount</th>
                                                <th className="text-left px-4 py-3 text-dark-400 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(txn => (
                                                <tr key={txn._id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="px-4 py-3 text-dark-300">{new Date(txn.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={txn.type === 'refund' ? 'badge-green' : txn.type === 'deposit' ? 'badge-yellow' : 'badge-primary'}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-white font-medium">₹{txn.amount}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={txn.status === 'completed' ? 'badge-green' : 'badge-yellow'}>{txn.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
