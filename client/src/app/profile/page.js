'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, reviewsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, fetchUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({ name: '', phone: '', bio: '', university: '' });

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '', university: user.university || '' });
            reviewsAPI.getUserReviews(user.id).then(setReviews).catch(() => { });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await usersAPI.updateProfile(form);
            await fetchUser();
            setEditing(false);
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="section-heading mb-8">My Profile</h1>

                {/* Profile Card */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                                user.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                            <p className="text-dark-400">{user.email}</p>
                            <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start">
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="text-sm text-white font-medium">{user.reputationScore?.toFixed(1) || '5.0'}</span>
                                    <span className="text-xs text-dark-400">({user.ratingCount || 0} reviews)</span>
                                </div>
                                <span className={user.emailVerified ? 'badge-green' : 'badge-yellow'}>
                                    {user.emailVerified ? '✓ Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-300 mb-1">Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-1">University</label>
                                <input type="text" value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-1">Phone</label>
                                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-1">Bio</label>
                                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field resize-none" rows={3} maxLength={300} />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleSave} className="btn-primary">Save Changes</button>
                                <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-dark-400">University</span>
                                <span className="text-sm text-white">{user.university}</span>
                            </div>
                            {user.phone && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-dark-400">Phone</span>
                                    <span className="text-sm text-white">{user.phone}</span>
                                </div>
                            )}
                            {user.bio && (
                                <div>
                                    <span className="text-sm text-dark-400">Bio</span>
                                    <p className="text-sm text-white mt-1">{user.bio}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-dark-400">Member since</span>
                                <span className="text-sm text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-4">Edit Profile</button>
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Reviews ({reviews.length})</h2>
                    {reviews.length === 0 ? (
                        <p className="text-sm text-dark-400 text-center py-8">No reviews yet</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, i) => (
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
                    )}
                </div>
            </div>
        </div>
    );
}
