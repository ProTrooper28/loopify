'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { itemsAPI, reviewsAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePhoto, setActivePhoto] = useState(0);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const [itemData, reviewData] = await Promise.all([
                itemsAPI.getOne(id),
                reviewsAPI.getUserReviews(id).catch(() => [])
            ]);
            setItem(itemData);
            setReviews(reviewData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-white">Item not found</h2>
            <Link href="/explore" className="btn-primary">Back to Explore</Link>
        </div>
    );

    const isOwner = user?.id === item.owner?._id;
    const conditionColors = { 'new': 'badge-green', 'like-new': 'badge-green', 'good': 'badge-primary', 'fair': 'badge-yellow', 'worn': 'badge-red' };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
                    <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                    <span>/</span>
                    <span className="capitalize">{item.category}</span>
                    <span>/</span>
                    <span className="text-dark-200">{item.name}</span>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Photos */}
                    <div className="lg:col-span-3">
                        <div className="glass-card overflow-hidden mb-4">
                            <div className="aspect-[16/10] relative">
                                <img
                                    src={item.photos?.[activePhoto] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                {item.instantAccess && (
                                    <div className="absolute top-4 left-4 badge bg-amber-500/90 text-white border-0 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                                        Instant Access
                                    </div>
                                )}
                            </div>
                        </div>
                        {item.photos?.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {item.photos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActivePhoto(i)}
                                        className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-primary-500 shadow-lg shadow-primary-500/30' : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <img src={photo} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="glass-card p-6 mt-6">
                            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                            <p className="text-dark-300 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Owner Reviews */}
                        {reviews.length > 0 && (
                            <div className="glass-card p-6 mt-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Reviews</h2>
                                <div className="space-y-4">
                                    {reviews.slice(0, 5).map((review, i) => (
                                        <div key={i} className="flex gap-3 pb-4 border-b border-white/5 last:border-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {review.reviewer?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-white">{review.reviewer?.name}</span>
                                                    <div className="flex text-amber-400">
                                                        {Array.from({ length: 5 }).map((_, j) => (
                                                            <svg key={j} className={`w-3 h-3 ${j < review.rating ? 'fill-current' : 'text-dark-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-dark-400">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Price Card */}
                        <div className="glass-card p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={conditionColors[item.condition] || 'badge-primary'}>{item.condition}</span>
                                <span className="badge bg-dark-700 text-dark-300 border border-white/10 capitalize">{item.category}</span>
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-4">{item.name}</h1>

                            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-white/10">
                                <div>
                                    <p className="text-xs text-dark-400 mb-1">Hourly</p>
                                    <p className="text-3xl font-bold text-primary-400">₹{item.hourlyPrice}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-dark-400 mb-1">Daily</p>
                                    <p className="text-2xl font-semibold text-dark-200">₹{item.dailyPrice}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs text-dark-400 mb-1">Deposit</p>
                                    <p className="text-lg font-semibold text-amber-400">₹{item.securityDeposit}</p>
                                </div>
                            </div>

                            {/* Rating */}
                            {item.rating > 0 && (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex text-amber-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < Math.round(item.rating) ? 'fill-current' : 'text-dark-600'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-dark-300">{item.rating.toFixed(1)} ({item.ratingCount} reviews)</span>
                                </div>
                            )}

                            {/* Location */}
                            <div className="flex items-center gap-2 mb-4 text-sm text-dark-300">
                                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {item.pickupLocation}
                            </div>

                            <div className="flex items-center gap-2 mb-6 text-sm text-dark-300">
                                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                {item.totalBookings} successful rentals
                            </div>

                            {/* Action Buttons */}
                            {!isOwner ? (
                                <div className="space-y-3">
                                    <Link href={user ? `/booking/${item._id}` : '/login'} className="btn-primary w-full text-center block">
                                        {user ? 'Book Now' : 'Login to Book'}
                                    </Link>
                                    {user && item.owner && (
                                        <Link href={`/chat?to=${item.owner._id}`} className="btn-secondary w-full text-center block">
                                            Message Owner
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link href={`/create-listing?edit=${item._id}`} className="btn-secondary w-full text-center block">Edit Listing</Link>
                                    <button
                                        onClick={async () => {
                                            await itemsAPI.updateStatus(item._id, item.status === 'paused' ? 'active' : 'paused');
                                            fetchItem();
                                        }}
                                        className="btn-secondary w-full"
                                    >
                                        {item.status === 'paused' ? 'Activate' : 'Pause'} Listing
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Owner Card */}
                        {item.owner && (
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-medium text-dark-400 mb-3">Listed by</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold overflow-hidden">
                                        {item.owner.profilePhoto ? (
                                            <img src={item.owner.profilePhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            item.owner.name?.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{item.owner.name}</p>
                                        <p className="text-xs text-dark-400">{item.owner.university}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <span className="text-xs text-dark-300">{item.owner.reputationScore?.toFixed(1)} reputation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
