'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categories = [
    { id: 'cameras', label: 'Cameras' },
    { id: 'tripods', label: 'Tripods' },
    { id: 'microphones', label: 'Microphones' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'lab-equipment', label: 'Lab Equipment' },
    { id: 'tools', label: 'Tools' },
    { id: 'sports', label: 'Sports' },
    { id: 'musical-instruments', label: 'Musical Instruments' },
    { id: 'other', label: 'Other' },
];

const conditions = [
    { id: 'new', label: 'Brand New' },
    { id: 'like-new', label: 'Like New' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
    { id: 'worn', label: 'Well Worn' },
];

export default function CreateListingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [form, setForm] = useState({
        name: '', category: 'cameras', description: '',
        hourlyPrice: '', dailyPrice: '', securityDeposit: '',
        pickupLocation: '', condition: 'good', instantAccess: false
    });

    const update = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [field]: val });
    };

    const handlePhotos = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (i) => {
        setPhotos(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return router.push('/login');

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, val]) => formData.append(key, val));
            photos.forEach(photo => formData.append('photos', photo));

            const token = localStorage.getItem('loopify_token');
            const res = await fetch('http://localhost:5000/api/items', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error((await res.json()).message);

            toast.success('Listing created successfully!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Error creating listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="section-heading mb-2">Create Listing</h1>
                <p className="text-dark-400 mb-8">List your equipment and start earning</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photos */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
                        <div className="flex flex-wrap gap-4">
                            {previews.map((url, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            {previews.length < 5 && (
                                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <svg className="w-6 h-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span className="text-[10px] text-dark-500 mt-1">Add</span>
                                    <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-dark-500 mt-2">Up to 5 photos, max 5MB each</p>
                    </div>

                    {/* Details */}
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-white">Item Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Item Name *</label>
                            <input type="text" value={form.name} onChange={update('name')} placeholder="Canon EOS R5 Camera" required className="input-field" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Category *</label>
                                <select value={form.category} onChange={update('category')} className="input-field">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Condition *</label>
                                <select value={form.condition} onChange={update('condition')} className="input-field">
                                    {conditions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Description *</label>
                            <textarea value={form.description} onChange={update('description')} placeholder="Describe your item, what's included, any special notes..." required rows={4} className="input-field resize-none" />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-white">Pricing</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Hourly (₹) *</label>
                                <input type="number" value={form.hourlyPrice} onChange={update('hourlyPrice')} placeholder="100" required min="0" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Daily (₹) *</label>
                                <input type="number" value={form.dailyPrice} onChange={update('dailyPrice')} placeholder="500" required min="0" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Deposit (₹) *</label>
                                <input type="number" value={form.securityDeposit} onChange={update('securityDeposit')} placeholder="2000" required min="0" className="input-field" />
                            </div>
                        </div>
                    </div>

                    {/* Location & Instant */}
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-white">Pickup & Availability</h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Pickup Location *</label>
                            <input type="text" value={form.pickupLocation} onChange={update('pickupLocation')} placeholder="North Campus Library, Gate 2" required className="input-field" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.instantAccess} onChange={update('instantAccess')} className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500" />
                            <div>
                                <span className="text-sm font-medium text-white">⚡ Instant Access Mode</span>
                                <p className="text-xs text-dark-400">Allow borrowers to book instantly without waiting for approval</p>
                            </div>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}
