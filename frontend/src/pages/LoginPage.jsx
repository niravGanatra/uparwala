import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(credentials.identifier, credentials.password);

            toast.success('Login successful!', {
                duration: 2000,
                position: 'top-right',
            });

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
            toast.error('Invalid credentials. Please try again.', {
                duration: 3000,
                position: 'top-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',  // Use authorization code flow to avoid COOP errors
        onSuccess: async (codeResponse) => {
            try {
                setLoading(true);
                // Send authorization code to backend
                const response = await api.post('/users/google/login/', {
                    code: codeResponse.code,
                });

                // Store tokens with correct keys
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);

                toast.success('Logged in with Google!', {
                    duration: 2000,
                    position: 'top-right',
                });

                // Redirect based on user role
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
                toast.error('Google login failed. Please try again.', {
                    duration: 3000,
                    position: 'top-right',
                });
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Google login failed', {
                duration: 3000,
                position: 'top-right',
            });
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                    <p className="text-slate-600">Sign in to your account to continue</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Sign-In Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-2 hover:bg-slate-50"
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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Email/Username Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700">
                                Email or Username
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Enter your email or username"
                                    value={credentials.identifier}
                                    onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-slate-700">
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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

                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-orange-600 hover:underline font-semibold">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
