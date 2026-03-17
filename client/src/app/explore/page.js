'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { itemsAPI } from '../../lib/api';

const categories = [
    { id: 'all', label: 'All' },
    { id: 'cameras', label: 'Cameras' },
    { id: 'tripods', label: 'Tripods' },
    { id: 'microphones', label: 'Mics' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'lab-equipment', label: 'Lab Gear' },
    { id: 'musical-instruments', label: 'Music' },
    { id: 'tools', label: 'Tools' },
    { id: 'sports', label: 'Sports' },
    { id: 'other', label: 'Other' },
];

function ItemCard({ item }) {
    return (
        <Link href={`/items/${item._id}`} className="glass-card-hover overflow-hidden group">
            <div className="aspect-[4/3] relative overflow-hidden">
                <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.instantAccess && (
                    <div className="absolute top-3 left-3 badge-primary flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                        Instant
                    </div>
                )}
                <div className="absolute top-3 right-3 badge bg-dark-900/80 text-white border-0 backdrop-blur-sm">
                    {item.condition}
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{item.name}</h3>
                    {item.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-400 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-dark-400 mb-3">{item.category} • {item.pickupLocation}</p>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-primary-400">₹{item.hourlyPrice}</span>
                        <span className="text-xs text-dark-500">/hr</span>
                    </div>
                    <span className="text-xs text-dark-400">₹{item.dailyPrice}/day</span>
                </div>
                {item.owner && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[8px] font-bold overflow-hidden">
                            {item.owner.profilePhoto ? (
                                <img src={item.owner.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                                item.owner.name?.charAt(0)
                            )}
                        </div>
                        <span className="text-xs text-dark-400">{item.owner.name}</span>
                        <div className="flex items-center gap-1 ml-auto text-emerald-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-[10px]">{item.owner.reputationScore?.toFixed(1)}</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function ExplorePage() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [sort, setSort] = useState('newest');
    const [instantOnly, setInstantOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchItems();
    }, [category, sort, instantOnly, page]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12, sort };
            if (category !== 'all') params.category = category;
            if (instantOnly) params.instantAccess = 'true';
            if (search) params.search = search;

            const data = await itemsAPI.getAll(params);
            setItems(data.items);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Fetch items error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchItems();
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="section-heading mb-2">Explore Equipment</h1>
                    <p className="text-dark-400">Discover and rent gear from students near you</p>
                </div>

                {/* Search & Filters */}
                <div className="glass-card p-4 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search cameras, tripods, microphones..."
                                className="input-field pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-primary">Search</button>
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 flex-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategory(cat.id); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat.id
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                            : 'bg-white/5 text-dark-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); setPage(1); }}
                            className="input-field !w-auto text-sm"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low→High</option>
                            <option value="price-high">Price: High→Low</option>
                            <option value="rating">Top Rated</option>
                            <option value="popular">Most Booked</option>
                        </select>

                        {/* Instant Access Toggle */}
                        <button
                            onClick={() => { setInstantOnly(!instantOnly); setPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${instantOnly
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-white/5 text-dark-300 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                            Instant Access
                        </button>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="glass-card overflow-hidden">
                                <div className="aspect-[4/3] shimmer bg-white/5" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 shimmer bg-white/5 rounded w-3/4" />
                                    <div className="h-3 shimmer bg-white/5 rounded w-1/2" />
                                    <div className="h-5 shimmer bg-white/5 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
                        <p className="text-dark-400 mb-6">Try adjusting your search or filters</p>
                        <button onClick={() => { setSearch(''); setCategory('all'); setInstantOnly(false); }} className="btn-secondary">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary !py-2 disabled:opacity-30"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-dark-300 text-sm">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary !py-2 disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
