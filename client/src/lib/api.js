const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to make authenticated API requests
const apiFetch = async (endpoint, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('loopify_token') : null;

    const isFormData = options.body instanceof FormData;

    const config = {
        ...options,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
    };

    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Something went wrong');
    }

    return res.json();
};

// Auth
export const authAPI = {
    signup: (data) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => apiFetch('/auth/me'),
    verifyEmail: (token) => apiFetch(`/auth/verify-email/${token}`),
};

// Items
export const itemsAPI = {
    getAll: (params) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/items?${query}`);
    },
    getOne: (id) => apiFetch(`/items/${id}`),
    create: (formData) => apiFetch('/items', { method: 'POST', body: formData }),
    update: (id, formData) => apiFetch(`/items/${id}`, { method: 'PUT', body: formData }),
    updateStatus: (id, status) => apiFetch(`/items/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getMyListings: () => apiFetch('/items/my-listings'),
};

// Bookings
export const bookingsAPI = {
    create: (data) => apiFetch('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getMyBookings: () => apiFetch('/bookings/my-bookings'),
    getRequests: () => apiFetch('/bookings/requests'),
    getOne: (id) => apiFetch(`/bookings/${id}`),
    approve: (id) => apiFetch(`/bookings/${id}/approve`, { method: 'PATCH' }),
    reject: (id) => apiFetch(`/bookings/${id}/reject`, { method: 'PATCH' }),
    uploadPickup: (id, formData) => apiFetch(`/bookings/${id}/pickup`, { method: 'PATCH', body: formData }),
    uploadReturn: (id, formData) => apiFetch(`/bookings/${id}/return`, { method: 'PATCH', body: formData }),
    complete: (id) => apiFetch(`/bookings/${id}/complete`, { method: 'PATCH' }),
};

// Payments
export const paymentsAPI = {
    createOrder: (bookingId) => apiFetch('/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }) }),
    verify: (data) => apiFetch('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
    refund: (bookingId) => apiFetch(`/payments/refund/${bookingId}`, { method: 'POST' }),
    getTransactions: () => apiFetch('/payments/transactions'),
};

// Chat
export const chatAPI = {
    getConversations: () => apiFetch('/chat/conversations'),
    getMessages: (chatId) => apiFetch(`/chat/${chatId}`),
    sendMessage: (data) => apiFetch('/chat/send', { method: 'POST', body: JSON.stringify(data) }),
    markAsRead: (chatId) => apiFetch(`/chat/${chatId}/read`, { method: 'PATCH' }),
};

// Reviews
export const reviewsAPI = {
    create: (data) => apiFetch('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    getUserReviews: (userId) => apiFetch(`/reviews/user/${userId}`),
};

// Users
export const usersAPI = {
    getProfile: (id) => apiFetch(`/users/${id}`),
    updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    uploadPhoto: (formData) => apiFetch('/users/profile-photo', { method: 'PUT', body: formData }),
};

// Admin
export const adminAPI = {
    getStats: () => apiFetch('/admin/stats'),
    getUsers: (params) => apiFetch(`/admin/users?${new URLSearchParams(params)}`),
    getListings: (params) => apiFetch(`/admin/listings?${new URLSearchParams(params)}`),
    getTransactions: (params) => apiFetch(`/admin/transactions?${new URLSearchParams(params)}`),
    banUser: (id) => apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH' }),
    removeListing: (id) => apiFetch(`/admin/listings/${id}`, { method: 'DELETE' }),
};