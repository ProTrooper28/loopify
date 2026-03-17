'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { itemsAPI, bookingsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BookingPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [durationType, setDurationType] = useState('daily');
    const [duration, setDuration] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');

    useEffect(() => {
        if (!user) return router.push('/login');
        itemsAPI.getOne(id).then(setItem).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!item) return null;

    const price = durationType === 'hourly' ? item.hourlyPrice : item.dailyPrice;
    const rentalCost = price * duration;
    const depositAmount = item.securityDeposit;
    const totalAmount = rentalCost + depositAmount;

    const getEndDate = () => {
        if (!startDate) return '';
        const start = new Date(`${startDate}T${startTime}`);
        if (durationType === 'hourly') {
            start.setHours(start.getHours() + duration);
        } else {
            start.setDate(start.getDate() + duration);
        }
        return start.toLocaleString();
    };

    const handleBook = async () => {
        if (!startDate) return toast.error('Please select a start date');
        setSubmitting(true);
        try {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(start);
            if (durationType === 'hourly') end.setHours(end.getHours() + duration);
            else end.setDate(end.getDate() + duration);

            await bookingsAPI.create({
                itemId: id, startDate: start.toISOString(), endDate: end.toISOString(),
                duration, durationType
            });

            toast.success('Booking requested! Waiting for owner approval.');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="section-heading mb-8">Book Equipment</h1>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Item Summary */}
                        <div className="glass-card p-5 flex gap-4">
                            <img src={item.photos?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'} alt="" className="w-20 h-20 rounded-xl object-cover" />
                            <div>
                                <h2 className="font-semibold text-white">{item.name}</h2>
                                <p className="text-xs text-dark-400 capitalize">{item.category} • {item.condition}</p>
                                <p className="text-xs text-dark-400 mt-1">📍 {item.pickupLocation}</p>
                            </div>
                        </div>

                        {/* Duration Type */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Rental Duration</h3>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {['hourly', 'daily'].map(t => (
                                    <button key={t} type="button" onClick={() => setDurationType(t)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${durationType === t
                                                ? 'border-primary-500 bg-primary-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                            }`}>
                                        <p className="text-sm font-semibold text-white capitalize">{t}</p>
                                        <p className="text-xl font-bold text-primary-400 mt-1">₹{t === 'hourly' ? item.hourlyPrice : item.dailyPrice}<span className="text-xs text-dark-400">/{t === 'hourly' ? 'hr' : 'day'}</span></p>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Start Time</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Duration ({durationType === 'hourly' ? 'hours' : 'days'})</label>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))} className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors">−</button>
                                    <span className="text-2xl font-bold text-white w-12 text-center">{duration}</span>
                                    <button type="button" onClick={() => setDuration(duration + 1)} className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors">+</button>
                                </div>
                            </div>

                            {startDate && (
                                <div className="mt-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                    <p className="text-xs text-primary-300">
                                        📅 Return by: <span className="font-medium">{getEndDate()}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-dark-300">
                                    <span>Rental ({duration} {durationType === 'hourly' ? 'hr' : 'day'}{duration > 1 ? 's' : ''} × ₹{price})</span>
                                    <span className="text-white font-medium">₹{rentalCost}</span>
                                </div>
                                <div className="flex justify-between text-dark-300">
                                    <span>Security Deposit</span>
                                    <span className="text-amber-400 font-medium">₹{depositAmount}</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold text-base">
                                    <span>Total</span>
                                    <span className="text-primary-400">₹{totalAmount}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-xs text-emerald-300">
                                    🔒 Deposit of ₹{depositAmount} will be refunded after successful return
                                </p>
                            </div>

                            <button
                                onClick={handleBook}
                                disabled={submitting || !startDate}
                                className="btn-primary w-full mt-6 disabled:opacity-50"
                            >
                                {submitting ? 'Requesting...' : 'Request Booking'}
                            </button>

                            <p className="text-xs text-dark-500 text-center mt-3">
                                Owner will review and approve your request
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
