import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata = {
    title: 'Loopify — Campus Micro-Rental Platform',
    description: 'Rent equipment from verified students in your campus. Tripods, cameras, microphones, lab gear and more — available for hours or days.',
    keywords: 'campus rental, student equipment, micro rental, college gear, loopify',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-dark-950">
                <AuthProvider>
                    <Navbar />
                    <main className="pt-16">
                        {children}
                    </main>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#1e293b',
                                color: '#e2e8f0',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                            },
                            success: { duration: 3000, iconTheme: { primary: '#6366f1', secondary: '#fff' } },
                            error: { duration: 4000 },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
