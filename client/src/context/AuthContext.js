'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('loopify_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const data = await authAPI.getMe();
            setUser(data);
        } catch {
            localStorage.removeItem('loopify_token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('loopify_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const signup = async (formData) => {
        const data = await authAPI.signup(formData);
        localStorage.setItem('loopify_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('loopify_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
