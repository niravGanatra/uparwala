import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(credentials.email, credentials.password);
            toast.success('Login successful!');

            // Redirect based on user role
            if (user.is_staff || user.is_superuser) {
                navigate('/admin/dashboard');
            } else if (user.is_vendor) {
                navigate('/vendor/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            try {
                setLoading(true);
                const response = await api.post('/users/google/login/', {
                    code: codeResponse.code,
                });

                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                toast.success('Logged in with Google!');

                const user = response.data.user;
                if (user.is_staff || user.is_superuser) {
                    window.location.href = '/admin/dashboard';
                } else if (user.is_vendor) {
                    window.location.href = '/vendor/dashboard';
                } else {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Google login failed:', error);
                toast.error('Google login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Google login failed');
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-orange-600 mb-2">Uparwala</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                    <p className="text-base text-slate-600">Sign in to continue shopping</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    {/* Google Sign-In Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full mb-5"
                        size="lg"
                        onClick={() => googleLogin()}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email/Username Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    className="pl-12"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="pl-12 pr-12"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">Don't have an account?</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                        <Button variant="outline" className="w-full" size="lg">
                            Create Account
                        </Button>
                    </Link>
                </div>

                {/* Vendor Registration Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-600">
                        Want to sell on Uparwala?{' '}
                        <Link to="/vendor/register" className="text-orange-600 hover:text-orange-700 font-medium">
                            Become a Vendor
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
